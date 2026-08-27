"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const validStatuses = ["NEW", "IN_REVIEW", "RESPONDED", "CLOSED"] as const;
type Status = (typeof validStatuses)[number];

export async function updateSpecialOrderRequestStatus(id: string, status: string): Promise<void> {
  if (!validStatuses.includes(status as Status)) return;
  await prisma.specialOrderRequest.update({ where: { id }, data: { status: status as Status } });
  revalidatePath("/admin/wholesale/requests");
}
