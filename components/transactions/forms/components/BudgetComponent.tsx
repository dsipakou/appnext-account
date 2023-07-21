import React from 'react'
import {
  GridRenderEditCellParams,
  useGridApiContext
} from '@mui/x-data-grid'
import {
  Divider,
  FormControl,
  Select,
  MenuItem
} from '@mui/material'
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
  const {
    data: budgets = []
  } = useBudgetWeek(weekStart, weekEnd)

  const handleChange = (newValue: any) => {
    console.log(newValue.target.value)
    apiRef.current.setEditCellValue({ id, field, value: newValue.target.value })
  }

  React.useEffect(() => {
    if (!user || !budgets) return
    const completedBudgets = budgets.filter((item: WeekBudgetItem) => item.isCompleted && item.user === user)
    const incompletedBudgets = budgets.filter((item: WeekBudgetItem) => !item.isCompleted && item.user === user)
    const activeBudget = typeof value === 'string' 
      ? budgets.find((item: WeekBudgetItem) => item.uuid === value) 
      : value

    apiRef.current.setEditCellValue({ id, field, value: row.account.user === activeBudget?.user ? activeBudget : null })

    setCompletedItems(completedBudgets)
    setIncompletedItems(incompletedBudgets)
  }, [budgets, user, transactionDate])

  return (
    <FormControl fullWidth>
      <Select
        fullWidth
        value={!![...completedItems, ...incompletedItems].length ? value : ''}
        onChange={handleChange}
      >
        {user && incompletedItems.map((item: WeekBudgetItem) => (
          <MenuItem
            key={item.uuid}
            value={item}
          >
            {item.title}
          </MenuItem>
        ))
        }
        {user && completedItems.length > 0 && incompletedItems.length > 0 && <Divider />}
        {user && completedItems.map((item: WeekBudgetItem) => (
          <MenuItem
            key={item.uuid}
            value={item}
          >
            {item.title}
          </MenuItem>
        ))
        }
        {!user && <MenuItem value="">Please, select account first</MenuItem>}
      </Select>
    </FormControl>
  )
}

export default BudgetComponent
