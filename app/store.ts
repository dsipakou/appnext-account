import { create } from 'zustand';
import { ReportPages } from '@/components/reports/components/ReportTypeSwitcher';

interface Currency {
  sign: string;
  code: string;
}

interface StoreState {
  reportType: ReportPages;
  currency: Currency;
  weekDate: Date;
  monthDate: Date;
  setReportType: (page: ReportPages) => void;
  setCurrency: (currency: Currency) => void;
  setWeekDate: (date: Date) => void;
  setMonthDate: (date: Date) => void;
}

export const useStore = create<StoreState>((set) => ({
  reportType: ReportPages.Chart,
  currency: { sign: '', code: '' },
  weekDate: new Date(),
  monthDate: new Date(),
  setReportType: (page: ReportPages) => set(() => ({ reportType: page })),
  setCurrency: (currency: Currency) => set(() => ({ currency })),
  setWeekDate: (date: Date) => set(() => ({ weekDate: date })),
  setMonthDate: (date: Date) => set(() => ({ monthDate: date })),
}));
