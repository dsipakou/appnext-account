
import { FC, useEffect } from 'react'
import { useSWRConfig } from 'swr'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'

import { useCurrencies, useUpdateCurrency } from '@/hooks/currencies'
import { useToast } from '@/components/ui/use-toast'
import { extractErrorMessage } from '@/utils/stringUtils'

import { Currency } from '../types'

interface Types {
  uuid: string
  open: boolean
  setOpen: (value: boolean) => void
}

const formSchema = z.object({
  verbalName: z.string().min(2, { message: 'Must be at least 2 characters long' }),
  code: z.string().length(3, {
    message: 'Must be 3 characters long'
  }),
  sign: z.string({
    required_error: 'You need to specify currency sign'
  }),
  isDefault: z.boolean(),
  comments: z.string().optional()
})

const EditForm: FC<Types> = ({ uuid, open, setOpen }) => {
  const { mutate } = useSWRConfig()
  const { data: currencies = [] } = useCurrencies()
  const { trigger: updateCurrency, isMutating: isUpdating } = useUpdateCurrency(uuid)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })
  const { toast } = useToast()

  useEffect(() => {
    if (!currencies.length) return

    const _currency = currencies.find((item: Currency) => item.uuid === uuid)
    if (!_currency) return

    form.setValue('verbalName', _currency.verbalName)
    form.setValue('code', _currency.code)
    form.setValue('sign', _currency.sign)
    form.setValue('isDefault', _currency.isDefault)
    form.setValue('comments', _currency.comments)
    return () => {
    }
  }, [currencies, uuid])

  const handleUpdate = async (payload: z.infer<typeof formSchema>): void => {
    try {
      await updateCurrency(payload)
      mutate('currencies/')
      cleanFormErrors()
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

  const cleanFormErrors = (open: boolean) => {
    if (!open) {
      form.clearErrors()
      form.reset()
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={cleanFormErrors}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update currency details</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-8">
            <div className="flex flex-col space-y-3">
              <div className="flex w-full">
                <div className="flex w-2/3">
                  <FormField
                    control={form.control}
                    name="verbalName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency name</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            disabled={isUpdating}
                            placeholder="US Dollar"
                            id="verbalName"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex w-1/3">
                  <FormField
                    control={form.control}
                    name="sign"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sign</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            disabled={isUpdating}
                            placeholder="$"
                            id="sign"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex w-full items-end">
                <div className="flex w-1/2">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            disabled={isUpdating}
                            placeholder="USD"
                            id="code"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex w-1/2 pb-2">
                  <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="isDefault"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isUpdating}
                            />
                            <Label htmlFor="isDefault">make it default</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="text-black h-4 w-4" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Making this currency as default <br />will make current default currency as non-default</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
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
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Any comments"
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
            <Button type="submit">Save</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default EditForm
