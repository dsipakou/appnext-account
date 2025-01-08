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
import { useAccounts } from '@/hooks/accounts'
import { ConfirmTransactionsTransferForm } from '@/components/accounts/forms'
import { AccountResponse } from '@/components/accounts/types'

const formSchema = z.object({
  account: z.string()
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

  const { data: accounts = [] } = useAccounts()

  const filteredAccounts = accounts.filter((item: AccountResponse) => item.uuid !== uuid)

  const watchAccount = form.watch('account')

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link">Manage</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage account</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-8">
            <div className="flex flex-col space-y-3">
              <div className="flex w-full">
                <FormField
                  control={form.control}
                  name="account"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Re-assign transactions from this account to</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoading || filteredAccounts.length === 0}
                        >
                          <SelectTrigger className="relative w-full" asChild>
                            <SelectValue placeholder={filteredAccounts.length > 0 ? "Choose account" : "You do not have applicable accounts"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {filteredAccounts.map((account: AccountResponse) => (
                                <SelectItem key={account.uuid} value={account.uuid}>{account.title}</SelectItem>
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
        <Button disabled={isLoading || !watchAccount} onClick={() => setIsConfirmTransferOpen(true)}>Transfer</Button>
        {isConfirmTransferOpen &&
          <ConfirmTransactionsTransferForm
            open={isConfirmTransferOpen}
            setOpen={setIsConfirmTransferOpen}
            sourceAccount={uuid}
            destAccount={watchAccount}
          />
        }
      </DialogContent>
    </Dialog>
  )
}

export default ReassignTransactionsForm
