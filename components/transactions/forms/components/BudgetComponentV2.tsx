import React from 'react'
// UI
import * as Slc from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
// Hooks
import { useBudgetWeek, useCreateBudget } from '@/hooks/budget'
import { useCategories } from '@/hooks/categories'
import { useCurrencies } from '@/hooks/currencies'
import { useToast } from '@/components/ui/use-toast'
import { useSWRConfig } from 'swr'
// Types
import { Account } from '@/components/accounts/types'
import { WeekBudgetItem } from '@/components/budget/types'
import { RowData } from '@/components/transactions/components/TransactionTableV2'
import { Category, CategoryType } from '@/components/categories/types'
import { Currency } from '@/components/currencies/types'
// Utils
import { cn } from '@/lib/utils'
import { getEndOfWeek, getStartOfWeek, getFormattedDate } from '@/utils/dateUtils'

type Props = {
  user: string
  value: string
  accounts: Account[]
  budgets: WeekBudgetItem[]
  handleChange: (id: number, key: string, value: string) => void
  handleKeyDown: (e: React.KeyboardEvent, id: number) => void
  row: RowData
  isInvalid: boolean
}

export default function BudgetComponent({
  user,
  value,
  accounts,
  handleChange,
  handleKeyDown,
  row,
  isInvalid,
}: Props) {
  const [weekStart, setWeekStart] = React.useState<string>(getStartOfWeek(row.date || new Date()))
  const [weekEnd, setWeekEnd] = React.useState<string>(getEndOfWeek(row.date || new Date()))
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [newBudgetTitle, setNewBudgetTitle] = React.useState('')
  const [newBudgetAmount, setNewBudgetAmount] = React.useState('')
  const [newBudgetCategory, setNewBudgetCategory] = React.useState('')
  const [newBudgetCurrency, setNewBudgetCurrency] = React.useState('')

  const { data: budgets = [] } = useBudgetWeek(weekStart, weekEnd)
  const { data: categories = [] } = useCategories()
  const { data: currencies = [] } = useCurrencies()
  const { trigger: createBudget, isMutating: isCreating } = useCreateBudget()
  const { toast } = useToast()
  const { mutate } = useSWRConfig()

  const accountUser = accounts.find((item: Account) => item.uuid === row.account)?.user

  const filteredBudgets = budgets.filter((item: WeekBudgetItem) => item.user === accountUser)
  const completedBudgets = filteredBudgets.filter((item: WeekBudgetItem) => item.isCompleted)
  const incompletedBudgets = filteredBudgets.filter((item: WeekBudgetItem) => !item.isCompleted)

  const parentCategories = categories.filter(
    (category: Category) => category.parent === null && category.type === CategoryType.Expense
  )

  const defaultCurrency = currencies.find((item: Currency) => item.isDefault)?.uuid || ''

  React.useEffect(() => {
    setWeekStart(getStartOfWeek(row.date))
    setWeekEnd(getEndOfWeek(row.date))
  }, [row.date])

  React.useEffect(() => {
    if (defaultCurrency && !newBudgetCurrency) {
      setNewBudgetCurrency(defaultCurrency)
    }
  }, [defaultCurrency])

  const onChange = (value: string) => {
    if (value === '__create_new__') {
      setIsCreateDialogOpen(true)
      return
    }

    const budget = filteredBudgets.find((item: WeekBudgetItem) => item.uuid === value)
    handleChange(row.id, "budget", value)
    handleChange(row.id, "budgetName", budget?.title || "")
    handleChange(row.id, "category", budget?.category || "")
  }

  const handleCreateBudget = async () => {
    if (!newBudgetTitle || !newBudgetAmount || !newBudgetCategory || !newBudgetCurrency) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please fill all required fields',
      })
      return
    }

    try {
      const budgetData = {
        title: newBudgetTitle,
        amount: parseFloat(newBudgetAmount),
        category: newBudgetCategory,
        currency: newBudgetCurrency,
        user: accountUser,
        recurrent: 'weekly',
        budgetDate: getFormattedDate(row.date || new Date()),
      }

      const result = await createBudget(budgetData)

      // Revalidate budget data
      mutate((key) => typeof key === 'string' && key.includes('budget/weekly-usage'), undefined)

      // Set the newly created budget as selected
      if (result && result.uuid) {
        handleChange(row.id, "budget", result.uuid)
        handleChange(row.id, "budgetName", newBudgetTitle)
        handleChange(row.id, "category", newBudgetCategory)
      }

      // Reset form
      setNewBudgetTitle('')
      setNewBudgetAmount('')
      setNewBudgetCategory('')
      setNewBudgetCurrency(defaultCurrency)
      setIsCreateDialogOpen(false)

      toast({
        title: 'Budget created successfully!',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to create budget',
        description: 'Please try again',
      })
    }
  }

  return (
    <>
      <Slc.Select
        value={value}
        onValueChange={(value) => onChange(value)}
        onOpenChange={(open) => {
          if (!open) {
            (document.activeElement as HTMLElement)?.blur();
          }
        }}
        disabled={!accountUser}
      >
        <Slc.SelectTrigger
          className={cn(
            "w-full h-8 px-2 text-sm border-0 focus:ring-0 focus:outline-none focus:border-primary bg-white focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-blue-700 text-left",
            isInvalid && "outline outline-red-400"
          )}
          onKeyDown={(e) => handleKeyDown(e, row.id)}
        >
          <Slc.SelectValue placeholder={!accountUser ? "Select account first" : ""} />
        </Slc.SelectTrigger>
        <Slc.SelectContent>
          {accountUser && (
            <>
              <Slc.SelectItem value="__create_new__" className="font-semibold text-blue-600">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Create new budget</span>
                </div>
              </Slc.SelectItem>
              {!!filteredBudgets.length && <Slc.SelectSeparator />}
            </>
          )}
          {!filteredBudgets.length && (
            <Slc.SelectItem value="empty" disabled>No budgets</Slc.SelectItem>
          )}
          {!!filteredBudgets.length && !!incompletedBudgets.length && (
            <>
              <Slc.SelectGroup>
                {incompletedBudgets.map((item: WeekBudgetItem) => (
                  <Slc.SelectItem
                    key={item.uuid}
                    value={item.uuid}
                  >{item.title}</Slc.SelectItem>
                ))}
              </Slc.SelectGroup>
              <Slc.SelectSeparator />
            </>
          )}
          {!!filteredBudgets.length && !!completedBudgets.length && (
            <Slc.SelectGroup>
              <Slc.SelectLabel className="flex justify-start">Completed budgets</Slc.SelectLabel>
              {completedBudgets.map((item: WeekBudgetItem) => (
                <Slc.SelectItem
                  className="italic"
                  key={item.uuid}
                  value={item.uuid}
                >{item.title}</Slc.SelectItem>
              ))}
            </Slc.SelectGroup>
          )}
        </Slc.SelectContent>
      </Slc.Select>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Budget</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newBudgetTitle}
                onChange={(e) => setNewBudgetTitle(e.target.value)}
                placeholder="Budget title"
                disabled={isCreating}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={newBudgetAmount}
                onChange={(e) => setNewBudgetAmount(e.target.value)}
                placeholder="0"
                disabled={isCreating}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Slc.Select
                value={newBudgetCategory}
                onValueChange={setNewBudgetCategory}
                disabled={isCreating}
              >
                <Slc.SelectTrigger>
                  <Slc.SelectValue placeholder="Select category" />
                </Slc.SelectTrigger>
                <Slc.SelectContent>
                  <Slc.SelectGroup>
                    {parentCategories.map((item: Category) => (
                      <Slc.SelectItem key={item.uuid} value={item.uuid}>
                        {item.icon && <span className="mr-2">{item.icon}</span>}
                        {item.name}
                      </Slc.SelectItem>
                    ))}
                  </Slc.SelectGroup>
                </Slc.SelectContent>
              </Slc.Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Slc.Select
                value={newBudgetCurrency}
                onValueChange={setNewBudgetCurrency}
                disabled={isCreating}
              >
                <Slc.SelectTrigger>
                  <Slc.SelectValue placeholder="Select currency" />
                </Slc.SelectTrigger>
                <Slc.SelectContent>
                  <Slc.SelectGroup>
                    {currencies.map((item: Currency) => (
                      <Slc.SelectItem key={item.uuid} value={item.uuid}>
                        {item.code} ({item.sign})
                      </Slc.SelectItem>
                    ))}
                  </Slc.SelectGroup>
                </Slc.SelectContent>
              </Slc.Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateBudget} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Budget'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
