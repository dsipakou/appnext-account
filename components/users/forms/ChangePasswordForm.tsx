// System
import React from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
// UI
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import * as Dialog from '@/components/ui/dialog'
import * as Form from '@/components/ui/form'
import { Input } from '@/components/ui/input'
// Hooks
import { useResetPassword } from '@/hooks/users'
// Utils
import { extractErrorMessage } from '@/utils/stringUtils'

const formSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z
    .string()
    .min(8),
  confirmPassword: z
    .string()
    .min(8),
}).superRefine((values, ctx) => {
  if (values.newPassword !== values.confirmPassword) {
    ctx.addIssue({
      message: 'Passwords do not match',
      code: z.ZodIssueCode.custom,
      path: ['confirmPassword']
    })
  }
})

const ChangePasswordForm: React.FC = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })

  const { toast } = useToast()
  const { trigger: resetPassword, isMutating: isReseting } = useResetPassword()

  const handleCommit = async (payload: z.infer<typeof formSchema>) => {
    try {
      await resetPassword({
        oldPassword: payload.currentPassword,
        newPassword: payload.newPassword,
      })
      toast({
        title: 'Password updated!'
      })
    } catch (error) {
      const message = extractErrorMessage(error)
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: JSON.stringify(message),
      })
    }
  }

  const cleanFormErrors = () => {
    form.clearErrors()
    form.reset()
  }

  return (
    <Dialog.Dialog onOpenChange={cleanFormErrors}>
      <Dialog.DialogTrigger asChild className="mx-2">
        <Button>Change Password</Button>
      </Dialog.DialogTrigger>
      <Dialog.DialogContent>
        <Dialog.DialogHeader>
          <Dialog.DialogTitle>Add user to the workspace</Dialog.DialogTitle>
        </Dialog.DialogHeader>
        <Form.Form {...form}>
          <form onSubmit={form.handleSubmit(handleCommit)} className="space-y-4">
            <div className="flex w-full">
              <Form.FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <Form.FormItem>
                    <Form.FormLabel>Your current password</Form.FormLabel>
                    <Form.FormControl>
                      <Input
                        className="w-full"
                        disabled={isReseting}
                        type="password"
                        id="verbalName"
                        {...field}
                      />
                    </Form.FormControl>
                    <Form.FormMessage />
                  </Form.FormItem>
                )}
              />
            </div>
            <div className="flex w-full pt-7">
              <Form.FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <Form.FormItem>
                    <Form.FormLabel>New password</Form.FormLabel>
                    <Form.FormControl>
                      <Input
                        className="w-full"
                        disabled={isReseting}
                        type="password"
                        id="verbalName"
                        {...field}
                      />
                    </Form.FormControl>
                    <Form.FormMessage />
                  </Form.FormItem>
                )}
              />
            </div>
            <div className="flex w-full">
              <Form.FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <Form.FormItem>
                    <Form.FormLabel>Repeat new password</Form.FormLabel>
                    <Form.FormControl>
                      <Input
                        className="w-full"
                        disabled={isReseting}
                        type="password"
                        id="verbalName"
                        {...field}
                      />
                    </Form.FormControl>
                    <Form.FormMessage />
                  </Form.FormItem>
                )}
              />
            </div>
            <Button type="submit">Reset password</Button>
          </form>
        </Form.Form>
      </Dialog.DialogContent>
    </Dialog.Dialog>
  )
}

export default ChangePasswordForm
