export const COD_MAX_TOTAL = 1500;
export const COD_FEE = 50;
export const COD_PAYMENT_METHOD = "20% Prepaid + 80% Cash on Delivery";
export function isCodEligible(baseTotal: number) { return Number.isFinite(baseTotal) && baseTotal > 0 && Math.round(baseTotal * 100) <= COD_MAX_TOTAL * 100; }
export function savedCodFee(method?: string | null, storedFee?: string | number | null) {
  if (storedFee !== undefined && storedFee !== null) {
    const fee = Number(storedFee);
    return Number.isFinite(fee) && fee >= 0 ? fee : 0;
  }
  // Compatibility for data read before the additive cod_fee migration.
  return method?.includes("₹50 COD fee") ? COD_FEE : 0;
}
export function totalWithCod(baseTotal: number) {
  if (!isCodEligible(baseTotal)) throw new Error("COD is available only for orders up to ₹1,500. Please pay in full.");
  return Math.round((baseTotal + COD_FEE) * 100) / 100;
}
