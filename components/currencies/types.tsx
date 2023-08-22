export interface CurrencyRequest {
  verbalName: string
  code: string
  sign: string
  isDefault: boolean
  comments: string
}

export interface Currency extends CurrencyRequest {
  uuid: string
  isBase: boolean
  createdAt: string
  modifiedAt: string
}

export interface CurrencySlim {
  sign: string
}

export interface RateItemPostRequest {
  currency: string
  rate: string
}

export interface RatePostRequest {
  baseCurrency: string
  items: RateItemPostRequest[]
  rateDate: string
}

export interface Rate {
  uuid: string
  currency: string
  baseCurrency: string
  rate: number
  rateDate: string
  description: string
  createdAt: string
  modifiedAt: string
}

export interface ChartRate {
  rate: string
  rateDate: string
}

export interface ChartRates {
  currencyUuid: string
  data: ChartRate[]
}

export type ChartPeriod = 'month' | 'quarter' | 'biannual' | 'annual'

export const ChartPeriodMap = {
  month: 30,
  quarter: 90,
  biannual: 180,
  annual: 365
}
