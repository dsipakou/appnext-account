import * as React from 'react';
import { useStore } from '@/app/store';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowRight, Trash2 } from 'lucide-react';
import { useSWRConfig } from 'swr';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import * as Dlg from '@/components/ui/dialog';
import * as Frm from '@/components/ui/form';
import * as Slc from '@/components/ui/select';
import * as Tbl from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';
import { useAccounts } from '@/hooks/accounts';
import { useCurrencies } from '@/hooks/currencies';
import { useCreateTransfer, useDeleteTransfer, useTransfers } from '@/hooks/transactions';
import { AccountResponse } from '@/components/accounts/types';
import { Currency } from '@/components/currencies/types';
import { TransferResponse } from '@/components/transactions/types';
import { getFormattedDate } from '@/utils/dateUtils';

const formSchema = z
  .object({
    fromAccount: z.string().uuid({ message: 'Please, select source account' }),
    toAccount: z.string().uuid({ message: 'Please, select destination account' }),
    currency: z.string().uuid({ message: 'Please, select currency' }),
    amount: z.coerce.number().positive({ message: 'Should be positive number' }),
    description: z.string().optional(),
    transferDate: z.date({ message: 'Transfer date is required' }),
  })
  .superRefine((value, ctx) => {
    if (value.fromAccount === value.toAccount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Source and destination accounts must be different',
        path: ['toAccount'],
      });
    }
  });

const DeleteTransferButton: React.FC<{ transfer: TransferResponse }> = ({ transfer }) => {
  const { mutate } = useSWRConfig();
  const { toast } = useToast();
  const { trigger: deleteTransfer, isMutating } = useDeleteTransfer(transfer.uuid);

  const handleDelete = async () => {
    try {
      await deleteTransfer();
      mutate('transactions/transfers/');
      toast({ title: 'Transfer deleted' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Cannot delete transfer',
      });
    }
  };

  return (
    <Button variant="ghost" size="sm" disabled={isMutating} onClick={handleDelete}>
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};

const Transfers: React.FC = () => {
  const {
    data: { user },
  } = useSession();
  const [isOpen, setIsOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date>(new Date());
  const { mutate } = useSWRConfig();
  const { toast } = useToast();
  const currencySign = useStore((state) => state.currency.sign);

  const { data: transfers = [], isLoading } = useTransfers();
  const { data: accounts = [] } = useAccounts();
  const { data: currencies = [] } = useCurrencies();
  const { trigger: createTransfer, isMutating: isCreating } = useCreateTransfer();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      description: '',
      transferDate: new Date(),
    },
  });

  const fromAccount = form.watch('fromAccount');
  const toAccount = form.watch('toAccount');

  const getAccount = (uuid: string): AccountResponse | undefined => {
    return accounts.find((item: AccountResponse) => item.uuid === uuid);
  };

  const isSpendingToSpending = (source?: AccountResponse, destination?: AccountResponse): boolean => {
    return source?.kind === 'spending' && destination?.kind === 'spending';
  };

  React.useEffect(() => {
    const source = getAccount(fromAccount);
    const destination = getAccount(toAccount);

    if (source && destination && isSpendingToSpending(source, destination)) {
      form.setError('toAccount', { message: 'At least one transfer account must be savings' });
    } else {
      form.clearErrors('toAccount');
    }
  }, [fromAccount, toAccount, accounts]);

  const handleSave = async (payload: z.infer<typeof formSchema>) => {
    const source = getAccount(payload.fromAccount);
    const destination = getAccount(payload.toAccount);

    if (isSpendingToSpending(source, destination)) {
      form.setError('toAccount', { message: 'At least one transfer account must be savings' });
      return;
    }

    try {
      await createTransfer({
        ...payload,
        transferDate: getFormattedDate(payload.transferDate),
      });
      mutate('transactions/transfers/');
      toast({ title: 'Transfer saved' });
      form.reset({ amount: '', description: '', transferDate: new Date() });
      setIsOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Cannot create transfer',
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 px-6 min-h-0 flex-1">
      <div className="flex justify-end">
        <Dlg.Dialog open={isOpen} onOpenChange={setIsOpen}>
          <Dlg.DialogTrigger asChild>
            <Button>Add transfer</Button>
          </Dlg.DialogTrigger>
          <Dlg.DialogContent className="min-w-[600px]">
            <Dlg.DialogHeader>
              <Dlg.DialogTitle>Move money between accounts</Dlg.DialogTitle>
            </Dlg.DialogHeader>
            <Frm.Form {...form}>
              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Frm.FormField
                    control={form.control}
                    name="fromAccount"
                    render={({ field }) => (
                      <Frm.FormItem>
                        <Frm.FormLabel>From account</Frm.FormLabel>
                        <Frm.FormControl>
                          <Slc.Select disabled={isCreating} onValueChange={field.onChange} value={field.value}>
                            <Slc.SelectTrigger>
                              <Slc.SelectValue placeholder="Select source" />
                            </Slc.SelectTrigger>
                            <Slc.SelectContent>
                              <Slc.SelectGroup>
                                {accounts.map((item: AccountResponse) => (
                                  <Slc.SelectItem key={item.uuid} value={item.uuid}>
                                    {item.title} ({item.kind})
                                  </Slc.SelectItem>
                                ))}
                              </Slc.SelectGroup>
                            </Slc.SelectContent>
                          </Slc.Select>
                        </Frm.FormControl>
                        <Frm.FormMessage />
                      </Frm.FormItem>
                    )}
                  />
                  <Frm.FormField
                    control={form.control}
                    name="toAccount"
                    render={({ field }) => (
                      <Frm.FormItem>
                        <Frm.FormLabel>To account</Frm.FormLabel>
                        <Frm.FormControl>
                          <Slc.Select disabled={isCreating} onValueChange={field.onChange} value={field.value}>
                            <Slc.SelectTrigger>
                              <Slc.SelectValue placeholder="Select destination" />
                            </Slc.SelectTrigger>
                            <Slc.SelectContent>
                              <Slc.SelectGroup>
                                {accounts.map((item: AccountResponse) => (
                                  <Slc.SelectItem key={item.uuid} value={item.uuid}>
                                    {item.title} ({item.kind})
                                  </Slc.SelectItem>
                                ))}
                              </Slc.SelectGroup>
                            </Slc.SelectContent>
                          </Slc.Select>
                        </Frm.FormControl>
                        <Frm.FormMessage />
                      </Frm.FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Frm.FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <Frm.FormItem>
                        <Frm.FormLabel>Amount</Frm.FormLabel>
                        <Frm.FormControl>
                          <Input disabled={isCreating} {...field} />
                        </Frm.FormControl>
                        <Frm.FormMessage />
                      </Frm.FormItem>
                    )}
                  />
                  <Frm.FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <Frm.FormItem>
                        <Frm.FormLabel>Currency</Frm.FormLabel>
                        <Frm.FormControl>
                          <Slc.Select disabled={isCreating} onValueChange={field.onChange} value={field.value}>
                            <Slc.SelectTrigger>
                              <Slc.SelectValue placeholder="Select currency" />
                            </Slc.SelectTrigger>
                            <Slc.SelectContent>
                              <Slc.SelectGroup>
                                {currencies.map((item: Currency) => (
                                  <Slc.SelectItem key={item.uuid} value={item.uuid}>
                                    {item.code}
                                  </Slc.SelectItem>
                                ))}
                              </Slc.SelectGroup>
                            </Slc.SelectContent>
                          </Slc.Select>
                        </Frm.FormControl>
                        <Frm.FormMessage />
                      </Frm.FormItem>
                    )}
                  />
                </div>
                <Frm.FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <Frm.FormItem>
                      <Frm.FormControl>
                        <Textarea
                          disabled={isCreating}
                          placeholder="Add transfer note"
                          className="resize-none"
                          {...field}
                        />
                      </Frm.FormControl>
                      <Frm.FormMessage />
                    </Frm.FormItem>
                  )}
                />
                <Frm.FormField
                  control={form.control}
                  name="transferDate"
                  render={({ field }) => (
                    <Frm.FormItem>
                      <Frm.FormControl>
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => isCreating || date < new Date('1900-01-01')}
                          month={month}
                          onMonthChange={setMonth}
                          weekStartsOn={1}
                          initialFocus
                        />
                      </Frm.FormControl>
                      <Frm.FormMessage />
                    </Frm.FormItem>
                  )}
                />
                <Button type="submit" disabled={isCreating}>
                  Save transfer
                </Button>
              </form>
            </Frm.Form>
          </Dlg.DialogContent>
        </Dlg.Dialog>
      </div>

      <div className="bg-white rounded-md border min-h-0 flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full py-16">
            <Spinner className="size-8" />
          </div>
        ) : transfers.length === 0 ? (
          <Empty className="py-16">
            <EmptyHeader>
              <EmptyTitle>No transfers yet</EmptyTitle>
              <EmptyDescription>Move money between accounts without affecting budgets or reports.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Tbl.Table>
            <Tbl.TableHeader>
              <Tbl.TableRow>
                <Tbl.TableHead>Date</Tbl.TableHead>
                <Tbl.TableHead>From</Tbl.TableHead>
                <Tbl.TableHead></Tbl.TableHead>
                <Tbl.TableHead>To</Tbl.TableHead>
                <Tbl.TableHead>Amount</Tbl.TableHead>
                <Tbl.TableHead>Description</Tbl.TableHead>
                <Tbl.TableHead></Tbl.TableHead>
              </Tbl.TableRow>
            </Tbl.TableHeader>
            <Tbl.TableBody>
              {transfers.map((transfer: TransferResponse) => (
                <Tbl.TableRow key={transfer.uuid}>
                  <Tbl.TableCell>{transfer.transferDate}</Tbl.TableCell>
                  <Tbl.TableCell>{transfer.fromAccountDetails.title}</Tbl.TableCell>
                  <Tbl.TableCell>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Tbl.TableCell>
                  <Tbl.TableCell>{transfer.toAccountDetails.title}</Tbl.TableCell>
                  <Tbl.TableCell>
                    {transfer.spentInCurrencies[user?.currency].toFixed(2)} {currencySign}
                  </Tbl.TableCell>
                  <Tbl.TableCell>{transfer.description}</Tbl.TableCell>
                  <Tbl.TableCell className="text-right">
                    <DeleteTransferButton transfer={transfer} />
                  </Tbl.TableCell>
                </Tbl.TableRow>
              ))}
            </Tbl.TableBody>
          </Tbl.Table>
        )}
      </div>
    </div>
  );
};

export default Transfers;
