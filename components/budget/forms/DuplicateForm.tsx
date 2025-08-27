import React from 'react';
import { useSWRConfig } from 'swr';
import { Copy } from 'lucide-react';
// UI
import { Button } from '@/components/ui/button';
import * as Dlg from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
// Hooks
import { useDuplicateBudget } from '@/hooks/budget';
import { DuplicateBudgetResponse } from '@/components/budget/types';
// Utils
import { cn } from '@/lib/utils';

interface BudgetCardTypes {
  date: string;
  title: string;
  selected: boolean;
  amount: number;
  currency: string;
  handleClick: () => void;
  onAmountChange: (value: number) => void;
}

interface Types {
  budgetList: DuplicateBudgetResponse[];
  urlToMutate: string;
  mutateBudget: () => void;
}

interface DuplicatePayload {
  [uuid: string]: number;
}

const BudgetCard: React.FC<BudgetCardTypes> = ({
  date,
  title,
  selected = false,
  amount,
  currency,
  handleClick,
  onAmountChange,
}: BudgetCardTypes) => {
  return (
    <div
      className={cn(
        'flex flex-col justify-between overflow-hidden w-full h-24 border rounded p-2',
        !selected && 'drop-shadow-md bg-white',
        selected && 'bg-blue-100'
      )}
    >
      <div className="flex justify-between">
        <span className="text-xs">{date}</span>
        <Checkbox className="cursor-pointer" checked={selected} onClick={handleClick} />
      </div>
      <div className="whitespace-wrap truncate text-ellipsis overflow-hidden">
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <div className="flex gap-2">
        <Input
          className={cn('h-6 bg-white text-sm', selected && 'bg-blue-50')}
          value={amount}
          onChange={(e) => onAmountChange(parseFloat(e.target.value) || 0)}
          type="number"
          step="0.01"
        />
        {currency}
      </div>
    </div>
  );
};

const DuplicateForm: React.FC<Types> = ({ budgetList, urlToMutate, mutateBudget }) => {
  const [selectedBudgets, setSelectedBudgetUuids] = React.useState<DuplicatePayload>({});
  const [budgetListState, setBudgetListState] = React.useState<DuplicateBudgetResponse[]>(budgetList);
  const [showOccasional, setShowOccasional] = React.useState<boolean>(false);
  const { trigger: duplicate, isMutating: isDuplicating } = useDuplicateBudget();
  const { mutate } = useSWRConfig();
  const { toast } = useToast();

  React.useEffect(() => {
    if (budgetList.length > 0) {
      setBudgetListState(budgetList);
    }
  }, [budgetList]);

  const filteredBudgetList = React.useMemo(() => {
    if (showOccasional) {
      return budgetListState;
    }
    return budgetListState.filter((budget) => budget.recurrent !== 'occasional');
  }, [budgetListState, showOccasional]);

  const isBudgetSelected = (uuid: string): boolean => {
    return uuid in selectedBudgets;
  };

  const handleClickBudget = (uuid: string, amount: number) => {
    setSelectedBudgetUuids((prevBudgets: DuplicatePayload) => {
      const newBudgets = { ...prevBudgets };
      if (uuid in newBudgets) {
        delete newBudgets[uuid];
      } else {
        newBudgets[uuid] = amount;
      }
      return newBudgets;
    });
  };

  const selectAllBudgets = (): void => {
    const uuids: DuplicatePayload = {};
    filteredBudgetList.forEach((budgetItem: DuplicateBudgetResponse) => {
      uuids[budgetItem.uuid] = budgetItem.amount;
    });
    setSelectedBudgetUuids(uuids);
  };

  const handleAmountChange = (uuid: string, amount: number) => {
    setBudgetListState((oldList: DuplicateBudgetResponse[]) =>
      oldList.map((budgetItem: DuplicateBudgetResponse) => {
        if (budgetItem.uuid === uuid) {
          return { ...budgetItem, amount: amount };
        }
        return budgetItem;
      })
    );
    setSelectedBudgetUuids((prevBudgets: DuplicatePayload) => {
      const newBudgets = { ...prevBudgets };
      if (uuid in newBudgets) {
        newBudgets[uuid] = amount;
      }
      return newBudgets;
    });
  };

  const handleDuplicateClick = async (): Promise<void> => {
    try {
      await duplicate({
        budgets: Object.keys(selectedBudgets).map((key: string) => {
          return {
            uuid: key,
            value: selectedBudgets[key],
          };
        }),
      });
      mutate(urlToMutate);
      mutateBudget();
      toast({
        title: 'Successfully duplicated',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Cannot duplicate',
      });
    }
  };

  const clearForm = () => {
    setSelectedBudgetUuids({});
    setShowOccasional(false);
  };

  return (
    <Dlg.Dialog onOpenChange={clearForm}>
      <Dlg.DialogTrigger asChild>
        <Button variant="outline" className="text-blue-500 border-blue-500 hover:text-blue-600">
          <Copy className="mr-2" /> Duplicate
        </Button>
      </Dlg.DialogTrigger>
      <Dlg.DialogContent className="min-w-[600px]">
        {budgetListState.length > 0 && (
          <Dlg.DialogHeader>
            <Dlg.DialogTitle>Choose budget to repeat</Dlg.DialogTitle>
          </Dlg.DialogHeader>
        )}
        <div className="flex flex-col gap-3">
          {budgetListState.length === 0 ? (
            <span className="text-2xl">Nothing more to duplicate</span>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <Button
                  variant="default"
                  onClick={handleDuplicateClick}
                  disabled={Object.keys(selectedBudgets).length === 0 || isDuplicating}
                >
                  Duplicate selected
                </Button>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="show-occasional"
                      checked={showOccasional}
                      onCheckedChange={setShowOccasional}
                      disabled={isDuplicating}
                    />
                    <Label htmlFor="show-occasional" className="text-sm">
                      Show occasional budgets
                    </Label>
                  </div>
                  <div>
                    <Button disabled={isDuplicating} variant="link" onClick={selectAllBudgets}>
                      Select all
                    </Button>
                    <Button disabled={isDuplicating} variant="link" onClick={() => setSelectedBudgetUuids({})}>
                      Deselect all
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {filteredBudgetList.map((budgetItem: DuplicateBudgetResponse) => (
                  <div key={budgetItem.uuid}>
                    <BudgetCard
                      title={budgetItem.title}
                      date={budgetItem.date}
                      amount={budgetItem.amount}
                      currency={budgetItem.currency}
                      handleClick={() => handleClickBudget(budgetItem.uuid, budgetItem.amount)}
                      selected={isBudgetSelected(budgetItem.uuid)}
                      onAmountChange={(value: number) => handleAmountChange(budgetItem.uuid, value)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Dlg.DialogContent>
    </Dlg.Dialog>
  );
};

export default DuplicateForm;
