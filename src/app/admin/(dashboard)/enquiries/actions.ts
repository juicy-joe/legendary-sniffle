"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function markEnquiryStatus(id: string, status: "NEW" | "READ" | "REPLIED") {
  await prisma.enquiry.update({ where: { id }, data: { status } });
  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${id}`);
}

export async function deleteEnquiry(id: string) {
  await prisma.enquiry.delete({ where: { id } });
  revalidatePath("/admin/enquiries");
  redirect("/admin/enquiries");
}
