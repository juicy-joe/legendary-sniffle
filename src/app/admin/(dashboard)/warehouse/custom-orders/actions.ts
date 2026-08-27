"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";

const customOrderStatuses = ["QUOTED", "CONFIRMED", "IN_PRODUCTION", "COMPLETED", "DELIVERED"] as const;
type CustomOrderStatusValue = (typeof customOrderStatuses)[number];

const customOrderSchema = z.object({
  productId: z.string().min(1, "Select a product."),
  quantity: z.coerce.number().int("Whole numbers only.").positive("Must be greater than 0."),
  customerName: z.string().min(1, "Required."),
  customerEmail: z.string().email("Enter a valid email."),
  targetCompletionDate: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomOrderFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function emptyToUndefined(value: FormDataEntryValue | null): FormDataEntryValue | undefined {
  return value && String(value).trim() ? value : undefined;
}

export async function createCustomOrder(
  _prevState: CustomOrderFormState,
  formData: FormData
): Promise<CustomOrderFormState> {
  const parsed = customOrderSchema.safeParse({
    productId: formData.get("productId"),
    quantity: formData.get("quantity"),
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail"),
    targetCompletionDate: emptyToUndefined(formData.get("targetCompletionDate")),
    notes: emptyToUndefined(formData.get("notes")),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Check the highlighted fields.", fieldErrors };
  }

  const { productId, quantity, customerName, customerEmail, targetCompletionDate, notes } = parsed.data;

  const order = await prisma.customOrder.create({
    data: {
      productId,
      quantity,
      customerName,
      customerEmail,
      notes: notes ?? null,
      targetCompletionDate: targetCompletionDate ? new Date(targetCompletionDate) : null,
    },
  });

  revalidatePath("/admin/warehouse/custom-orders");
  redirect(`/admin/warehouse/custom-orders/${order.id}`);
}

export async function updateCustomOrderStatus(id: string, status: string): Promise<void> {
  if (!customOrderStatuses.includes(status as CustomOrderStatusValue)) return;
  await prisma.customOrder.update({ where: { id }, data: { status: status as CustomOrderStatusValue } });
  revalidatePath("/admin/warehouse/custom-orders");
  revalidatePath(`/admin/warehouse/custom-orders/${id}`);
}

const releaseSchema = z.object({
  customOrderId: z.string().min(1),
  quantity: z.coerce.number().int("Whole numbers only.").positive("Must be greater than 0."),
  note: z.string().optional(),
});

export type ReleaseSurplusState = {
  error?: string;
};

// Moves surplus units from a custom production run into general retail
// stock — a normal StockMovement (type IN), tagged back to the CustomOrder
// for traceability, but CustomOrder.quantity itself is never touched: it
// always means "how many were commissioned," not "how many are left to
// release." A run can release stock in more than one batch, so this can be
// called repeatedly against the same CustomOrder.
export async function releaseSurplusToStock(
  _prevState: ReleaseSurplusState,
  formData: FormData
): Promise<ReleaseSurplusState> {
  const parsed = releaseSchema.safeParse({
    customOrderId: formData.get("customOrderId"),
    quantity: formData.get("quantity"),
    note: emptyToUndefined(formData.get("note")),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the highlighted fields." };
  }

  const { customOrderId, quantity, note } = parsed.data;
  const customOrder = await prisma.customOrder.findUnique({
    where: { id: customOrderId },
    select: { productId: true },
  });
  if (!customOrder) return { error: "That custom order no longer exists." };

  const session = await getSession();

  await prisma.$transaction([
    prisma.stockMovement.create({
      data: {
        productId: customOrder.productId,
        type: "IN",
        quantity,
        note: note ?? "Surplus released from custom order",
        customOrderId,
        loggedBy: session?.name ?? null,
      },
    }),
    prisma.product.update({
      where: { id: customOrder.productId },
      data: { stockQuantity: { increment: quantity } },
    }),
  ]);

  revalidatePath("/admin/warehouse");
  revalidatePath(`/admin/warehouse/custom-orders/${customOrderId}`);
  return {};
}

export async function deleteCustomOrder(id: string): Promise<void> {
  // StockMovement.customOrderId is ON DELETE SET NULL — any surplus
  // already released stays on the books, it just loses the back-link to
  // this record. The ledger, not this planning record, is the source of
  // truth for what actually happened to stock.
  await prisma.customOrder.delete({ where: { id } });
  revalidatePath("/admin/warehouse/custom-orders");
  redirect("/admin/warehouse/custom-orders");
}
