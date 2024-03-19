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
  const { mutate } = useSWRConfig()
  const [month, setMonth] = React.useState<Date>(new Date())
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: ''
    }
  })

  const { data: transaction, isLoading: isTransactionLoading } = useTransaction(uuid)
  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories()
  const { data: currencies = [] } = useCurrencies()

  const {
    data: availableRates = {},
    isLoading: isRatesLoading
  } = useAvailableRates(transaction?.transactionDate)

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

    setMonth(parseDate(transaction.transactionDate))
  }, [transaction])

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
          <DialogTitle>Update income details</DialogTitle>
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
                          <Input disabled={isLoading || isTransactionLoading || isRatesLoading} id="amount" autoFocus {...field} />
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
                            disabled={isLoading || isTransactionLoading || isRatesLoading}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="relative w-full">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Currencies</SelectLabel>
                                {currencies && currencies.map((item: Currency) => (
                                  availableRates[item.code]
                                    ? <SelectItem key={item.uuid} value={item.uuid}>{item.code}</SelectItem>
                                    : <SelectItem key={item.uuid} value={item.uuid} disabled>{item.code}</SelectItem>
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
                            disabled={isLoading || isTransactionLoading || isRatesLoading}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="relative w-[180px]">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Categories</SelectLabel>
                                {incomeCategories.map((item: Category) => (
                                  <SelectItem key={item.uuid} value={item.uuid}>{item.name}</SelectItem>
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
                            disabled={isLoading || isTransactionLoading || isRatesLoading}
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
                            disabled={(date) => isLoading || isTransactionLoading || isRatesLoading || date < new Date('1900-01-01')}
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
                          disabled={isLoading || isTransactionLoading || isRatesLoading}
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

export default EditIncomeForm
