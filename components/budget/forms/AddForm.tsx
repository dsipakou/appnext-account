import { FC, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { useSWRConfig } from 'swr';
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group'
import { Calendar } from '@/components/ui/calendar'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'

import { useUsers } from '@/hooks/users'
import { useCategories } from '@/hooks/categories'
import { useCurrencies } from '@/hooks/currencies'
import { User } from '@/components/users/types'
import { Category, CategoryType } from '@/components/categories/types'
import { Currency } from '@/components/currencies/types'
import { getFormattedDate } from '@/utils/dateUtils'
import { Label } from '@/components/ui/label';

import styles from '../style/AddForm.module.css'

interface Types {
  monthUrl: string
  weekUrl: string
  date?: Date
  customTrigger?: React.ReactElement
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
  description: z.string().optional()
})

const AddForm: FC<Types> = ({ monthUrl, weekUrl, date, customTrigger }) => {
  const { mutate } = useSWRConfig()
  const [parentList, setParentList] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repeatType: "",
    },
  })

  useEffect(() => {
    if (open) {
      form.setValue('budgetDate', date || new Date())
    }
  }, [open])

  const { toast } = useToast()

  const { data: { user: authUser }} = useSession()

  const { data: users } = useUsers()

  const { data: currencies } = useCurrencies()

  const {
    data: categories,
    isLoading: isCategoriesLoading
  } = useCategories()

  useEffect(() => {
    if (!categories) return;

    const parents = categories.filter(
      (category: Category) => (
        category.parent === null && category.type === CategoryType.Expense
      )
    );
    setParentList(parents);

  }, [isCategoriesLoading, categories]);

  useEffect(() => {
    form.setValue('currency', getDefaultCurrency())
  }, [currencies])

  useEffect(() => {
    form.setValue('user', getDefaultUser())
  }, [authUser, users])

  const getDefaultCurrency = (): string => {
    if (!currencies) {
      return ""
    }

    const _currency = currencies.find((item: Currency) => item.isDefault)
    if (_currency) {
      return _currency.uuid
    }

    return ""
  }

  const getDefaultUser = (): string => {
    if (!authUser || !users) {
      return ""
    }

    const _user = users.find((item: User) => item.username === authUser?.username)
    if (_user) {
      return _user.uuid
    }

    return ""
  }

  const getCurrencySign = (): string => {
    return currencies.find((item: Currency) => item.uuid === form.getValues().currency)?.sign
  }

  const handleSave = (payload: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    axios.post('budget/', {
      ...payload,
      budgetDate: getFormattedDate(payload.budgetDate),
      recurrent: payload.repeatType,
    }).then(
      res => {
        if (res.status === 201) {
          mutate(monthUrl)
          mutate(weekUrl)
          toast({
            title: "Saved!"
          })
        } else {
          // TODO: handle errors
        }
      }
    ).catch(
      (error) => {
        toast({
            variant: "destructive",
            title: "Something went wrong",
            description: "Please, check your fields"
          })
        const errRes = error.response.data;
        for (const prop in errRes) {
          // setErrors(errRes[prop]);
        }
      }
    ).finally(() => {
      setIsLoading(false)
    })
  }

  const clean = (open: boolean) => {
    if (!open) {
      form.clearErrors()
    }
    setOpen(open)
  }

  const defaultTrigger = (
    <Button className="mx-2">+ Add budget</Button>
  )

  return (
    <Dialog onOpenChange={clean} open={open}>
      <DialogTrigger asChild>
        {customTrigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="min-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add budget</DialogTitle>
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
                        <FormControl>
                          <Input placeholder="Title" disabled={isLoading} id="title" {...field} />
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
                        <FormControl>
                        <div className="flex gap-2">
                          <div>
                            <Input placeholder="10" disabled={isLoading} id="amount" {...field} />
                          </div>
                          <span className="flex items-center text-sm">
                            { form.watch('currency') && getCurrencySign()}
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
                        <FormControl>
                          <Select
                            disabled={isLoading}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Currencies</SelectLabel>
                                {currencies && currencies.map((item: Currency) => (
                                  <SelectItem key={item.uuid} value={item.uuid}>{item.code}</SelectItem>
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
                <div className="flex flex-col flex-1 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            disabled={isLoading}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="w-full">
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
                        <FormControl>
                          <Select
                            disabled={isLoading}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select user" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Budget owner</SelectLabel>
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
                            defaultValue={field.value}
                            className={styles.radio}
                          >
                            <Label className="w-full">
                              <RadioGroupItem value="" id="r1" />
                              <span>Do not repeat</span>
                            </Label>
                            <Label className="w-full">
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            disabled={isLoading}
                            placeholder="Add description if you want"
                            className="resize-none h-full"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex-1 w-3/5 justify-end">
                  <FormField
                    control={form.control}
                    name="budgetDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Calendar
                            disabled={isLoading}
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            <Button type="submit">Submit</Button>
          </form>
        </Form>
        </DialogContent>
      </Dialog>
    )
}

export default AddForm
