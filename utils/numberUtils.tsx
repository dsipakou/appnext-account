export const formatMoney = (value: number, currencyCode: string) => {
  if (!value) return 0;
  console.log(value)
  return value.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: 'decimal',
  })
}
