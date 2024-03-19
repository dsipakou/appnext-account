import React from 'react'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useCategories, useCategory } from '@/hooks/categories'
import { Category, CategoryType } from '@/components/categories/types'
import { ConfirmTransactionsTransferForm } from '@/components/categories/forms'

const formSchema = z.object({
  category: z.string()
})

interface Types {
  uuid: string
}

const ReassignTransactionsForm: React.FC<Types> = ({ uuid }) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isConfirmTransferOpen, setIsConfirmTransferOpen] = React.useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })

  const { data: categories } = useCategories()

  const parentCategories = categories.filter((item: Category) => item.parent === null && item.type === CategoryType.Expense)
  const { data: sourceCategory } = useCategory(uuid)

  const getChildren = (parentUuid: string) => (
    categories.filter((item: Category) => item.parent === parentUuid && item.uuid !== uuid)
  )

  const watchCategory = form.watch('category')

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link">Manage</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage category</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-8">
            <div className="flex flex-col space-y-3">
              <div className="flex w-full">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Re-assign transactions from this category to</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoading}
                        >
                          <SelectTrigger className="relative w-full">
                            <SelectValue placeholder="Choose category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {parentCategories.map((parent: Category) => (
                                getChildren(parent.uuid).map((category: Category) => (
                                  <SelectItem key={category.uuid} value={category.uuid}>{parent.name} / {category.name}</SelectItem>
                                ))
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
          </form>
        </Form>
        <Button disabled={isLoading || !watchCategory} onClick={() => setIsConfirmTransferOpen(true)}>Transfer</Button>
        { isConfirmTransferOpen &&
          <ConfirmTransactionsTransferForm
            open={isConfirmTransferOpen}
            setOpen={setIsConfirmTransferOpen}
            sourceCategory={sourceCategory}
            destCategory={watchCategory}
          />
        }
      </DialogContent>
    </Dialog>
  )
}

export default ReassignTransactionsForm
