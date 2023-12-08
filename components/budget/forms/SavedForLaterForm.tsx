import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogContent,
} from '@/components/ui/dialog'

const SavedForLaterForm: React.FC = () => {
  const clearForm = () => {
  }

  const budgetList = []

  return (
    <Dialog onOpenChange={clearForm}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-blue-500 border-blue-500 hover:text-blue-600"
        >
          View saved for later
        </Button>
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

export default SavedForLaterForm
