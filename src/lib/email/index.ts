export type EmailTemplate = 
  | "application-received"
  | "application-approved"
  | "application-rejected"
  | "order-submitted"
  | "order-confirmed"
  | "order-status-updated"
  | "invoice-ready"
  | "support-acknowledgment"
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function textToHtml(text: string) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

export function renderEmailBody(payload: EmailPayload): { subject: string; text: string; html: string } {
  if (payload.template === "application-received") {
    const businessName = getStringVariable(payload.variables, "businessName", "your business");
    const subject = "We received your Prime Pet wholesale application";
    const text = `Thanks for applying for Prime Pet wholesale access for ${businessName}. Our team reviews most complete applications within one business day. If approved, you will receive portal access for protected pricing, case packs, invoices, and reorders.`;
    const html = `<p>Thanks for applying for Prime Pet wholesale access for <strong>${businessName}</strong>.</p><p>Our team reviews most complete applications within one business day.</p><p>If approved, you will receive portal access for protected pricing, case packs, invoices, and reorders.</p>`;
    return { subject, text, html };
  }

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

  if (payload.template === "order-submitted") {
    const orderNumber = getStringVariable(payload.variables, "orderNumber");
    const amount = getStringVariable(payload.variables, "amount");
    const orderUrl = getStringVariable(payload.variables, "orderUrl");
    const subject = `Order request ${orderNumber} received`;
    const text = `We received your wholesale order request ${orderNumber}. Estimated total: $${amount}. Our team will review inventory and send your invoice before fulfillment.${orderUrl ? ` View it here: ${orderUrl}` : ""}`;
    const html = `<p>We received your wholesale order request <strong>${orderNumber}</strong>.</p><p>Estimated total: <strong>$${amount}</strong></p><p>Our team will review inventory and send your invoice before fulfillment.</p>${orderUrl ? `<p><a href="${orderUrl}">View order</a></p>` : ""}`;
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

  if (payload.template === "order-status-updated") {
    const orderNumber = getStringVariable(payload.variables, "orderNumber");
    const status = getStringVariable(payload.variables, "status").replace(/_/g, " ").toLowerCase();
    const trackingNumber = getStringVariable(payload.variables, "trackingNumber");
    const trackingUrl = getStringVariable(payload.variables, "trackingUrl");
    const orderUrl = getStringVariable(payload.variables, "orderUrl");
    const subject = `Order ${orderNumber} status updated`;
    const trackingText = trackingNumber ? ` Tracking: ${trackingNumber}${trackingUrl ? ` (${trackingUrl})` : ""}.` : "";
    const text = `Your order ${orderNumber} is now ${status}.${trackingText}${orderUrl ? ` View details: ${orderUrl}` : ""}`;
    const html = `<p>Your order <strong>${orderNumber}</strong> is now <strong>${status}</strong>.</p>${trackingNumber ? `<p>Tracking: <strong>${trackingNumber}</strong>${trackingUrl ? ` · <a href="${trackingUrl}">Track shipment</a>` : ""}</p>` : ""}${orderUrl ? `<p><a href="${orderUrl}">View order details</a></p>` : ""}`;
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

  if (payload.template === "support-acknowledgment") {
    const ticketNumber = getStringVariable(payload.variables, "ticketNumber");
    const subjectText = getStringVariable(payload.variables, "subject", "your request");
    const requestType = getStringVariable(payload.variables, "requestType", "support request").replace(/_/g, " ").toLowerCase();
    const ticketUrl = getStringVariable(payload.variables, "ticketUrl");
    const subject = `We received ${subjectText}`;
    const text = `We received your ${requestType}: ${subjectText}. Reference: ${ticketNumber}. Our wholesale team will follow up within one business day.${ticketUrl ? ` View it here: ${ticketUrl}` : ""}`;
    const html = `<p>We received your ${requestType}: <strong>${subjectText}</strong>.</p><p>Reference: <strong>${ticketNumber}</strong></p><p>Our wholesale team will follow up within one business day.</p>${ticketUrl ? `<p><a href="${ticketUrl}">View request</a></p>` : ""}`;
    return { subject, text, html };
  }

  const businessName = getStringVariable(payload.variables, "businessName", "there");
  const products = getStringVariable(payload.variables, "products", "your previous best sellers");
  const productLines = getStringVariable(payload.variables, "productLines", products);
  const customSubject = getStringVariable(payload.variables, "subject");
  const bodyText = getStringVariable(payload.variables, "bodyText");
  const reorderUrl = getStringVariable(
    payload.variables,
    "reorderUrl",
    `${process.env.NEXT_PUBLIC_APP_URL || ""}/quick-order`
  );
  const subject = customSubject || "Time to restock your yak chew assortment";
  const text = bodyText
    ? `${bodyText}\n\nSuggested reorder:\n${productLines}\n\nOpen quick order: ${reorderUrl}`
    : `Hi ${businessName}, your fast-moving items may be running low. Reorder ${products} in your wholesale portal: ${reorderUrl}`;
  const html = bodyText
    ? `${textToHtml(bodyText)}<p>Suggested reorder:<br /><strong>${escapeHtml(productLines).replace(/\n/g, "<br />")}</strong></p><p><a href="${reorderUrl}">Open quick order</a></p>`
    : `<p>Hi ${businessName},</p><p>Your fast-moving items may be running low.</p><p>Suggested reorder: <strong>${escapeHtml(products)}</strong></p><p><a href="${reorderUrl}">Open quick order</a></p>`;
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
  "application-received": {
    subject: "We Received Your Wholesale Application",
    preview: "Your Prime Pet wholesale application has been received.",
  },
  "application-approved": {
    subject: "Your Prime Pet Wholesale Application is Approved!",
    preview: "Welcome to Prime Pet Wholesale! Your application has been approved.",
  },
  "application-rejected": {
    subject: "Prime Pet Wholesale Application Update",
    preview: "Thank you for applying to Prime Pet Wholesale.",
  },
  "order-submitted": {
    subject: "Your Order Request Was Received",
    preview: "Your wholesale order request has been received.",
  },
  "order-confirmed": {
    subject: "Your Order is Confirmed",
    preview: "Your order has been received and confirmed.",
  },
  "order-status-updated": {
    subject: "Your Order Status Was Updated",
    preview: "Your wholesale order has a new status.",
  },
  "invoice-ready": {
    subject: "Your Invoice is Ready",
    preview: "Your invoice is available for download.",
  },
  "support-acknowledgment": {
    subject: "We Received Your Request",
    preview: "Your quote or support request has been received.",
  },
  "reorder-reminder": {
    subject: "Time to Reorder Your Favorites",
    preview: "Don't run out of your favorite products.",
  },
};
