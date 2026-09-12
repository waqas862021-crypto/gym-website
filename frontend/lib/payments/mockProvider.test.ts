import { describe, it, expect } from "vitest";
import { mockPaymentProvider } from "./mockProvider";

describe("mock payment provider", () => {
  it("succeeds by default", async () => {
    const result = await mockPaymentProvider.createCheckoutSession({
      userId: "u1",
      planSlug: "monthly",
      amountSar: 100,
    });
    expect(result.status).toBe("succeeded");
  });

  it("fails when simulateFailure is set", async () => {
    const result = await mockPaymentProvider.createCheckoutSession({
      userId: "u1",
      planSlug: "monthly",
      amountSar: 100,
      simulateFailure: true,
    });
    expect(result.status).toBe("failed");
  });

  it("refund always returns refunded", async () => {
    const result = await mockPaymentProvider.refund("mock_succeeded_abc");
    expect(result.status).toBe("refunded");
  });

  it("getPaymentStatus reads the outcome back out of the providerRef", async () => {
    expect(await mockPaymentProvider.getPaymentStatus("mock_failed_x")).toBe("failed");
    expect(await mockPaymentProvider.getPaymentStatus("mock_refunded_x")).toBe("refunded");
    expect(await mockPaymentProvider.getPaymentStatus("mock_succeeded_x")).toBe("succeeded");
  });
});
