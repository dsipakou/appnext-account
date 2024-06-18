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

export const getNumberWithPostfix = (value: number) => {
  const lastDigit = value % 10;
  const lastTwoDigits = value % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return value + "th"
  }

  switch (lastDigit) {
    case 1:
      return value + "st"
    case 2:
      return value + "nd"
    case 3:
      return value + "rd"
    default:
      return value + "th"
  }
}
