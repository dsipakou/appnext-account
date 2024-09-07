import React from 'react'
import { useSWRConfig } from 'swr'
import { Check, Copy } from 'lucide-react'
// UID
import { Button } from '@/components/ui/button'
import * as Dlg from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
// Hooks
import { useDuplicateBudget } from '@/hooks/budget'
import { DuplicateBudgetResponse } from '@/components/budget/types'

interface BudgetCardTypes {
  date: string
  title: string
  selected: boolean
  handleClick: () => void
}

interface Types {
  budgetList: DuplicateBudgetResponse[],
  urlToMutate: string,
  mutateBudget: () => void
}

const BudgetCard: React.FC<BudgetCardTypes> = ({
  date,
  title,
  selected = false,
  handleClick
}) => {
  return (
    <>
      <div className={`overflow-hidden w-full h-24 cursor-pointer border rounded p-2 ${!selected ? 'drop-shadow-md bg-white' : 'text-white bg-blue-500'}`}
        onClick={handleClick}
      >
        <div className="flex flex-col">
          <div className="flex justify-between">
            <span className="text-xs">{date}</span>
            {selected && <Check className="h-4 w-4" />}
          </div>
          <span className="text-md font-semibold">{title}</span>
        </div>
      </div>
      <div className="test flex flex-col">
      </div>
    </>
  )
}

const DuplicateForm: React.FC<Types> = ({ budgetList, urlToMutate, mutateBudget }) => {
  const [selectedBudgetUuids, setSelectedBudgetUuids] = React.useState<string[]>([])
  const { trigger: duplicate, isMutating: isDuplicating } = useDuplicateBudget()
  const { mutate } = useSWRConfig()
  const { toast } = useToast()

  const isBudgetSelected = (uuid: string): boolean => {
    return selectedBudgetUuids.includes(uuid)
  }

  const handleClickBudget = (uuid: string) => {
    if (isBudgetSelected(uuid)) {
      setSelectedBudgetUuids((oldList: string[]) => oldList.filter((_uuid: string) => _uuid !== uuid))
    } else {
      setSelectedBudgetUuids((oldList: string[]) => [...oldList, uuid])
    }
  }

  const selectAllBudgets = (): void => {
    const uuidsArray: string[] = []
    budgetList.forEach((budgetItem: DuplicateBudgetResponse) => {
      uuidsArray.push(budgetItem.uuid)
    })
    setSelectedBudgetUuids(uuidsArray)
  }

  const handleDuplicateClick = async (): void => {
    try {
      await duplicate({ uuids: selectedBudgetUuids })
      mutate(urlToMutate)
      mutateBudget()
      toast({
        title: 'Successfully duplicated'
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Cannot duplicate',
      })
    }
  }

  const clearForm = () => {
    setSelectedBudgetUuids([])
  }

  return (
    <Dlg.Dialog onOpenChange={clearForm}>
      <Dlg.DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-blue-500 border-blue-500 hover:text-blue-600"
        >
          <Copy className="mr-2" /> Duplicate
        </Button>
      </Dlg.DialogTrigger>
      <Dlg.DialogContent className="min-w-[600px]">
        {budgetList.length > 0 && (
          <Dlg.DialogHeader>
            <Dlg.DialogTitle>Choose budget to repeat</Dlg.DialogTitle>
          </Dlg.DialogHeader>
        )}
        <div className="flex flex-col gap-3">
          {budgetList.length === 0
            ? (
              <>
                <span className="text-2xl">Nothing more to duplicate</span>
              </>
            )
            : (
              <>
                <div className="flex justify-between">
                  <Button
                    variant="default"
                    onClick={handleDuplicateClick}
                    disabled={selectedBudgetUuids.length === 0 || isDuplicating}
                  >
                    Duplicate selected
                  </Button>
                  <div>
                    <Button disabled={isDuplicating} variant="link" onClick={selectAllBudgets}>Select all</Button>
                    <Button disabled={isDuplicating} variant="link" onClick={() => setSelectedBudgetUuids([])}>Deselect all</Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {budgetList.map((budgetItem: DuplicateBudgetResponse) => (
                    <div key={budgetItem.uuid}>
                      <BudgetCard
                        title={budgetItem.title}
                        date={budgetItem.date}
                        handleClick={() => handleClickBudget(budgetItem.uuid)}
                        selected={isBudgetSelected(budgetItem.uuid)}
                      />
                    </div>)
                  )}
                </div>
              </>
            )
          }
        </div>
      </Dlg.DialogContent>
    </Dlg.Dialog>
  )
}

export default DuplicateForm
