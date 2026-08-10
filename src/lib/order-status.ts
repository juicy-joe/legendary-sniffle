// A "use server" file may only export async functions, so this plain
// constant — needed both inside orders/actions.ts and directly in
// OrderStatusControl.tsx — lives in its own module.
export const orderStatuses = ["NEW", "CONFIRMED", "IN_PRODUCTION", "SHIPPED", "COMPLETED", "CANCELLED"] as const;
export type OrderStatusValue = (typeof orderStatuses)[number];
