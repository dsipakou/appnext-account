import React from 'react'
import * as z from 'zod'
import { useSWRConfig } from 'swr';
import { useSession } from 'next-auth/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useUsers } from '@/hooks/users'
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
import { getFormattedDate } from '@/utils/dateUtils'
import { useAvailableRates } from '@/hooks/rates'
import { useAccounts } from '@/hooks/accounts'
import { useCurrencies } from '@/hooks/currencies'
import { useCategories } from '@/hooks/categories'
import { Currency } from '@/components/currencies/types'
import { Category } from '@/components/categories/types'
import { useToast } from '@/components/ui/use-toast'
import { User } from '@/components/users/types'

interface Types {
  open: boolean,
  url: string,
  handleClose: () => void,
}

const formSchema = z.object({
  account: z.string().uuid({message: "Please, select account"}),
  amount: z.coerce.number().min(0, {
    message: "Should be positive number",
  }),
  category: z.string().uuid({message: "Please, select category"}),
  currency: z.string().uuid({message: "Please, select currency"}),
  description: z.string().optional(),
  transactionDate: z.date({
    required_error: "Transaction date is required",
  }),
})

const AddIncomeForm: React.FC<Types> = ({ open, url, handleClose }) => {
  const [user, setUser] = React.useState('')
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [month, setMonth] = React.useState<Date>(new Date())
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const { mutate } = useSWRConfig();
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      transactionDate: selectedDate,
    }
  })

  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories()
  const { data: currencies = [] } = useCurrencies()
  const { data: users = [] } = useUsers()

  const incomeCategories: Category[] = categories.filter((item: Category) => item.type === 'INC')

  const watchCalendar = form.watch('transactionDate')

  const { data: availableRates = {} } = useAvailableRates(getFormattedDate(selectedDate))
  const { data: { user: authUser } } = useSession()

  React.useEffect(() => {
    const date = form.getValues().transactionDate
    if (!date) return
    setSelectedDate(date)
  }, [watchCalendar])

  React.useEffect(() => {
    if (!authUser || !users.length) return

    const _user = users.find((item: User) => item.username === authUser.username)!
    setUser(_user.uuid)
  }, [authUser, users])

  const handleSave = (payload: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    axios.post('transactions/', {
      ...payload,
      transactionDate: getFormattedDate(payload.transactionDate),
      user,
    }).then(
      res => {
        if (res.status === 201) {
          mutate(url);
          toast({
            title: "Saved!"
          })
          handleClose();
        } else {
          // TODO: handle errors
        }
      }
    ).catch(
      (error) => {
        const errRes = error.response.data;
        for (const prop in errRes) {
          toast({
            variant: "destructive",
            title: "Something went wrong",
            description: prop
          })
        }
      }
    ).finally(() => {
      setIsLoading(false)
    })
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
          <DialogTitle>Save your income</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
            <div className="flex">
              <div className="flex flex-col gap-3 w-1/2">
                <div className="flex sm:w-full">
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
                <div className="flex w-full">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source</FormLabel>
                        <FormControl>
                          <Select
                            disabled={isLoading}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="relative w-full">
                              <SelectValue placeholder="Select source of income" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Source</SelectLabel>
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
                </div>
                <div>
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
                            <SelectTrigger className="relative">
                              <SelectValue placeholder="Select income account" />
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
                <div className="flex">
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
                                {currencies && currencies.map((item: Currency) => (
                                  !!availableRates[item.code]
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
                <div className="flex w-full">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            disabled={isLoading}
                            placeholder="Any notes for the income transaction"
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
              <div className="flex w-1/2">
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
                          disabled={(date) => isLoading || date < new Date("1900-01-01")}
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
            <Button type="submit">Save</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddIncomeForm
