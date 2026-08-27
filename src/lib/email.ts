import "server-only";
import { getResend, EMAIL_FROM, EMAIL_REPLY_TO } from "./resend";
import { formatPrice } from "./format";
import { siteUrl } from "./site";

// Every transactional email this app sends lives in this one file — three
// templates is well short of needing a separate templating system, and
// keeping them together makes the shared layout (and the brand voice) easy
// to keep consistent. Plain table-based HTML with inline styles throughout
// — email clients strip <style> blocks and ignore most modern CSS, so this
// is the one place in the codebase that intentionally doesn't use Tailwind.
type EmailItem = { name: string; price: number; qty: number };

function layout(preheader: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
  <body style="margin:0;padding:0;background-color:#f5f3ef;font-family:Georgia,'Times New Roman',serif;">
    <span style="display:none;font-size:1px;color:#f5f3ef;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f3ef;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border:1px solid #e5e1d8;">
            <tr>
              <td style="background-color:#141414;padding:28px 32px;">
                <span style="font-family:Georgia,serif;font-size:20px;letter-spacing:0.08em;color:#ffffff;">SAFALIGHT</span>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;border-top:1px solid #e5e1d8;font-size:12px;color:#7a7568;">
                SaFaLight &middot; <a href="${siteUrl}" style="color:#7a7568;">${siteUrl.replace(/^https?:\/\//, "")}</a><br />
                Questions? Reply to this email or write to
                <a href="mailto:${EMAIL_REPLY_TO}" style="color:#7a7568;">${EMAIL_REPLY_TO}</a>.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function itemsTable(items: EmailItem[]): string {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;font-size:14px;color:#141414;">${item.name} &times; ${item.qty}</td>
          <td style="padding:8px 0;font-size:14px;color:#141414;text-align:right;">${formatPrice(item.price * item.qty)}</td>
        </tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e1d8;border-bottom:1px solid #e5e1d8;margin:20px 0;padding:4px 0;">${rows}</table>`;
}

export async function sendOrderConfirmationEmail(order: {
  orderNumber: string;
  email: string;
  customerName: string;
  items: EmailItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
}): Promise<void> {
  const html = layout(
    `Order ${order.orderNumber} confirmed — thank you for your purchase.`,
    `
      <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;color:#b8935a;">Thank You</p>
      <h1 style="margin:0 0 16px;font-size:26px;font-weight:normal;color:#141414;">Order Confirmed</h1>
      <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#3a3730;">Hi ${order.customerName},</p>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3a3730;">
        Thank you for your purchase. We will send you an email when your product is shipped.
      </p>
      <p style="margin:0 0 4px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#7a7568;">Order Number</p>
      <p style="margin:0 0 20px;font-size:16px;color:#141414;font-weight:bold;">${order.orderNumber}</p>
      ${itemsTable(order.items)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#3a3730;">
        <tr><td style="padding:2px 0;">Subtotal</td><td style="padding:2px 0;text-align:right;">${formatPrice(order.subtotal)}</td></tr>
        <tr><td style="padding:2px 0;">Shipping</td><td style="padding:2px 0;text-align:right;">${order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}</td></tr>
        <tr><td style="padding:2px 0;">Tax</td><td style="padding:2px 0;text-align:right;">${formatPrice(order.taxAmount)}</td></tr>
        <tr><td style="padding:10px 0 0;font-size:16px;color:#141414;border-top:1px solid #e5e1d8;">Total</td><td style="padding:10px 0 0;font-size:16px;color:#141414;text-align:right;border-top:1px solid #e5e1d8;">${formatPrice(order.total)}</td></tr>
      </table>
    `
  );

  const text = `Order Confirmed

Hi ${order.customerName},

Thank you for your purchase. We will send you an email when your product is shipped.

Order Number: ${order.orderNumber}

${order.items.map((i) => `${i.name} x ${i.qty} — ${formatPrice(i.price * i.qty)}`).join("\n")}

Subtotal: ${formatPrice(order.subtotal)}
Shipping: ${order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}
Tax: ${formatPrice(order.taxAmount)}
Total: ${formatPrice(order.total)}

Questions? Reply to this email or write to ${EMAIL_REPLY_TO}.`;

  await getResend().emails.send({
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
    to: order.email,
    subject: `Order Confirmed — ${order.orderNumber}`,
    html,
    text,
  });
}

export async function sendShippedEmail(order: {
  orderNumber: string;
  email: string;
  customerName: string;
  trackingNumber: string;
  trackingUrl: string;
}): Promise<void> {
  const html = layout(
    `Order ${order.orderNumber} has shipped — track your delivery.`,
    `
      <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;color:#b8935a;">On Its Way</p>
      <h1 style="margin:0 0 16px;font-size:26px;font-weight:normal;color:#141414;">Your Order Has Shipped</h1>
      <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#3a3730;">Hi ${order.customerName},</p>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3a3730;">
        Good news — order <strong>${order.orderNumber}</strong> is on its way. You can track its progress below.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        <tr>
          <td style="background-color:#141414;">
            <a href="${order.trackingUrl}" style="display:inline-block;padding:14px 28px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#ffffff;text-decoration:none;">Track Your Order</a>
          </td>
        </tr>
      </table>
      <p style="margin:0;font-size:13px;color:#7a7568;">Tracking number: ${order.trackingNumber}</p>
    `
  );

  const text = `Your Order Has Shipped

Hi ${order.customerName},

Good news — order ${order.orderNumber} is on its way.

Tracking number: ${order.trackingNumber}
Track your order: ${order.trackingUrl}

Questions? Reply to this email or write to ${EMAIL_REPLY_TO}.`;

  await getResend().emails.send({
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
    to: order.email,
    subject: `Your Order Has Shipped — ${order.orderNumber}`,
    html,
    text,
  });
}

export async function sendEnquiryAutoReplyEmail(enquiry: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  const html = layout(
    "We've received your message and will be in touch soon.",
    `
      <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;color:#b8935a;">Thank You</p>
      <h1 style="margin:0 0 16px;font-size:26px;font-weight:normal;color:#141414;">We&rsquo;ve Received Your Message</h1>
      <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#3a3730;">Hi ${enquiry.name},</p>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3a3730;">
        Thank you for reaching out to SaFaLight. We&rsquo;ve received your message and will get back to you within 1&ndash;2 business days.
      </p>
      <p style="margin:0 0 4px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#7a7568;">Your Message</p>
      <p style="margin:0;padding:16px;background-color:#f5f3ef;font-size:14px;line-height:1.6;color:#3a3730;white-space:pre-wrap;">${escapeHtml(enquiry.message)}</p>
    `
  );

  const text = `We've Received Your Message

Hi ${enquiry.name},

Thank you for reaching out to SaFaLight. We've received your message and will get back to you within 1-2 business days.

Your message:
${enquiry.message}`;

  await getResend().emails.send({
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
    to: enquiry.email,
    subject: "We've Received Your Message — SaFaLight",
    html,
    text,
  });
}

export async function sendWholesaleApplicationReceivedEmail(applicant: {
  contactName: string;
  businessName: string;
  email: string;
}): Promise<void> {
  const html = layout(
    "We've received your trade account application.",
    `
      <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;color:#b8935a;">Thank You</p>
      <h1 style="margin:0 0 16px;font-size:26px;font-weight:normal;color:#141414;">Application Received</h1>
      <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#3a3730;">Hi ${applicant.contactName},</p>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3a3730;">
        Thank you for applying for a SaFaLight trade account on behalf of ${escapeHtml(applicant.businessName)}.
        We review every application personally and will be in touch shortly.
      </p>
    `
  );

  const text = `Application Received

Hi ${applicant.contactName},

Thank you for applying for a SaFaLight trade account on behalf of ${applicant.businessName}. We review every application personally and will be in touch shortly.`;

  await getResend().emails.send({
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
    to: applicant.email,
    subject: "Your SaFaLight Trade Application",
    html,
    text,
  });
}

export async function sendWholesaleApprovedEmail(account: {
  contactName: string;
  businessName: string;
  email: string;
  setPasswordUrl: string;
}): Promise<void> {
  const html = layout(
    "Your SaFaLight trade account is approved — set your password to log in.",
    `
      <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;color:#b8935a;">Welcome</p>
      <h1 style="margin:0 0 16px;font-size:26px;font-weight:normal;color:#141414;">Trade Account Approved</h1>
      <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#3a3730;">Hi ${account.contactName},</p>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3a3730;">
        ${escapeHtml(account.businessName)}&rsquo;s SaFaLight trade account is approved. Set a password below to
        log in and see your trade pricing.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="background-color:#141414;">
            <a href="${account.setPasswordUrl}" style="display:inline-block;padding:14px 28px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#ffffff;text-decoration:none;">Set Your Password</a>
          </td>
        </tr>
      </table>
      <p style="margin:16px 0 0;font-size:13px;color:#7a7568;">This link expires in 7 days.</p>
    `
  );

  const text = `Trade Account Approved

Hi ${account.contactName},

${account.businessName}'s SaFaLight trade account is approved. Set your password to log in and see your trade pricing:
${account.setPasswordUrl}

This link expires in 7 days.`;

  await getResend().emails.send({
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
    to: account.email,
    subject: "Your SaFaLight Trade Account Is Approved",
    html,
    text,
  });
}

// The message is customer-submitted free text embedded directly into HTML
// — escaped so it can't break out of its container or inject markup.
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
