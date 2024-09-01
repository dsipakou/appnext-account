import React from 'react'
import { X } from 'lucide-react'
import * as z from 'zod'
import EmojiPicker from 'emoji-picker-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl
} from '@/components/ui/form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useSWRConfig } from 'swr'
import { Category, CategoryResponse } from '@/components/categories/types'
import { useCategories, useUpdateCategory } from '@/hooks/categories'
import { extractErrorMessage } from '@/utils/stringUtils'

interface Types {
  uuid: string
}

const formSchema = z.object({
  name: z.string().min(2),
  parent: z.string().uuid().nullable(),
  description: z.string().optional()
})

const EditForm: React.FC<Types> = ({ uuid }) => {
  const { mutate } = useSWRConfig()
  const { data: categories = [] } = useCategories()
  const { toast } = useToast()
  const { trigger: updateCategory, isMutating: isUpdating } = useUpdateCategory(uuid)

  const [parentList, setParentList] = React.useState<Category[]>([])
  const [selectedEmoji, setSelectedEmoji] = React.useState<string | null>(null)
  const [errors, setErrors] = React.useState<string[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })

  React.useEffect(() => {
    if (!categories) return

    const _category = categories.find((item: CategoryResponse) => item.uuid === uuid)

    if (_category == null) return

    const _parentCategories = categories.filter(
      (item: any) => item.parent === null && item.type === _category.type
    )

    form.setValue('name', _category.name)
    form.setValue('parent', _category.parent)
    form.setValue('description', _category.description)

    setParentList(_parentCategories)
  }, [categories, uuid])

  const handleSave = async (payload: z.infer<typeof formSchema>) => {
    try {
      await updateCategory({
        payload,
        icon: selectedEmoji,
      })
      mutate('categories/')
      toast({
        title: 'Category updated'
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit category</DialogTitle>
        </DialogHeader>
        <div className="flex gap-4 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Choose icon</Button>
            </PopoverTrigger>
            <PopoverContent className="flex w-[400px] justify-center" sideOffset={5}>
              <div>
                <EmojiPicker
                  className="flex mt-5 h-20"
                  skinTonesDisabled={true}
                  onEmojiClick={(event) => setSelectedEmoji(event.emoji)}
                />
              </div>
              <PopoverClose className="absolute top-5 right-5">
                <X className="w-4 h-4" />
              </PopoverClose>
            </PopoverContent>
          </Popover>
          <span>{selectedEmoji}</span>
          {selectedEmoji && (
            <Button variant="link" onClick={() => setSelectedEmoji(null)}>
              <X className="w-4 h-4 mr-2" />
              <span>clear icon</span>
            </Button>
          )}
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
            <div className="flex flex-col space-y-3">
              <div className="flex w-full">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category name</FormLabel>
                      <FormControl>
                        <Input className="w-full" disabled={isUpdating} id="name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {form.getValues('parent') && (
                <div className="flex w-full">
                  <FormField
                    control={form.control}
                    name="parent"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isUpdating}
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
