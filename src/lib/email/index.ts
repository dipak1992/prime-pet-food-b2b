export type EmailTemplate = 
  | "application-approved"
  | "application-rejected"
  | "order-confirmed"
  | "invoice-ready"
  | "reorder-reminder";

export interface EmailPayload {
  to: string;
  template: EmailTemplate;
  variables: Record<string, any>;
}

export async function sendEmail(payload: EmailPayload) {
  if (!process.env.EMAIL_SERVICE_API_KEY) {
    console.warn("EMAIL_SERVICE_API_KEY not configured, email not sent");
    return;
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
