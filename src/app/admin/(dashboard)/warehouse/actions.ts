"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";

const movementSchema = z.object({
  productId: z.string().min(1, "Select a product."),
  type: z.enum(["IN", "OUT"], { message: "Select a direction." }),
  quantity: z.coerce.number().int("Whole numbers only.").positive("Must be greater than 0."),
  note: z.string().optional(),
  supplier: z.string().optional(),
  unitCost: z.coerce.number().int("Whole numbers only.").nonnegative("Can't be negative.").optional(),
});

export type MovementFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

function emptyToUndefined(value: FormDataEntryValue | null): FormDataEntryValue | undefined {
  return value && String(value).trim() ? value : undefined;
}

export async function logStockMovement(
  _prevState: MovementFormState,
  formData: FormData
): Promise<MovementFormState> {
  const parsed = movementSchema.safeParse({
    productId: formData.get("productId"),
    type: formData.get("type"),
    quantity: formData.get("quantity"),
    note: emptyToUndefined(formData.get("note")),
    supplier: emptyToUndefined(formData.get("supplier")),
    unitCost: emptyToUndefined(formData.get("unitCost")),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Check the highlighted fields.", fieldErrors };
  }

  const { productId, type, quantity, note, supplier, unitCost } = parsed.data;
  const session = await getSession();

  await prisma.$transaction([
    prisma.stockMovement.create({
      data: {
        productId,
        type,
        quantity,
        note: note ?? null,
        // Cost/supplier only make sense for restocking, but not enforced —
        // an admin correcting a bad OUT entry might still want to note who
        // supplied the original stock.
        supplier: supplier ?? null,
        unitCost: unitCost ?? null,
        loggedBy: session?.name ?? null,
      },
    }),
    prisma.product.update({
      where: { id: productId },
      data: { stockQuantity: { increment: type === "IN" ? quantity : -quantity } },
    }),
  ]);

  revalidatePath("/admin/warehouse");
  return { success: true };
}

const thresholdSchema = z.object({
  productId: z.string().min(1),
  lowStockThreshold: z.coerce.number().int().nonnegative(),
});

export async function updateLowStockThreshold(
  productId: string,
  lowStockThreshold: number
): Promise<{ error?: string }> {
  const parsed = thresholdSchema.safeParse({ productId, lowStockThreshold });
  if (!parsed.success) return { error: "Enter a whole number, 0 or more." };

  await prisma.product.update({
    where: { id: parsed.data.productId },
    data: { lowStockThreshold: parsed.data.lowStockThreshold },
  });
  revalidatePath("/admin/warehouse");
  return {};
}
