export function getFinalPrice(price, discount) {
  const p = parseFloat(price || 0);
  const d = parseFloat(discount || 0);

  return d > 0 ? +(p * (1 - d / 100)).toFixed(2) : p;
}