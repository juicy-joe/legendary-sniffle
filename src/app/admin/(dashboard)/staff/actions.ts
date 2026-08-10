"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { getSession } from "@/lib/get-session";

const roles = ["OWNER", "EDITOR"] as const;

const createSchema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().min(1, "Required").email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  role: z.enum(roles),
});

const updateSchema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().min(1, "Required").email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters").optional().or(z.literal("")),
  role: z.enum(roles),
});

export type StaffFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

async function requireOwner() {
  const session = await getSession();
  if (!session || session.role !== "OWNER") {
    return null;
  }
  return session;
}

export async function createStaff(
  _prevState: StaffFormState,
  formData: FormData
): Promise<StaffFormState> {
  const session = await requireOwner();
  if (!session) return { error: "Only owners can manage staff accounts." };

  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Check the highlighted fields.", fieldErrors };
  }

  const existing = await prisma.adminUser.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (existing) {
    return { error: "Check the highlighted fields.", fieldErrors: { email: "That email is already in use." } };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.adminUser.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash,
      role: parsed.data.role,
    },
  });

  revalidatePath("/admin/staff");
  redirect(`/admin/staff/${user.id}/edit`);
}

export async function updateStaff(
  _prevState: StaffFormState,
  formData: FormData
): Promise<StaffFormState> {
  const session = await requireOwner();
  if (!session) return { error: "Only owners can manage staff accounts." };

  const id = String(formData.get("id") || "");
  if (!id) return { error: "Missing staff id." };

  const parsed = updateSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password") || "",
    role: formData.get("role"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Check the highlighted fields.", fieldErrors };
  }

  const existing = await prisma.adminUser.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (existing && existing.id !== id) {
    return { error: "Check the highlighted fields.", fieldErrors: { email: "That email is already in use." } };
  }

  // Never let the last owner get demoted — that would lock everyone out of
  // staff management (and this screen) with no way back in except direct
  // database access.
  if (parsed.data.role !== "OWNER") {
    const target = await prisma.adminUser.findUnique({ where: { id } });
    if (target?.role === "OWNER") {
      const ownerCount = await prisma.adminUser.count({ where: { role: "OWNER" } });
      if (ownerCount <= 1) {
        return {
          error: "Check the highlighted fields.",
          fieldErrors: { role: "There must be at least one owner — promote someone else first." },
        };
      }
    }
  }

  const data: { name: string; email: string; role: "OWNER" | "EDITOR"; passwordHash?: string } = {
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    role: parsed.data.role,
  };
  if (parsed.data.password) {
    data.passwordHash = await hashPassword(parsed.data.password);
  }

  await prisma.adminUser.update({ where: { id }, data });
  revalidatePath("/admin/staff");
  revalidatePath(`/admin/staff/${id}/edit`);
  return { success: true };
}

export async function deleteStaff(id: string): Promise<{ error?: string } | void> {
  const session = await requireOwner();
  if (!session) return { error: "Only owners can manage staff accounts." };

  if (session.sub === id) {
    return { error: "You can't delete your own account while logged in as it." };
  }

  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (target?.role === "OWNER") {
    const ownerCount = await prisma.adminUser.count({ where: { role: "OWNER" } });
    if (ownerCount <= 1) {
      return { error: "Can't delete the last owner." };
    }
  }

  await prisma.adminUser.delete({ where: { id } });
  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}
