export type ShippingMethod = {
  id: string;
  label: string;
  detail: string;
  eta: string;
  price: number;
};

export const shippingMethods: ShippingMethod[] = [
  {
    id: "white-glove",
    label: "Complimentary White-Glove Delivery",
    detail: "Unpacked, inspected, and placed in your room of choice.",
    eta: "6–10 weeks · made to order",
    price: 0,
  },
  {
    id: "expedited",
    label: "Expedited White-Glove",
    detail: "Priority production slot with the same white-glove placement.",
    eta: "3–4 weeks",
    price: 450,
  },
  {
    id: "international",
    label: "International Air Freight",
    detail: "Door-to-door delivery with customs handling included.",
    eta: "8–12 weeks · outside US & Canada",
    price: 900,
  },
];
