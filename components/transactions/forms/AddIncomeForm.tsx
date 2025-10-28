import React from 'react'
import * as z from 'zod'
import { useSWRConfig } from 'swr'
import { useSession } from 'next-auth/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useUsers } from '@/hooks/users'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import * as Dlg from '@/components/ui/dialog'
import * as Frm from '@/components/ui/form'
import * as Slc from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getFormattedDate } from '@/utils/dateUtils'
import { useAvailableRates } from '@/hooks/rates'
import { useAccounts } from '@/hooks/accounts'
import { useCurrencies } from '@/hooks/currencies'
import { useCategories } from '@/hooks/categories'
import { useCreateTransaction } from '@/hooks/transactions'
import { Currency } from '@/components/currencies/types'
import { Category } from '@/components/categories/types'
import { useToast } from '@/components/ui/use-toast'
import { User } from '@/components/users/types'
import { AvailableRate } from '@/components/rates/types'

interface Types {
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
    message: 'Transaction date is required'
  })
})

const AddIncomeForm: React.FC<Types> = ({ open, url, handleClose }) => {
  const [user, setUser] = React.useState('')
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [month, setMonth] = React.useState<Date>(new Date())

  const { mutate } = useSWRConfig()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      transactionDate: selectedDate
    }
  })

  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories()
  const { data: currencies = [] } = useCurrencies()
  const { data: users = [] } = useUsers()
  const { trigger: createTransaction, isMutating: isCreating } = useCreateTransaction()

  const incomeCategories: Category[] = categories.filter((item: Category) => item.type === 'INC')

  const watchCalendar = form.watch('transactionDate')

  const { data: availableRates = [] } = useAvailableRates(getFormattedDate(selectedDate))
  const { data: { user: authUser } } = useSession()

  React.useEffect(() => {
    const date = form.getValues().transactionDate
    if (!date) return
    setSelectedDate(date)
  }, [watchCalendar])

  React.useEffect(() => {
    if (!authUser || (users.length === 0)) return

    const _user = users.find((item: User) => item.username === authUser.username)!
    setUser(_user.uuid)
  }, [authUser, users])

  const handleSave = async (payload: z.infer<typeof formSchema>) => {
    try {
      await createTransaction({
        ...payload,
        transactionDate: getFormattedDate(payload.transactionDate),
        user
      })
      mutate(url)
      toast({
        title: 'Saved!'
      })
      handleClose()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: error
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
          <Dlg.DialogTitle>Save your income</Dlg.DialogTitle>
        </Dlg.DialogHeader>
        <Frm.Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
            <div className="flex">
              <div className="flex flex-col gap-3 w-1/2">
                <div className="flex sm:w-full">
                  <Frm.FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <Frm.FormItem>
                        <Frm.FormLabel>Amount</Frm.FormLabel>
                        <Frm.FormControl>
                          <Input disabled={isCreating} id="amount" autoFocus {...field} />
                        </Frm.FormControl>
                        <Frm.FormMessage />
                      </Frm.FormItem>
                    )}
                  />
                </div>
                <div className="flex w-full">
                  <Frm.FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <Frm.FormItem>
                        <Frm.FormLabel>Source</Frm.FormLabel>
                        <Frm.FormControl>
                          <Slc.Select
                            disabled={isCreating}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <Slc.SelectTrigger className="relative w-full">
                              <Slc.SelectValue placeholder="Select source of income" />
                            </Slc.SelectTrigger>
                            <Slc.SelectContent>
                              <Slc.SelectGroup>
                                <Slc.SelectLabel>Source</Slc.SelectLabel>
                                {incomeCategories.map((item: Category) => (
                                  <Slc.SelectItem key={item.uuid} value={item.uuid}>{item.name}</Slc.SelectItem>
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
                <div>
                  <Frm.FormField
                    control={form.control}
                    name="account"
                    render={({ field }) => (
                      <Frm.FormItem>
                        <Frm.FormLabel>Account</Frm.FormLabel>
                        <Frm.FormControl>
                          <Slc.Select
                            disabled={isCreating}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <Slc.SelectTrigger className="relative">
                              <Slc.SelectValue placeholder="Select income account" />
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
                <div className="flex">
                  <Frm.FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <Frm.FormItem>
                        <Frm.FormLabel>Currency</Frm.FormLabel>
                        <Frm.FormControl>
                          <Slc.Select
                            disabled={isCreating}
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
                                    if (rate.rateDate === getFormattedDate(selectedDate)) {
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
                <div className="flex w-full">
                  <Frm.FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <Frm.FormItem>
                        <Frm.FormControl>
                          <Textarea
                            disabled={isCreating}
                            placeholder="Any notes for the income transaction"
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
              <div className="flex w-1/2">
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
                          disabled={(date) => isCreating || date < new Date('1900-01-01')}
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
            <Button type="submit">Save</Button>
          </form>
        </Frm.Form>
      </Dlg.DialogContent>
    </Dlg.Dialog>
  )
}

export default AddIncomeForm
