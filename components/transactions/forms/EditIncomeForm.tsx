import React from 'react'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useSWRConfig } from 'swr'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import * as Dlg from '@/components/ui/dialog'
import * as Frm from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import * as Slc from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useTransaction, useUpdateTransaction } from '@/hooks/transactions'
import { useAccounts } from '@/hooks/accounts'
import { useCategories } from '@/hooks/categories'
import { useCurrencies } from '@/hooks/currencies'
import { useAvailableRates } from '@/hooks/rates'
import { AccountResponse } from '@/components/accounts/types'
import { Category, CategoryType } from '@/components/categories/types'
import {
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
  category: z.string().uuid({ message: 'Please, select category' }),
  currency: z.string().uuid({ message: 'Please, select currency' }),
  description: z.string().optional(),
  transactionDate: z.date({
    required_error: 'Transaction date is required'
  })
})

const EditIncomeForm: React.FC<Types> = ({ uuid, open, url, handleClose }) => {
  const [selectedDate, setSelectedDate] = React.useState<string>(getFormattedDate(new Date()))
  const [month, setMonth] = React.useState<Date>(new Date())
  const { mutate } = useSWRConfig()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: ''
    }
  })

  const watchCalendar = form.watch('transactionDate')

  const { toast } = useToast()

  const { data: transaction, isLoading: isTransactionLoading } = useTransaction(uuid)
  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories()
  const { data: currencies = [] } = useCurrencies()
  const { trigger: updateTransaction, isMutating: isUpdating } = useUpdateTransaction(uuid)

  const {
    data: availableRates = [],
    isLoading: isRatesLoading
  } = useAvailableRates(selectedDate)

  const incomeCategories = categories.filter(
    (category: Category) => (
      category.parent === null && category.type === CategoryType.Income
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

    setSelectedDate(transaction.transactionDate)

    setMonth(parseDate(transaction.transactionDate))
  }, [transaction])

  React.useEffect(() => {
    const date = form.getValues().transactionDate

    if (date) {
      setSelectedDate(getFormattedDate(form.getValues().transactionDate))
    }
  }, [watchCalendar])

  const handleSave = async (payload: z.infer<typeof formSchema>): void => {
    try {
      await updateTransaction({
        ...payload,
        transactionDate: getFormattedDate(payload.transactionDate)
      })
      // TODO: wrong url - outcome instead of outcome
      mutate(url)
      toast({
        title: 'Transaction updated',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Cannot update transaction',
        description: 'Something went wrong, please try again later.'
      })
    }
  }

  const cleanFormErrors = (open: boolean) => {
    if (!open) {
      form.clearErrors()
      form.reset()
    }
    handleClose()
  }

  return (
    <Dlg.Dialog open={open} onOpenChange={cleanFormErrors}>
      <Dlg.DialogContent className="min-w-[600px]">
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Update income details</Dlg.DialogTitle>
        </Dlg.DialogHeader>
        <Frm.Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
            <div className="flex flex-col gap-3">
              <div className="flex w-full">
                <div className="flex sm:w-2/3">
                  <Frm.FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <Frm.FormItem>
                        <Frm.FormLabel>Amount</Frm.FormLabel>
                        <Frm.FormControl>
                          <Input disabled={isUpdating || isTransactionLoading || isRatesLoading} id="amount" autoFocus {...field} />
                        </Frm.FormControl>
                        <Frm.FormMessage />
                      </Frm.FormItem>
                    )}
                  />
                </div>
                <div className="flex sm:w-1/3">
                  <Frm.FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <Frm.FormItem>
                        <Frm.FormLabel>Currency</Frm.FormLabel>
                        <Frm.FormControl>
                          <Slc.Select
                            disabled={isUpdating || isTransactionLoading || isRatesLoading}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <Slc.SelectTrigger className="relative w-full">
                              <Slc.SelectValue placeholder="Select currency" />
                            </Slc.SelectTrigger>
                            <Slc.SelectContent>
                              <Slc.SelectGroup>
                                <Slc.SelectLabel>Currencies</Slc.SelectLabel>
                                {currencies && currencies.map((item: Currency) => {
                                  const rate = availableRates.find((rate: AvailableRate) => rate.currencyCode === item.code)
                                  if (rate) {
                                    if (rate.rateDate === selectedDate) {
                                      return (
                                        <Slc.SelectItem key={item.uuid} value={item.uuid}>{item.code}</Slc.SelectItem>
                                      )
                                    } else {
                                      return (
                                        <Slc.SelectItem key={item.uuid} value={item.uuid}>{item.code} (old)</Slc.SelectItem>
                                      )
                                    }
                                  } else {
                                    return (
                                      <Slc.SelectItem key={item.uuid} value={item.uuid} disabled>{item.code}</Slc.SelectItem>
                                    )
                                  }
                                })}
                              </Slc.SelectGroup>
                            </Slc.SelectContent>
                          </Slc.Select>
                        </Frm.FormControl>
                        <Frm.FormMessage />
                      </Frm.FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex w-full">
                <div className="flex flex-col w-2/5 gap-4">
                  <Frm.FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <Frm.FormItem>
                        <Frm.FormLabel>Category</Frm.FormLabel>
                        <Frm.FormControl>
                          <Slc.Select
                            disabled={isUpdating || isTransactionLoading || isRatesLoading}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <Slc.SelectTrigger className="relative w-[180px]">
                              <Slc.SelectValue placeholder="Select category" />
                            </Slc.SelectTrigger>
                            <Slc.SelectContent>
                              <Slc.SelectGroup>
                                <Slc.SelectLabel>Categories</Slc.SelectLabel>
                                {incomeCategories.map((item: Category) => (
                                  <Slc.SelectItem key={item.uuid} value={item.uuid}>
                                    <div className="flex gap-1">
                                      {item.icon && <span>{item.icon}</span>}
                                      <span>{item.name}</span>
                                    </div>
                                  </Slc.SelectItem>
                                ))}
                              </Slc.SelectGroup>
                            </Slc.SelectContent>
                          </Slc.Select>
                        </Frm.FormControl>
                        <Frm.FormMessage />
                      </Frm.FormItem>
                    )}
                  />
                  <Frm.FormField
                    control={form.control}
                    name="account"
                    render={({ field }) => (
                      <Frm.FormItem>
                        <Frm.FormLabel>Account</Frm.FormLabel>
                        <Frm.FormControl>
                          <Slc.Select
                            disabled={isUpdating || isTransactionLoading || isRatesLoading}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <Slc.SelectTrigger className="relative w-[180px]">
                              <Slc.SelectValue placeholder="Select account" />
                            </Slc.SelectTrigger>
                            <Slc.SelectContent>
                              <Slc.SelectGroup>
                                <Slc.SelectLabel>Accounts</Slc.SelectLabel>
                                {accounts.map((item: AccountResponse) => (
                                  <Slc.SelectItem key={item.uuid} value={item.uuid}>{item.title}</Slc.SelectItem>
                                ))}
                              </Slc.SelectGroup>
                            </Slc.SelectContent>
                          </Slc.Select>
                        </Frm.FormControl>
                        <Frm.FormMessage />
                      </Frm.FormItem>
                    )}
                  />
                </div>
                <div className="flex w-3/5 justify-end">
                  <Frm.FormField
                    control={form.control}
                    name="transactionDate"
                    render={({ field }) => (
                      <Frm.FormItem>
                        <Frm.FormControl>
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => isUpdating || isTransactionLoading || isRatesLoading || date < new Date('1900-01-01')}
                            month={month}
                            onMonthChange={setMonth}
                            weekStartsOn={1}
                            initialFocus
                          />
                        </Frm.FormControl>
                        <Frm.FormMessage />
                      </Frm.FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex w-full">
                <Frm.FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <Frm.FormItem>
                      <Frm.FormControl>
                        <Textarea
                          disabled={isUpdating || isTransactionLoading || isRatesLoading}
                          placeholder="Any notes for the transaction"
                          className="resize-none"
                          {...field}
                        />
                      </Frm.FormControl>
                      <Frm.FormMessage />
                    </Frm.FormItem>
                  )}
                />
              </div>
            </div>
            <Button type="submit">Save</Button>
          </form>
        </Frm.Form>
      </Dlg.DialogContent>
    </Dlg.Dialog>
  )
}

export default EditIncomeForm
