import { create } from 'zustand'
import { ReportPages } from '@/components/reports/components/ReportTypeSwitcher'

interface StoreState {
  reportType: ReportPages
  currencySign: string
  weekDate: Date
  monthDate: Date
  setReportType: (page: ReportPages) => void
  setCurrencySign: (sign: string) => void
  setWeekDate: (date: Date) => void
  setMonthDate: (date: Date) => void
}

export const useStore = create<StoreState>((set) => ({
  reportType: ReportPages.Chart,
  currencySign: '',
  weekDate: new Date(),
  monthDate: new Date(),
  setReportType: (page: ReportPages) => set(() => ({reportType: page})),
  setCurrencySign: (sign: string) => set(() => ({currencySign: sign})),
  setWeekDate: (date: Date) => set(() => ({weekDate: date})),
  setMonthDate: (date: Date) => set(() => ({monthDate: date})),
}))
