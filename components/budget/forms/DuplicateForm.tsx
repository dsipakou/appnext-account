import React from 'react'
import axios from 'axios'
import { useSWRConfig } from 'swr'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogContent,
} from '@/components/ui/dialog'
import { useBudgetDuplicate } from '@/hooks/budget'
import { getFormattedDate } from '@/utils/dateUtils'
import { DuplicateBudgetResponse } from '@/components/budget/types'
import { useToast } from '@/components/ui/use-toast'

interface BudgetCardTypes {
  date: string
  title: string
  selected: boolean
  handleClick: () => void
}

interface Types {
  date: Date
  type: "month" | "week"
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
          { selected && <Check className="h-4 w-4" /> }
        </div> 
        <span className="text-md font-semibold">{title}</span>
      </div>
    </div>
    <div className="test flex flex-col">
    </div>
  </>
  )
}

const DuplicateForm: React.FC<Types> = ({ date, type, mutateBudget }) => {
  const [selectedBudgetUuids, setSelectedBudgetUuids] = React.useState<string[]>([])
  const formattedDate = getFormattedDate(date)
  const {
    data: budgetList = [],
    url: urlToMutate
  } = useBudgetDuplicate(type, formattedDate)
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

  const handleDuplicateClick = (): void => {
    axios.post('budget/duplicate/', {
      uuids: selectedBudgetUuids,
    }).then(
      res => {
        if (res.status === 201) {
          mutate(urlToMutate)
          mutateBudget()
          toast({
            title: "Successfully duplicated"
          })
        }
      }
    ).catch(
      (error) => {
        toast({
          variant: "destructive",
          title: "Something went wrong",
        })
        // TODO: Handle errors
      })
  }

  const clearForm = () => {
    setSelectedBudgetUuids([])
  }

  return (
    <Dialog onOpenChange={clearForm}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-blue-500 border-blue-500 hover:text-blue-600"><Copy className="mr-2" /> Duplicate</Button>
      </DialogTrigger>
      <DialogContent className="min-w-[600px]">
        { budgetList.length > 0 && (
          <DialogHeader>
            <DialogTitle>Choose budget to repeat</DialogTitle>
          </DialogHeader>
        )}
        <div className="flex flex-col gap-3">
          { budgetList.length === 0 
            ? (
              <div className="flex col-span-4 justify-center"><span className="text-2xl">Nothing to duplicate</span></div> 
            )
            : (
            <>
              <div className="flex justify-between">
                <Button
                  variant="default"
                  onClick={handleDuplicateClick}
                  disabled={selectedBudgetUuids.length === 0}
                >
                  Duplicate selected
                </Button>
                <div>
                  <Button variant="link" onClick={selectAllBudgets}>Select all</Button>
                  <Button variant="link" onClick={() => setSelectedBudgetUuids([])}>Deselect all</Button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                { budgetList.map((budgetItem: DuplicateBudgetResponse) => (
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
      </DialogContent>
    </Dialog>
  )
}

export default DuplicateForm
