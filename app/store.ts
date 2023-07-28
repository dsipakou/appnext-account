import { create } from 'zustand'
import { ReportPages } from '@/components/reports/components/ReportTypeSwitcher'

export const useStore = create((set) => ({
  reportType: ReportPages.Chart,
  setReportType: (page: ReportPages) => set(() => ({reportType: page}))
}))
