import "server-only";
import { randomUUID } from "node:crypto";
import type { PaymentProvider, PaymentStatus } from "./provider";

// The providerRef encodes its own outcome (mock_<status>_<id>) since this
// mock has no real gateway ledger to look status up from later.
export const mockPaymentProvider: PaymentProvider = {
  async createCheckoutSession({ simulateFailure }) {
    const status: PaymentStatus = simulateFailure ? "failed" : "succeeded";
    return { providerRef: `mock_${status}_${randomUUID()}`, status };
  },

  async getPaymentStatus(providerRef) {
    if (providerRef.startsWith("mock_failed_")) return "failed";
    if (providerRef.startsWith("mock_refunded_")) return "refunded";
    return "succeeded";
  },

  async refund() {
    return { status: "refunded" };
  },
};
