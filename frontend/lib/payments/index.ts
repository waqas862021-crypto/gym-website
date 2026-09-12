import "server-only";
import { mockPaymentProvider } from "./mockProvider";
import type { PaymentProvider } from "./provider";

function resolveProvider(): PaymentProvider {
  const name = process.env.PAYMENT_PROVIDER ?? "mock";
  if (name !== "mock") {
    throw new Error(`Unknown PAYMENT_PROVIDER: ${name}`);
  }
  return mockPaymentProvider;
}

export const paymentProvider = resolveProvider();
export type { CreateCheckoutInput, PaymentStatus } from "./provider";
