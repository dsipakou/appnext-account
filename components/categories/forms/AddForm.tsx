import React from 'react'
import axios from 'axios'
import * as z from 'zod'
import EmojiPicker from 'emoji-picker-react'

import { useSWRConfig } from 'swr'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useCategories } from '@/hooks/categories'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'

import { Category, CategoryType } from '../types'

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Must be at least 2 characters long'
  }),
  type: z.nativeEnum(CategoryType),
  isParent: z.boolean(),
  parentCategory: z.string().uuid().optional(),
  description: z.string().optional()
}).superRefine((values, ctx) => {
  if (values.type === CategoryType.Expense && values.isParent && !values.parentCategory) {
    ctx.addIssue({
      message: 'Non-parent category should have parent selected',
      code: z.ZodIssueCode.custom,
      path: ['parentCategory']
    })
  }
})

interface Types {
  parent?: Category | undefined
}

const AddForm: React.FC<Types> = ({ parent }) => {
  const { mutate } = useSWRConfig()
  const { data: categories } = useCategories()

  const [parentList, setParentList] = React.useState<Category[]>([])
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [selectedEmoji, setSelectedEmoji] = React.useState<string>('')

  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      type: CategoryType.Expense,
      isParent: false
    }
  })

  const watchIsParent = form.watch('isParent')
  const watchType = form.watch('type')

  React.useEffect(() => {
    if (!categories) return

    const parents = categories.filter(
      (category: Category) => category.parent === null && category.type === CategoryType.Expense
    )
    setParentList(parents)
  }, [categories])

  React.useEffect(() => {
    if (!watchIsParent) {
      form.setValue('parentCategory', undefined)
    }
  }, [watchIsParent])

  React.useEffect(() => {
    if (parent != null) {
      form.setValue('isParent', true)
      form.setValue('parentCategory', parent.uuid)
    }
  }, [parent])

  React.useEffect(() => {
    console.log(selectedEmoji)
  }, [selectedEmoji])

  const handleSave = async (payload: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    axios.post('categories/', {
      name: payload.title,
      parent: payload.parentCategory || '',
      type: payload.type,
      description: payload.description
    }).then(
      res => {
        if (res.status === 201) {
          mutate('categories/')
          toast({
            title: 'Saved!'
          })
        } else {
          // TODO: handle errors
        }
      }
    ).catch(
      (error) => {
        toast({
          variant: 'destructive',
          title: 'Something went wrong',
          description: 'Please, check your fields'
        })
      }
    ).finally(() => { setIsLoading(false) })
  }

  const cleanFormErrors = (open: boolean) => {
    if (!open) {
      form.clearErrors()
      form.reset()
    }
  }

  return (
    <Dialog onOpenChange={cleanFormErrors}>
      <DialogTrigger asChild>
        <Button>+ Add Category</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add category</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
            <div className="flex flex-col space-y-3">
              <div className="self-end">
                {selectedEmoji}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Choose emoji</Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="w-full h-full">
                      <EmojiPicker
                        skinTonesDisabled={true}
                        onEmojiClick={(event) => setSelectedEmoji(event.emoji)}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex w-full">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category title</FormLabel>
                      <FormControl>
                        <Input className="w-full" disabled={isLoading} id="title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category type</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoading || parent}
                        >
                          <SelectTrigger className="relative w-full">
                            <SelectValue placeholder="Category type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value={CategoryType.Income}>Income</SelectItem>
                              <SelectItem value={CategoryType.Expense}>Expense</SelectItem>
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
                { watchType === CategoryType.Expense && (
                  <div className="flex w-1/2 items-center h-12">
                    <FormField
                      control={form.control}
                      name="isParent"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="isParent"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isLoading || parent}
                              />
                              <Label htmlFor="isParent">Has parent</Label>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                { watchType === CategoryType.Expense && watchIsParent && (
                  <div className="flex w-1/2">
                    <FormField
                      control={form.control}
                      name="parentCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isLoading || parent}
                            >
                              <SelectTrigger className="relative w-full">
                                <SelectValue placeholder="Choose parent category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {parentList.map((category: Category) => (
                                    <SelectItem key={category.uuid} value={category.uuid}>{category.name}</SelectItem>
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
                )}
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Add description if you want"
                          className="resize-none"
                          disabled={isLoading}
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

export default AddForm
