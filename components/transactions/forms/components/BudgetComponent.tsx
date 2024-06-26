import React from 'react'
import {
  GridRenderEditCellParams,
  useGridApiContext
} from '@mui/x-data-grid'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { WeekBudgetItem } from '@/components/budget/types'
import { useBudgetWeek } from '@/hooks/budget'
import {
  getStartOfWeek,
  getEndOfWeek
} from '@/utils/dateUtils'

interface BudgetComponentTypes extends GridRenderEditCellParams { }

const BudgetComponent: React.FC<BudgetComponentTypes> = (params) => {
  const { id, field, row, value } = params
  const [completedItems, setCompletedItems] = React.useState<WeekBudgetItem[]>([])
  const [incompletedItems, setIncompletedItems] = React.useState<WeekBudgetItem[]>([])
  const apiRef = useGridApiContext()
  const transactionDate = row.transactionDate
  const weekStart = getStartOfWeek(transactionDate || new Date())
  const weekEnd = getEndOfWeek(transactionDate || new Date())
  const user = row.account.user
  const { data: budgets = [], isLoading: isBudgetLoading } = useBudgetWeek(weekStart, weekEnd)

  React.useEffect(() => {
    if (isBudgetLoading || !user) return

    const completedBudgets = budgets.filter((item: WeekBudgetItem) => item.isCompleted && item.user === user)
    const incompletedBudgets = budgets.filter((item: WeekBudgetItem) => !item.isCompleted && item.user === user)
    const activeBudget = typeof value === 'string'
      ? budgets.find((item: WeekBudgetItem) => item.uuid === value)
      : value

    apiRef.current.setEditCellValue({ id, field, value: row.account.user === activeBudget?.user ? activeBudget : null })

    setCompletedItems(completedBudgets)
    setIncompletedItems(incompletedBudgets)
    console.log(completedItems)
  }, [budgets, isBudgetLoading, user, transactionDate])

  const handleChange = (item: WeekBudgetItem) => {
    apiRef.current.setEditCellValue({ id, field, value: item })
  }

  return (
    <div className="flex w-full h-full bg-slate-100 justify-center select-none items-center">
      {!user
        ? (
          <span className="italic">No account selected</span>
        )
        : (
          <Select
            onValueChange={handleChange}
            value={([...completedItems, ...incompletedItems].length > 0) ? value : ''}
          >
            <SelectTrigger className="relative bg-white text-xs rounded-lg h-full border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {incompletedItems.length > 0 && (
                <SelectGroup>
                  <SelectLabel>Budgets</SelectLabel>
                  {incompletedItems.map((item: WeekBudgetItem) => (
                    <SelectItem key={item.uuid} value={item}>{item.title}</SelectItem>
                  ))}
                </SelectGroup>
              )}
              {completedItems.length > 0 && (
                <>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel><span className="italic">Completed budgets</span></SelectLabel>
                    {completedItems.map((item: WeekBudgetItem) => (
                      <SelectItem key={item.uuid} value={item}><span className="text-slate-500">{item.title}</span></SelectItem>
                    ))
                    }
                  </SelectGroup>
                </>
              )}
            </SelectContent>
          </Select>
        )}
    </div>
  )
}

export default BudgetComponent
