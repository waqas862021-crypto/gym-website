import "server-only";
import type { EmailProvider } from "./provider";

export const mockEmailProvider: EmailProvider = {
  async sendEmail({ to, subject, type, body }) {
    console.log(`[mock email] to=${to} type=${type} subject="${subject}"\n${body}`);
    return { status: "sent" };
  },
};
