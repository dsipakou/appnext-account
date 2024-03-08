export interface ChartCategory {
  name: string
  value: number
  categoryType: 'EXP' | 'INC'
}

export interface ChartData {
  date: string
  categories: ChartCategory[]
}
