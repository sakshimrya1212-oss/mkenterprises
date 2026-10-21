import { describe, expect, it } from "vitest";
import { computeTotals } from "./pricing";

describe("pricing", () => {
  it("MK15 gives 15% off at ₹499+", () => {
    const t = computeTotals([{ sku: "MK-KNG-30", qty: 1 }], "mk15", "online"); // 749
    expect(t.discount).toBe(112);
    expect(t.shipping).toBe(0);
  });
  it("MK15 rejected below ₹499", () => {
    const t = computeTotals([{ sku: "MK-ARG-200", qty: 1 }], "MK15", "online"); // 229
    expect(t.discount).toBe(0);
    expect(t.shipping).toBe(49);
  });
  it("COD adds ₹40", () => {
    const t = computeTotals([{ sku: "MK-KNG-30", qty: 1 }], null, "cod");
    expect(t.total).toBe(789);
  });
  it("COD disabled above ₹5000", () => {
    const t = computeTotals([{ sku: "MK-KNG-30", qty: 8 }], null, "cod");
    expect(t.codAllowed).toBe(false);
  });
});
