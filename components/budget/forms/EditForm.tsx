// System
import React from 'react'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSWRConfig } from 'swr'
import { useForm } from 'react-hook-form'
// Components
import { User } from '@/components/users/types'
import { Category, CategoryType } from '@/components/categories/types'
import { Currency } from '@/components/currencies/types'
// UI
import * as Dialog from '@/components/ui/dialog'
import * as Form from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import * as Select from '@/components/ui/select'
import * as RadioGroup from '@/components/ui/radio-group'
import { Calendar } from '@/components/ui/calendar'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
// Hooks
import { useUsers } from '@/hooks/users'
import { useCategories } from '@/hooks/categories'
import { useCurrencies } from '@/hooks/currencies'
import { useBudgetDetails, useEditBudget } from '@/hooks/budget'
// Utils
import { getFormattedDate, parseDate } from '@/utils/dateUtils'
import { extractErrorMessage } from '@/utils/stringUtils'
// Styles
import styles from '../style/AddForm.module.css'

interface Types {
  open: boolean
  setOpen: (open: boolean) => void
  uuid: string
}

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters'
  }),
  amount: z.coerce.number().min(0, {
    message: 'Should be positive number'
  }),
  currency: z.string().uuid({ message: 'Please, select currency' }),
  user: z.string().uuid({ message: 'Please, select user' }),
  category: z.string().uuid({ message: 'Please, select category' }),
  repeatType: z.enum(['', 'weekly', 'monthly']),
  budgetDate: z.date({
    required_error: 'Budget date is required'
  }),
  description: z.string().or(z.null())
})

const EditForm: React.FC<Types> = ({ open, setOpen, uuid, monthUrl, weekUrl }) => {
  const { mutate } = useSWRConfig()
  const [parentList, setParentList] = React.useState<Category[]>([])
  const [month, setMonth] = React.useState<Date>(new Date())
  const [isSomeDay, setIsSomeDay] = React.useState<boolean>(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repeatType: '',
      amount: 0,
      title: ''
    }
  })

  const { data: users = [] } = useUsers()
  const { data: categories = [] } = useCategories()
  const { data: currencies = [] } = useCurrencies()
  const { trigger: editBudget, isMutating: isEditing } = useEditBudget(uuid)
  const { data: budgetDetails } = useBudgetDetails(uuid)

  React.useEffect(() => {
    if (!categories) return

    const parents = categories.filter(
      (category: Category) => (
        category.parent === null && category.type === CategoryType.Expense
      )
    )
    setParentList(parents)
  }, [categories])

  React.useEffect(() => {
    if (!budgetDetails || (parentList.length === 0)) return

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

  const handleSave = async (payload: z.infer<typeof formSchema>): void => {
    try {
      // TODO: Optimistic update here
      await editBudget({
        ...payload,

        budgetDate: isSomeDay ? null : getFormattedDate(payload.budgetDate),
        recurrent: payload.repeatType,
      })
      mutate(key => typeof key === 'string' && key.includes('budget/usage'), undefined)
      mutate(key => typeof key === 'string' && key.includes('budget/weekly-usage'), undefined)
      mutate('budget/pending/')
      toast({
        title: 'Successfully updated!'
      })
      setOpen(false)
    } catch (error) {
      const message = extractErrorMessage(error)
      toast({
        variant: 'destructive',
        title: 'Cannot be updated',
        description: message,
      })
    }
  }

  const cleanFormErrors = (open: boolean) => {
    if (!open) {
      form.clearErrors()
      form.reset()
    }
    setOpen(false)
  }

  return (
    <Dialog.Dialog open={open} onOpenChange={cleanFormErrors}>
      <Dialog.DialogContent className="min-w-[600px]">
        <Dialog.DialogHeader>
          <Dialog.DialogTitle>Edit budget</Dialog.DialogTitle>
        </Dialog.DialogHeader>
        <Form.Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
            <div className="flex flex-col gap-3">
              <div className="flex w-full">
                <div className="flex sm:w-3/5">
                  <Form.FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <Form.FormItem>
                        <Form.FormLabel>Budget title</Form.FormLabel>
                        <Form.FormControl>
                          <Input disabled={isEditing} id="title" {...field} />
                        </Form.FormControl>
                        <Form.FormMessage />
                      </Form.FormItem>
                    )}
                  />
                </div>
                <div className="flex sm:w-1/5">
                  <Form.FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <Form.FormItem>
                        <Form.FormLabel>Amount</Form.FormLabel>
                        <Form.FormControl>
                          <div className="flex gap-2">
                            <div>
                              <Input disabled={isEditing} id="amount" {...field} />
                            </div>
                            <span className="flex items-center w-5">
                              {form.watch('currency') && getCurrencySign()}
                            </span>
                          </div>
                        </Form.FormControl>
                        <Form.FormMessage />
                      </Form.FormItem>
                    )}
                  />
                </div>
                <div className="flex sm:w-1/5">
                  <Form.FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <Form.FormItem>
                        <Form.FormLabel>Currency</Form.FormLabel>
                        <Form.FormControl>
                          <Select.Select
                            disabled={isEditing}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <Select.SelectTrigger className="relative w-full">
                              <Select.SelectValue placeholder="Select currency" />
                            </Select.SelectTrigger>
                            <Select.SelectContent>
                              <Select.SelectGroup>
                                {currencies && currencies.map((item: Currency) => (
                                  <Select.SelectItem key={item.uuid} value={item.uuid}>
                                    {item.verbalName}
                                  </Select.SelectItem>
                                ))}
                              </Select.SelectGroup>
                            </Select.SelectContent>
                          </Select.Select>
                        </Form.FormControl>
                        <Form.FormMessage />
                      </Form.FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex w-full justify-between">
                <div className="flex flex-col w-2/5 gap-4">
                  <Form.FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <Form.FormItem>
                        <Form.FormLabel>Category</Form.FormLabel>
                        <Form.FormControl>
                          <Select.Select
                            disabled={isEditing || (parentList.length === 0)}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <Select.SelectTrigger className="relative w-[180px]">
                              <Select.SelectValue placeholder="Select category" />
                            </Select.SelectTrigger>
                            <Select.SelectContent>
                              <Select.SelectGroup>
                                <Select.SelectLabel>Categories</Select.SelectLabel>
                                {parentList.map((item: Category) => (
                                  <Select.SelectItem key={item.uuid} value={item.uuid} className="flex items-center">
                                    {item.icon && (<span className="mr-2 text-lg">{item.icon}</span>)}
                                    <span>{item.name}</span>
                                  </Select.SelectItem>
                                ))}
                              </Select.SelectGroup>
                            </Select.SelectContent>
                          </Select.Select>
                        </Form.FormControl>
                        <Form.FormMessage />
                      </Form.FormItem>
                    )}
                  />
                  <Form.FormField
                    control={form.control}
                    name="user"
                    render={({ field }) => (
                      <Form.FormItem>
                        <Form.FormLabel>User</Form.FormLabel>
                        <Form.FormControl>
                          <Select.Select
                            disabled={isEditing}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <Select.SelectTrigger className="relative w-[180px]">
                              <Select.SelectValue placeholder="Select user" />
                            </Select.SelectTrigger>
                            <Select.SelectContent>
                              <Select.SelectGroup>
                                <Select.SelectLabel>Users</Select.SelectLabel>
                                {users && users.map((item: User) => (
                                  <Select.SelectItem key={item.uuid} value={item.uuid}>{item.username}</Select.SelectItem>
                                ))}
                              </Select.SelectGroup>
                            </Select.SelectContent>
                          </Select.Select>
                        </Form.FormControl>
                        <Form.FormMessage />
                      </Form.FormItem>
                    )}
                  />
                  <Form.FormField
                    control={form.control}
                    name="repeatType"
                    render={({ field }) => (
                      <Form.FormItem>
                        <Form.FormControl>
                          <RadioGroup.RadioGroup
                            disabled={isEditing}
                            onValueChange={field.onChange}
                            value={field.value}
                            className={styles.radio}
                          >
                            <Label>
                              <RadioGroup.RadioGroupItem value="" id="r1" />
                              <span>Do not repeat</span>
                            </Label>
                            <Label>
                              <RadioGroup.RadioGroupItem value="weekly" id="r1" />
                              <span>Repeat Weekly</span>
                            </Label>
                            <Label>
                              <RadioGroup.RadioGroupItem value="monthly" id="r1" />
                              <span>Repeat Monthly</span>
                            </Label>
                          </RadioGroup.RadioGroup>
                        </Form.FormControl>
                        <Form.FormMessage />
                      </Form.FormItem>
                    )}
                  />
                  <Form.FormField
                    control={form.control}
                    name="isSomeday"
                    render={({ field }) => (
                      <Form.FormItem className="flex justify-center">
                        <Form.FormControl>
                          <div className="flex gap-2 mt-1 items-center">
                            <Switch
                              id="isSomeday"
                              checked={isSomeDay}
                              onClick={() => setIsSomeDay(!isSomeDay)}
                            />
                            <Label htmlFor="isSomeday">Save for later</Label>
                          </div>
                        </Form.FormControl>
                        <Form.FormMessage />
                      </Form.FormItem>
                    )}
                  />
                </div>
                <div className="flex-1 w-3/5">
                  {
                    isSomeDay
                      ? (
                        <div className="flex flex-col items-center pt-10">
                          <span className="font-semibold text-lg">Someday later</span>
                          <span className="">This budget will appear in 'Saved for later' list</span>
                        </div>
                      )
                      : !isEditing && (
                        <Form.FormField
                          control={form.control}
                          name="budgetDate"
                          render={({ field }) => (
                            <Form.FormItem className="flex justify-center">
                              <Form.FormControl>
                                <Calendar
                                  mode="single"
                                  className="justify-center"
                                  selected={isSomeDay ? null : field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => isEditing || date < new Date('1900-01-01') || isSomeDay}
                                  weekStartsOn={1}
                                  initialFocus
                                />
                              </Form.FormControl>
                              <Form.FormMessage />
                            </Form.FormItem>
                          )}
                        />
                      )
                  }
                </div>
              </div>
            </div>
            <div className="flex">
              <Form.FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Form.FormItem>
                    <Form.FormControl>
                      <Textarea
                        disabled={isEditing}
                        placeholder="Add description if you want"
                        className="resize-none"
                        {...field}
                      />
                    </Form.FormControl>
                    <Form.FormMessage />
                  </Form.FormItem>
                )}
              />
            </div>
            <Button type="submit">Submit</Button>
          </form>
        </Form.Form>
      </Dialog.DialogContent>
    </Dialog.Dialog>
  )
}

export default React.memo(EditForm)
