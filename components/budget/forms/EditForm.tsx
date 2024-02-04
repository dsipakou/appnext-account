
import { FC, useEffect, useState } from 'react'
import axios from 'axios'
import * as z from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useSWRConfig } from 'swr';
import { useForm } from 'react-hook-form'
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
import {
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group'
import { Calendar } from '@/components/ui/calendar'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { useUsers } from '@/hooks/users'
import { useCategories } from '@/hooks/categories'
import { useCurrencies } from '@/hooks/currencies'
import { useBudgetDetails, usePendingBudget } from '@/hooks/budget'
import { User } from '@/components/users/types'
import { Category, CategoryType } from '@/components/categories/types'
import { Currency } from '@/components/currencies/types'
import { getFormattedDate, parseDate } from '@/utils/dateUtils'

import styles from '../style/AddForm.module.css'

interface Types {
  open: boolean
  setOpen: (open: boolean) => void
  uuid: string
  monthUrl: string
  weekUrl: string
}

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters",
  }),
  amount: z.coerce.number().min(0, {
    message: "Should be positive number",
  }),
  currency: z.string().uuid({message: "Please, select currency"}),
  user: z.string().uuid({message: "Please, select user"}),
  category: z.string().uuid({message: "Please, select category"}),
  repeatType: z.enum(["", "weekly", "monthly"]),
  budgetDate: z.date({
    required_error: "Budget date is required",
  }),
  description: z.string().or(z.null())
})

const EditForm: FC<Types> = ({ open, setOpen, uuid, monthUrl, weekUrl }) => {
  const { mutate } = useSWRConfig()
  const [parentList, setParentList] = useState<Category[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [month, setMonth] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSomeDay, setIsSomeDay] = useState<boolean>(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repeatType: "",
      amount: 0,
      title: "",
    },
  })

  const { data: users = [] } = useUsers()
  const { data: categories = [] } = useCategories()
  const { data: currencies = [] } = useCurrencies()
  const { data: budgetDetails } = useBudgetDetails(uuid)
  const { url: pendingUrl } = usePendingBudget()

  useEffect(() => {
    if (!categories) return;

    const parents = categories.filter(
      (category: Category) => (
        category.parent === null && category.type === CategoryType.Expense
      )
    );
    setParentList(parents);
  }, [categories]);

  useEffect(() => {
    if (!budgetDetails || !parentList.length) return

    setIsSomeDay(!budgetDetails.budgetDate)

    form.setValue('category', budgetDetails.category)
    form.setValue('user', budgetDetails.user)
    form.setValue('currency', budgetDetails.currency)
    form.setValue('amount', budgetDetails.amount || '')
    form.setValue('title', budgetDetails.title || '')
    form.setValue('category', budgetDetails.category)
    form.setValue('repeatType', budgetDetails.recurrent || '')
    form.setValue('budgetDate', budgetDetails.budgetDate ? parseDate(budgetDetails.budgetDate) : new Date())
    form.setValue('description', budgetDetails.description || '')

    setMonth(parseDate(budgetDetails.budgetDate))
  }, [budgetDetails, parentList])

  const getCurrencySign = (): string => {
    return currencies.find((item: Currency) => item.uuid === form.getValues().currency)?.sign
  }

  const handleSave = (payload: z.infer<typeof formSchema>): void => {
    setIsLoading(true)
    axios.patch(`budget/${uuid}/`, {
      ...payload,
      budgetDate: isSomeDay ? null : getFormattedDate(payload.budgetDate),
      recurrent: payload.repeatType,
    }).then(
      res => {
        if (res.status === 200) {
          mutate(monthUrl)
          mutate(weekUrl)
          mutate(pendingUrl)
          toast({
              title: 'Saved!'
            })
        } else {
          // TODO: handle errors
        }
      }
    ).catch(
      (error) => {
        const errRes = error.response.data;
        toast({
            variant: "destructive",
            title: "Cannot be updated",
            description: errRes,
          })
        for (const prop in errRes) {
          setErrors(errRes[prop]);
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
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={cleanFormErrors}>
      <DialogContent className="min-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit budget</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
            <div className="flex flex-col gap-3">
              <div className="flex w-full">
                <div className="flex sm:w-3/5">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget title</FormLabel>
                        <FormControl>
                          <Input disabled={isLoading} id="title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex sm:w-1/5">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                        <div className="flex gap-2">
                          <div>
                            <Input disabled={isLoading} id="amount" {...field} />
                          </div>
                          <span className="flex items-center w-5">
                            {form.watch('currency') && getCurrencySign()}
                          </span>
                        </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex sm:w-1/5">
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
                                {currencies && currencies.map((item: Currency) => (
                                  <SelectItem key={item.uuid} value={item.uuid}>{item.verbalName}</SelectItem>
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
              <div className="flex w-full justify-between">
                <div className="flex flex-col w-2/5 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Select
                            disabled={isLoading || !parentList.length}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="relative w-[180px]">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Categories</SelectLabel>
                                {parentList.map((item: Category) => (
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
                    name="user"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User</FormLabel>
                        <FormControl>
                          <Select
                            disabled={isLoading}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="relative w-[180px]">
                              <SelectValue placeholder="Select user" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Users</SelectLabel>
                                {users && users.map((item: User) => (
                                  <SelectItem key={item.uuid} value={item.uuid}>{item.username}</SelectItem>
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
                    name="repeatType"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            disabled={isLoading}
                            onValueChange={field.onChange}
                            value={field.value}
                            className={styles.radio}
                          >
                            <Label>
                              <RadioGroupItem value="" id="r1" />
                              <span>Do not repeat</span>
                            </Label>
                            <Label>
                              <RadioGroupItem value="weekly" id="r1" />
                              <span>Repeat Weekly</span>
                            </Label>
                            <Label>
                              <RadioGroupItem value="monthly" id="r1" />
                              <span>Repeat Monthly</span>
                            </Label>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isSomeday"
                    render={({ field }) => (
                      <FormItem className="flex justify-center">
                        <FormControl>
                          <div className="flex gap-2 mt-1 items-center">
                            <Switch
                              id="isSomeday"
                              checked={isSomeDay}
                              onClick={() => setIsSomeDay(!isSomeDay)}
                            />
                            <Label htmlFor="isSomeday">Save for later</Label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex-1 w-3/5">
                  {
                    isSomeDay ? (
                      <div className="flex flex-col items-center pt-10">
                        <span className="font-semibold text-lg">Someday later</span>
                        <span className="">This budget will appear in 'Saved for later' list</span>
                      </div>
                    ) : !isLoading && (
                      <FormField
                        control={form.control}
                        name="budgetDate"
                        render={({ field }) => (
                          <FormItem className="flex justify-center">
                            <FormControl>
                              <Calendar
                                mode="single"
                                className="justify-center"
                                selected={isSomeDay ? null : field.value}
                                onSelect={field.onChange}
                                disabled={(date) => isLoading || date < new Date("1900-01-01") || isSomeDay}
                                weekStartsOn={1}
                                initialFocus
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )
                  }
                </div>
              </div>
            </div>
            <div className="flex">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        disabled={isLoading}
                        placeholder="Add description if you want"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default EditForm
