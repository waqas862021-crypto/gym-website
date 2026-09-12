export type EmailType =
  | "welcome"
  | "payment_confirmation"
  | "renewal_reminder"
  | "membership_expired"
  | "contact_response"
  | "booking_confirmation";

export type EmailStatus = "sent" | "failed";

export type SendEmailInput = {
  to: string;
  subject: string;
  body: string;
  type: EmailType;
};

export interface EmailProvider {
  sendEmail(input: SendEmailInput): Promise<{ status: EmailStatus }>;
}
