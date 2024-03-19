import React from 'react'
import axios from 'axios'
import * as z from 'zod'
import { useSWRConfig } from 'swr'
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

const formSchema = z.object({
  email: z.string().email()
})

const AddForm: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })

  const { toast } = useToast()
  const { mutate } = useSWRConfig()

  const cleanFormErrors = (open: boolean) => {
    if (!open) {
      form.clearErrors()
    }
  }

  const handleSave = (payload: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    axios.post('users/invite/', {
      ...payload
    }).then(
      res => {
        if (res.status === 201) {
          mutate('users/invite/')
        }
        toast({
          title: 'Saved!'
        })
      }
    ).catch(
      (error) => {
        const errRes = error.response.data
        for (const prop in errRes) {
          if (prop === 'nonFieldErrors' && errRes[prop].indexOf('unique set')) {
            toast({
              variant: 'destructive',
              title: 'You have already sent invite for this user'
            })
          } else {
            toast({
              variant: 'destructive',
              title: 'Something went wrong',
              description: errRes[prop]
            })
          }
        }
      }
    ).finally(() => {
      setIsLoading(false)
    })
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
                          disabled={isLoading}
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
