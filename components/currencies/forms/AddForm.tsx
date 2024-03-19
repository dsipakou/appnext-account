import React from 'react'
import * as z from 'zod'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import axios from 'axios'
import { useSWRConfig } from 'swr'
import { useToast } from '@/components/ui/use-toast'

interface Types {
  open: boolean
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
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })

  const { toast } = useToast()

  const handleSave = async (payload: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    axios.post('currencies/', {
      ...payload
    }).then(
      res => {
        if (res.status === 201) {
          mutate('currencies/')
          if (res.data.isBase) {
            updateSession({ currency: payload.code })
          }
          toast({
            title: 'Saved!'
          })
          handleClose()
        } else {
          // TODO: handle errors
        }
      }
    ).catch(
      (error) => {
        const errRes = error.response.data
        for (const prop in errRes) {
          toast({
            variant: 'destructive',
            title: 'Something went wrong',
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
    }
  }

  return (
    <Dialog onOpenChange={cleanFormErrors}>
      <DialogTrigger asChild className="mx-2">
        <Button>+ Add currency</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add currency</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
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
                            disabled={isLoading}
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
                            disabled={isLoading}
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
                            disabled={isLoading}
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
                              disabled={isLoading}
                            />
                            <Label htmlFor="isDefault">make it default</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="text-black h-4 w-4"/>
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
