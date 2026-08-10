"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const locations = ["navbar", "footer-explore", "footer-collections"] as const;

const menuItemSchema = z.object({
  label: z.string().min(1, "Required"),
  href: z.string().min(1, "Required"),
  location: z.enum(locations),
  sortOrder: z.coerce.number().int(),
});

export type MenuItemFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

function parseMenuItemForm(formData: FormData) {
  return menuItemSchema.safeParse({
    label: formData.get("label"),
    href: formData.get("href"),
    location: formData.get("location"),
    sortOrder: formData.get("sortOrder") || "0",
  });
}

// Navbar and Footer render on every page, so a link change needs the whole
// site tree to pick it up, not just one route.
function revalidateMenuPaths() {
  revalidatePath("/admin/menus");
  revalidatePath("/", "layout");
}

export async function createMenuItem(
  _prevState: MenuItemFormState,
  formData: FormData
): Promise<MenuItemFormState> {
  const parsed = parseMenuItemForm(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Check the highlighted fields.", fieldErrors };
  }

  await prisma.menuItem.create({ data: parsed.data });
  revalidateMenuPaths();
  redirect("/admin/menus");
}

export async function updateMenuItem(
  _prevState: MenuItemFormState,
  formData: FormData
): Promise<MenuItemFormState> {
  const id = String(formData.get("id") || "");
  if (!id) return { error: "Missing menu item id." };

  const parsed = parseMenuItemForm(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Check the highlighted fields.", fieldErrors };
  }

  await prisma.menuItem.update({ where: { id }, data: parsed.data });
  revalidateMenuPaths();
  return { success: true };
}

export async function deleteMenuItem(id: string) {
  await prisma.menuItem.delete({ where: { id } });
  revalidateMenuPaths();
  redirect("/admin/menus");
}
