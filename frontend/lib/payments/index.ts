import "server-only";
import { mockPaymentProvider } from "./mockProvider";
import type { PaymentProvider } from "./provider";

// Resolved lazily (not at module load) so an unset/blank env var never
// fails the build's static page-data collection — only an actual call
// at request time can throw.
export function getPaymentProvider(): PaymentProvider {
  const name = process.env.PAYMENT_PROVIDER || "mock";
  if (name !== "mock") {
    throw new Error(`Unknown PAYMENT_PROVIDER: ${name}`);
  }
  return mockPaymentProvider;
}

export type { CreateCheckoutInput, PaymentStatus } from "./provider";
