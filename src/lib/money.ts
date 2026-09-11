export type QuoteLineInput = {
  quantity: number;
  unitPricePaise: number;
  gstRateBasisPoints: number;
};

export function rupeesToPaise(value: number) {
  if (!Number.isFinite(value) || value < 0) throw new Error("Amount must be a non-negative number.");
  return Math.round(value * 100);
}

export function paiseToRupees(value: number) {
  return value / 100;
}

export function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);
}

export function calculateQuoteTotals(lines: QuoteLineInput[], discountPaise = 0) {
  const subtotalPaise = lines.reduce((sum, line) => {
    if (!Number.isInteger(line.quantity) || line.quantity < 1) throw new Error("Quantity must be at least one.");
    return sum + line.quantity * line.unitPricePaise;
  }, 0);
  const normalizedDiscountPaise = Math.min(Math.max(0, discountPaise), subtotalPaise);
  const taxablePaise = subtotalPaise - normalizedDiscountPaise;
  const taxPaise = lines.reduce((sum, line) => {
    const lineSubtotal = line.quantity * line.unitPricePaise;
    const discountShare = subtotalPaise ? Math.round(normalizedDiscountPaise * lineSubtotal / subtotalPaise) : 0;
    return sum + Math.round((lineSubtotal - discountShare) * line.gstRateBasisPoints / 10000);
  }, 0);
  return { subtotalPaise, discountPaise: normalizedDiscountPaise, taxablePaise, taxPaise, grandTotalPaise: taxablePaise + taxPaise };
}

