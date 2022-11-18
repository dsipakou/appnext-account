export interface Currency {
  uuid: string
  verbalName: string
  sign: string
  code: string
  isBase: boolean
  isDefault: boolean
  comments: string
  createdAt: string
  modifiedAt: string
}

export interface Rate {
  uuid: string,
  currency: string,
  baseCurrency: string,
  rate: number,
  rateDate: string,
  description: string,
  createdAt: string,
  modifiedAt: string,
}

export interface ChartRate {
  rate: string
  rateDate: string
}

export interface ChartRates {
  currencyUuid: string
  data: ChartRate[]
}

export type ChartPeriod = "month" | "quarter" | "biannual" | "annual"

export const ChartPeriodMap = {
  month: 30,
  quarter: 90,
  biannual: 180,
  annual: 365,
}
