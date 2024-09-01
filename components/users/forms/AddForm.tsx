import React from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { useToast } from '@/components/ui/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'

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
  FormLabel
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useCreateInvite } from '@/hooks/users'
import { extractErrorMessage } from '@/utils/stringUtils'

const formSchema = z.object({
  email: z.string().email()
})

const AddForm: React.FC = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })

  const { toast } = useToast()
  const { trigger: createInvite, isMutating: isCreating } = useCreateInvite()

  const cleanFormErrors = (open: boolean) => {
    if (!open) {
      form.clearErrors()
    }
  }

  const handleSave = async (payload: z.infer<typeof formSchema>) => {
    try {
      await createInvite(payload)
      toast({
        title: 'Saved!'
      })
    } catch (error) {
      const message = extractErrorMessage(error)
      if (JSON.stringify(message).includes('unique set')) {
        toast({
          variant: 'destructive',
          title: 'You have already sent invite for this user'
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Something went wrong',
          description: JSON.stringify(message),
        })
      }
    }
  }

  return (
    <Dialog onOpenChange={cleanFormErrors}>
      <DialogTrigger asChild className="mx-2">
        <Button>+ Add member</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add user to the workspace</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
            <div className="flex flex-col space-y-3">
              <div className="flex w-full">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full"
                          disabled={isCreating}
                          placeholder="user@example.com"
                          id="verbalName"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button type="submit">Send invite</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddForm
