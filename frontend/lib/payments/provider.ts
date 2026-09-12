export type PaymentStatus = "succeeded" | "failed" | "refunded";

export type CreateCheckoutInput = {
  userId: string;
  planSlug: string;
  amountSar: number;
  simulateFailure?: boolean;
};

export interface PaymentProvider {
  createCheckoutSession(
    input: CreateCheckoutInput,
  ): Promise<{ providerRef: string; status: PaymentStatus }>;
  getPaymentStatus(providerRef: string): Promise<PaymentStatus>;
  refund(providerRef: string): Promise<{ status: PaymentStatus }>;
}
