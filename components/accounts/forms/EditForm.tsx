import * as React from 'react'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { AccountResponse } from '@/components/accounts/types'
import { useAccounts, useUpdateAccount } from '@/hooks/accounts'
import { useCategories } from '@/hooks/categories'
import { Category, CategoryType } from '@/components/categories/types'
import { useUsers } from '@/hooks/users'
import { extractErrorMessage } from '@/utils/stringUtils'
import { useSWRConfig } from 'swr'

interface Types {
  uuid: string
}

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters'
  }),
  user: z.string().uuid({ message: 'Please, select user' }),
  category: z.union([z.string().uuid(), z.string().length(0)]).optional().nullable(),
  isMain: z.boolean(),
  description: z.string().optional()
})

const EditForm: React.FC<Types> = ({ uuid }) => {
  const { mutate } = useSWRConfig()
  const [incomeCategories, setIncomeCategories] = React.useState<Category[]>([])
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isMain: false
    }
  })

  const { data: accounts = [] } = useAccounts()
  const { trigger: updateAccount, isMutating: isUpdating } = useUpdateAccount(uuid)

  const { data: users = [] } = useUsers()

  const { data: categories = [] } = useCategories()

  React.useEffect(() => {
    if (categories.length === 0) return

    setIncomeCategories(categories.filter((item: Category) => item.type === CategoryType.Income))
  }, [categories])

  React.useEffect(() => {
    if (accounts.length === 0) return

    const _account = accounts.find((_item: AccountResponse) => _item.uuid === uuid)!

    form.setValue('title', _account.title)
    form.setValue('user', _account.user)
    form.setValue('isMain', _account.isMain)
    form.setValue('category', _account.category)
    form.setValue('description', _account.description)
  }, [accounts])

  const cleanFormErrors = (open: boolean) => {
    if (!open) {
      form.clearErrors()
    }
  }

  const handleSave = async (payload: z.infer<typeof formSchema>) => {
    // TODO: optimistic update
    try {
      await updateAccount(payload)
      mutate('accounts/')
      toast({
        title: 'Saved!'
      })
    } catch (error) {
      const message = extractErrorMessage(error)
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: message,
      })
    }
  }

  return (
    <Dialog onOpenChange={cleanFormErrors}>
      <DialogTrigger asChild className="mx-2">
        <Button variant="ghost">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit account</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
            <div className="flex flex-col space-y-3">
              <div className="flex w-full">
                <div className="flex w-2/3">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account title</FormLabel>
                        <FormControl>
                          <Input className="w-full" disabled={isUpdating} id="title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex w-1/3 items-center">
                  <FormField
                    control={form.control}
                    name="isMain"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="isMain"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isUpdating}
                            />
                            <Label htmlFor="isMain">Active</Label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex w-full">
                <div className="flex w-1/2">
                  <FormField
                    control={form.control}
                    name="user"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="relative w-full">
                              <SelectValue placeholder="Select user" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {(users.length > 0) && users.map((item: unknown) => (
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
                </div>
                <div className="flex w-1/2">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Income category</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="relative w-full">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="none"><em>No income for this category</em></SelectItem>
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
              </div>
              <div className="flex pt-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Add description if you want"
                          className="resize-none"
                          disabled={isUpdating}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button disabled={isUpdating} type="submit">Save</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default EditForm
