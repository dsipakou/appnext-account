export const formatMoney = (value: number) => {
  if (!value) return 0;
  return value.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: 'decimal',
  })
}

export const calculatePercentage = (value: number, low: number, high: number) => {
  const mappedValue = 20 + ((value - low) / (high - low)) * 80;
  return Math.min(100, Math.floor(Math.max(20, mappedValue)));
}
