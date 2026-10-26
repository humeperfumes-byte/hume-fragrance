/** Payment choices belong to saved-order recovery, never first-time checkout. */
export function canChooseCheckoutPayment(session: { paymentPending: boolean; resumed?: boolean }): boolean {
  return session.paymentPending || session.resumed === true;
}
