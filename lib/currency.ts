function formatAsINR(amount: number) {
  const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${inr} INR`;
}

export const formatINR = (amount: number) => formatAsINR(amount);
