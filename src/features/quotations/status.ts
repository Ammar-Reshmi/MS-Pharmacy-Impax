import type { quotationStatus } from "@/db/schema";

export type QuotationStatus = (typeof quotationStatus.enumValues)[number];

const transitions: Record<QuotationStatus, readonly QuotationStatus[]> = {
  draft: ["submitted"],
  submitted: ["under_review"],
  under_review: ["quoted", "rejected"],
  quoted: ["sent", "rejected", "expired"],
  sent: ["accepted", "rejected", "expired"],
  accepted: [],
  rejected: [],
  expired: []
};

export function canTransitionQuotation(from: QuotationStatus, to: QuotationStatus) {
  return transitions[from].includes(to);
}

export function assertQuotationTransition(from: QuotationStatus, to: QuotationStatus) {
  if (!canTransitionQuotation(from, to)) throw new Error(`Quotation status cannot move from ${from} to ${to}.`);
}

