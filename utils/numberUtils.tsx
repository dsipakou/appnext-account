export const formatMoney = (value: number) => {
  if (!value) return 0;
  return value.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: 'decimal',
  })
}
