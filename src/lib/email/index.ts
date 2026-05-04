export type EmailTemplate = 
  | "application-approved"
  | "application-rejected"
  | "order-confirmed"
  | "invoice-ready"
  | "reorder-reminder";

export interface EmailPayload {
  to: string;
  template: EmailTemplate;
  variables: Record<string, unknown>;
}

function getStringVariable(variables: Record<string, unknown>, key: string, fallback = "") {
  const value = variables[key];
  if (typeof value === "number") return String(value);
  return typeof value === "string" ? value : fallback;
}

export function renderEmailBody(payload: EmailPayload): { subject: string; text: string; html: string } {
  if (payload.template === "application-approved") {
    const businessName = getStringVariable(payload.variables, "businessName", "your business");
    const loginUrl = getStringVariable(payload.variables, "loginUrl", process.env.NEXT_PUBLIC_APP_URL || "");
    const setPasswordUrl = getStringVariable(payload.variables, "setPasswordUrl");
    const subject = "Your Prime Pet wholesale account is approved";
    const text = setPasswordUrl
      ? `Great news. Your wholesale application for ${businessName} has been approved. Set your password here: ${setPasswordUrl}`
      : `Great news. Your wholesale application for ${businessName} has been approved. You can sign in here: ${loginUrl}`;
    const html = setPasswordUrl
      ? `<p>Great news. Your wholesale application for <strong>${businessName}</strong> has been approved.</p><p><a href="${setPasswordUrl}">Set your password</a></p><p>After setting your password, you can sign in here: <a href="${loginUrl}">Wholesale login</a></p>`
      : `<p>Great news. Your wholesale application for <strong>${businessName}</strong> has been approved.</p><p><a href="${loginUrl}">Sign in to your wholesale portal</a></p>`;
    return { subject, text, html };
  }

  if (payload.template === "application-rejected") {
    const subject = "Update on your Prime Pet wholesale application";
    const text = "Thank you for applying. We are unable to approve your wholesale account at this time. You can reply to this email for additional review.";
    const html = "<p>Thank you for applying. We are unable to approve your wholesale account at this time.</p><p>You can reply to this email for additional review.</p>";
    return { subject, text, html };
  }

  if (payload.template === "order-confirmed") {
    const orderNumber = getStringVariable(payload.variables, "orderNumber");
    const amount = getStringVariable(payload.variables, "amount");
    const subject = `Order ${orderNumber} confirmed`;
    const text = `Your payment was received and order ${orderNumber} is now confirmed. Total: $${amount}.`;
    const html = `<p>Your payment was received and order <strong>${orderNumber}</strong> is now confirmed.</p><p>Total: <strong>$${amount}</strong></p>`;
    return { subject, text, html };
  }

  if (payload.template === "invoice-ready") {
    const invoiceNumber = getStringVariable(payload.variables, "invoiceNumber");
    const invoiceUrl = getStringVariable(payload.variables, "invoiceUrl");
    const subject = `Invoice ${invoiceNumber} is ready`;
    const text = `Your invoice ${invoiceNumber} is ready. ACH is preferred when possible. View it here: ${invoiceUrl}`;
    const html = `<p>Your invoice <strong>${invoiceNumber}</strong> is ready.</p><p>ACH is preferred when possible.</p><p><a href="${invoiceUrl}">View invoice</a></p>`;
    return { subject, text, html };
  }

  const businessName = getStringVariable(payload.variables, "businessName", "there");
  const products = getStringVariable(payload.variables, "products", "your previous best sellers");
  const reorderUrl = getStringVariable(
    payload.variables,
    "reorderUrl",
    `${process.env.NEXT_PUBLIC_APP_URL || ""}/quick-order`
  );
  const subject = "Time to restock your yak chew assortment";
  const text = `Hi ${businessName}, your fast-moving items may be running low. Reorder ${products} in your wholesale portal: ${reorderUrl}`;
  const html = `<p>Hi ${businessName},</p><p>Your fast-moving items may be running low.</p><p>Suggested reorder: <strong>${products}</strong></p><p><a href="${reorderUrl}">Open quick order</a></p>`;
  return { subject, text, html };
}

export async function sendEmail(payload: EmailPayload) {
  if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL) {
    console.warn("RESEND_API_KEY/FROM_EMAIL not configured, email not sent");
    return { skipped: true };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/email/send`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Email service error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

export const emailTemplates: Record<EmailTemplate, { subject: string; preview: string }> = {
  "application-approved": {
    subject: "Your Prime Pet Wholesale Application is Approved!",
    preview: "Welcome to Prime Pet Wholesale! Your application has been approved.",
  },
  "application-rejected": {
    subject: "Prime Pet Wholesale Application Update",
    preview: "Thank you for applying to Prime Pet Wholesale.",
  },
  "order-confirmed": {
    subject: "Your Order is Confirmed",
    preview: "Your order has been received and confirmed.",
  },
  "invoice-ready": {
    subject: "Your Invoice is Ready",
    preview: "Your invoice is available for download.",
  },
  "reorder-reminder": {
    subject: "Time to Reorder Your Favorites",
    preview: "Don't run out of your favorite products.",
  },
};
