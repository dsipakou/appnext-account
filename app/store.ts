import { create } from 'zustand'
import { ReportPages } from '@/components/reports/components/ReportTypeSwitcher'

interface StoreState {
  reportType: ReportPages
  currencySign: string
  setReportType: (page: ReportPages) => void
  setCurrencySign: (sign: string) => void
}

export const useStore = create<StoreState>((set) => ({
  reportType: ReportPages.Chart,
  currencySign: '',
  setReportType: (page: ReportPages) => set(() => ({reportType: page})),
  setCurrencySign: (sign: string) => set(() => ({currencySign: sign})),
}))
