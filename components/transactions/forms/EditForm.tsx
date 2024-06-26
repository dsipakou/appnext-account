import React from 'react'
import axios from 'axios'
import { useSWRConfig } from 'swr'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useTransaction } from '@/hooks/transactions'
import { useAccounts } from '@/hooks/accounts'
import { useBudgetWeek } from '@/hooks/budget'
import { useCategories } from '@/hooks/categories'
import { useCurrencies } from '@/hooks/currencies'
import { useAvailableRates } from '@/hooks/rates'
import { AccountResponse, Account } from '@/components/accounts/types'
import { WeekBudgetItem } from '@/components/budget/types'
import { Category, CategoryType } from '@/components/categories/types'
import {
  getStartOfWeek,
  getEndOfWeek,
  getFormattedDate,
  parseDate
} from '@/utils/dateUtils'
import { Currency } from '@/components/currencies/types'
import { AvailableRate } from '@/components/rates/types'

interface Types {
  uuid: string
  open: boolean
  url: string
  handleClose: () => void
}

const formSchema = z.object({
  account: z.string().uuid({ message: 'Please, select account' }),
  amount: z.coerce.number().min(0, {
    message: 'Should be positive number'
  }),
  budget: z.string().uuid({ message: 'Please, select budget' }),
  category: z.string().uuid({ message: 'Please, select category' }),
  currency: z.string().uuid({ message: 'Please, select currency' }),
  description: z.string().optional(),
  transactionDate: z.date({
    required_error: 'Transaction date is required'
  })
})

const EditForm: React.FC<Types> = ({ uuid, open, url, handleClose }) => {
  const { mutate } = useSWRConfig()
  const [selectedDate, setSelectedDate] = React.useState<string>(getFormattedDate(new Date()))
  const [accountUuid, setAccountUuid] = React.useState<string>('')
  const [weekStart, setWeekStart] = React.useState<string>(getStartOfWeek(new Date()))
  const [weekEnd, setWeekEnd] = React.useState<string>(getEndOfWeek(new Date()))
  const [month, setMonth] = React.useState<Date>(new Date())
  const [filteredBudgets, setFilteredBudgets] = React.useState<WeekBudgetItem[]>([])
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: ''
    }
  })

  const watchAccount = form.watch('account')
  const watchCalendar = form.watch('transactionDate')

  const { data: transaction } = useTransaction(uuid)
  const { data: accounts = [] } = useAccounts()
  const { data: budgets = [], isLoading: isBudgetLoading } = useBudgetWeek(weekStart, weekEnd)
  const { data: categories = [] } = useCategories()
  const { data: currencies = [] } = useCurrencies()

  const {
    data: availableRates = []
  } = useAvailableRates(selectedDate)

  const parents = categories.filter(
    (category: Category) => (
      category.parent === null && category.type === CategoryType.Expense
    )
  )

  React.useEffect(() => {
    if (!transaction || (accounts.length === 0)) return

    form.setValue('account', transaction.account)
    form.setValue('amount', transaction.amount)
    form.setValue('category', transaction.category)
    form.setValue('currency', transaction.currency)
    form.setValue('description', transaction.description)
    form.setValue('transactionDate', parseDate(transaction.transactionDate))
    form.setValue('budget', transaction.budget)

    setSelectedDate(transaction.transactionDate)

    setMonth(parseDate(transaction.transactionDate))
  }, [transaction])

  const getChildren = (uuid: string): Category[] => {
    return categories.filter(
      (item: Category) => item.parent === uuid
    ) || []
  }

  React.useEffect(() => {
    if (isBudgetLoading) return

    const _account = accounts.find((item: WeekBudgetItem) => item.uuid === form.getValues().account)

    if (_account != null) {
      setFilteredBudgets(budgets.filter((item: WeekBudgetItem) => item.user === _account.user))
    }
  }, [isBudgetLoading, budgets, accounts, watchAccount])

  React.useEffect(() => {
    const date = form.getValues().transactionDate

    if (date) {
      setWeekStart(getStartOfWeek(form.getValues().transactionDate))
      setWeekEnd(getEndOfWeek(form.getValues().transactionDate))
      setSelectedDate(getFormattedDate(form.getValues().transactionDate))
    }
  }, [watchCalendar])

  React.useEffect(() => {
    if (!accountUuid || !budgets) return

    const _account = accounts.find((item: Account) => item.uuid === accountUuid)
    setFilteredBudgets(budgets.filter((item: WeekBudgetItem) => item.user === _account.user))
  }, [accountUuid, budgets])

  const handleSave = (payload: z.infer<typeof formSchema>): void => {
    setIsLoading(true)
    axios.patch(`transactions/${uuid}/`, {
      ...payload,
      transactionDate: getFormattedDate(payload.transactionDate)
    }).then(
      res => {
        if (res.status === 200) {
          mutate(url)
        }
      }
    ).catch(
      (error) => {
        console.log(`cannot update: ${error}`)
      }
    ).finally(() => {
      setIsLoading(false)
    }
    )
  }

  const cleanFormErrors = (open: boolean) => {
    if (!open) {
      form.clearErrors()
      form.reset()
    }
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={cleanFormErrors}>
      <DialogContent className="min-w-[600px]">
        <DialogHeader>
          <DialogTitle>Update transaction details</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
            <div className="flex flex-col gap-3">
              <div className="flex w-full">
                <div className="flex sm:w-2/3">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input disabled={isLoading} id="amount" autoFocus {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex sm:w-1/3">
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <FormControl>
                          <Select
                            disabled={isLoading}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="relative w-full">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Currencies</SelectLabel>
                                {currencies && currencies.map((item: Currency) => {
                                  const rate = availableRates.find((rate: AvailableRate) => rate.currencyCode === item.code)
                                  if (rate) {
                                    if (rate.rateDate === selectedDate) {
                                      return (
                                        <SelectItem key={item.uuid} value={item.uuid}>{item.code}</SelectItem>
                                      )
                                    } else {
                                      return (
                                        <SelectItem key={item.uuid} value={item.uuid}>{item.code} (old)</SelectItem>
                                      )
                                    }
                                  } else {
                                    return (
                                      <SelectItem key={item.uuid} value={item.uuid} disabled>{item.code}</SelectItem>
                                    )
                                  }
                                })}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex w-full">
                <div className="flex flex-col w-2/5 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Select
                            disabled={isLoading}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="relative w-[180px]">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Categories</SelectLabel>
                                {parents.map((item: Category) => {
                                  return getChildren(item.uuid).map((subitem: Category) => (
                                    <SelectItem key={subitem.uuid} value={subitem.uuid}>
                                      <div className="flex gap-1">
                                        {item.icon && <span className="mr-1">{item.icon}</span>}
                                        <span>{item.name}</span>
                                        <span>/</span>
                                        <span>{subitem.name}</span>
                                      </div>
                                    </SelectItem>
                                  ))
                                })}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget</FormLabel>
                        <FormControl>
                          <Select
                            disabled={isLoading || isBudgetLoading}
                            onValueChange={(value) => value && field.onChange(value)}
                            value={field.value}
                          >
                            <SelectTrigger className="relative w-[180px]">
                              <SelectValue placeholder="Select budget" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Budget list</SelectLabel>
                                {filteredBudgets.map((item: WeekBudgetItem) => (
                                  <SelectItem key={item.uuid} value={item.uuid}>{item.title}</SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="account"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account</FormLabel>
                        <FormControl>
                          <Select
                            disabled={isLoading}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="relative w-[180px]">
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Accounts</SelectLabel>
                                {accounts.map((item: AccountResponse) => (
                                  <SelectItem key={item.uuid} value={item.uuid}>{item.title}</SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex w-3/5 justify-end">
                  <FormField
                    control={form.control}
                    name="transactionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => isLoading || date < new Date('1900-01-01')}
                            month={month}
                            onMonthChange={setMonth}
                            weekStartsOn={1}
                            initialFocus
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex w-full">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          disabled={isLoading}
                          placeholder="Any notes for the transaction"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button type="submit">Save</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default EditForm
