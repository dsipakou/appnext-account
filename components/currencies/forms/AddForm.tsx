// System
import React from 'react'
import * as z from 'zod'
import { useSWRConfig } from 'swr'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info } from 'lucide-react'
// UI
import { Button } from '@/components/ui/button'
import * as Dlg from '@/components/ui/dialog'
import * as Frm from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import * as Tlp from '@/components/ui/tooltip'
import { useToast } from '@/components/ui/use-toast'
// Hooks
import { useCreateCurrency } from '@/hooks/currencies'
// Utils
import { extractErrorMessage } from '@/utils/stringUtils'

interface Types {
  handleClose: () => void
}

const formSchema = z.object({
  verbalName: z.string().min(2, { message: 'Must be at least 2 characters long' }),
  code: z.string().length(3, {
    message: 'Must be 3 characters long'
  }),
  sign: z.string({
    required_error: 'You need to specify currency sign'
  }),
  isDefault: z.boolean().optional(),
  comments: z.string().optional()
})

const AddForm: React.FC<Types> = ({ handleClose }) => {
  const { mutate } = useSWRConfig()
  const { update: updateSession } = useSession()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })

  const { toast } = useToast()
  const { trigger: createCurrency, isMutating: isCreating } = useCreateCurrency()

  const handleSave = async (payload: z.infer<typeof formSchema>) => {
    try {
      const currency = await createCurrency(payload)
      if (currency.isBase) {
        updateSession({ currency: payload.code })
      }
      toast({
        title: 'Saved!'
      })
      mutate(key => typeof key === 'string' && key.includes('rates/'), undefined)
      handleClose()
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
    }
  }

  return (
    <Dlg.Dialog onOpenChange={cleanFormErrors}>
      <Dlg.DialogTrigger asChild className="mx-2">
        <Button>+ Add currency</Button>
      </Dlg.DialogTrigger>
      <Dlg.DialogContent>
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Add currency</Dlg.DialogTitle>
        </Dlg.DialogHeader>
        <Frm.Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
            <div className="flex flex-col space-y-3">
              <div className="flex w-full">
                <div className="flex w-2/3">
                  <Frm.FormField
                    control={form.control}
                    name="verbalName"
                    render={({ field }) => (
                      <Frm.FormItem>
                        <Frm.FormLabel>Currency name</Frm.FormLabel>
                        <Frm.FormControl>
                          <Input
                            className="w-full"
                            disabled={isCreating}
                            placeholder="US Dollar"
                            id="verbalName"
                            {...field}
                          />
                        </Frm.FormControl>
                      </Frm.FormItem>
                    )}
                  />
                </div>
                <div className="flex w-1/3">
                  <Frm.FormField
                    control={form.control}
                    name="sign"
                    render={({ field }) => (
                      <Frm.FormItem>
                        <Frm.FormLabel>Sign</Frm.FormLabel>
                        <Frm.FormControl>
                          <Input
                            className="w-full"
                            disabled={isCreating}
                            placeholder="$"
                            maxLength={2}
                            id="sign"
                            {...field}
                          />
                        </Frm.FormControl>
                      </Frm.FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex w-full items-end">
                <div className="flex w-1/2">
                  <Frm.FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <Frm.FormItem>
                        <Frm.FormLabel>Code</Frm.FormLabel>
                        <Frm.FormControl>
                          <Input
                            className="w-full"
                            disabled={isCreating}
                            placeholder="USD"
                            maxLength={3}
                            id="code"
                            {...field}
                          />
                        </Frm.FormControl>
                      </Frm.FormItem>
                    )}
                  />
                </div>
                <div className="flex w-1/2 pb-2">
                  <Frm.FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                      <Frm.FormItem>
                        <Frm.FormControl>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="isDefault"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isCreating}
                            />
                            <Label htmlFor="isDefault">make it default</Label>
                            <Tlp.TooltipProvider>
                              <Tlp.Tooltip>
                                <Tlp.TooltipTrigger asChild>
                                  <Info className="text-black h-4 w-4" />
                                </Tlp.TooltipTrigger>
                                <Tlp.TooltipContent>
                                  <p>Making this currency as default <br />will make current default currency as non-default</p>
                                </Tlp.TooltipContent>
                              </Tlp.Tooltip>
                            </Tlp.TooltipProvider>
                          </div>
                        </Frm.FormControl>
                        <Frm.FormMessage />
                      </Frm.FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex pt-6">
                <Frm.FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <Frm.FormItem>
                      <Frm.FormControl>
                        <Textarea
                          placeholder="Any comments"
                          className="resize-none"
                          disabled={isCreating}
                          {...field}
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

export default AddForm
