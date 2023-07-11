import React, { FC } from 'react'
import {
  Box,
  Chip,
  LinearProgress,
  Typography
} from '@mui/material'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDeleteForm, EditForm } from '@/components/budget/forms'
import { formatMoney } from '@/utils/numberUtils'

interface Types {
  uuid: string
  spent: number
  planned: number
  date: string
  weekUrl: string
  monthUrl: string
  clickShowTransactions: (uuid: string) => void
}

const TimelineBudgetItem: FC<Types> = ({
  uuid,
  spent,
  planned,
  date,
  weekUrl,
  monthUrl,
  clickShowTransactions,
}) => {
  const [isMenuOpened, setIsMenuOpened] = React.useState<boolean>(false)
  const [isEditDialogOpened, setIsEditDialogOpened] = React.useState<boolean>(false)
  const [isConfirmDeleteDialogOpened, setIsConfirmDeleteDialogOpened] = React.useState<boolean>(false)

  const percentage: number = Math.floor(spent * 100 / planned)
  const progressColor: string = planned === 0 ?
    "secondary" :
    Math.floor(percentage) > 100 ?
      "error" :
      "primary"

  const handleClickTransactions = (): void => {
    clickShowTransactions(uuid)
  }

  return (
    <>
      <div
        className="h-14 w-2/3 border border-gray-500 rounded-lg bg-blue-50 cursor-pointer"
        onClick={() => setIsMenuOpened(true)}
      >
        <div className="grid">
          <div>
            <div className="flex justify-center relative w-full">
              <Typography align="center" sx={{ fontSize: "1.3em", fontWeight: 'bold' }}>
                {formatMoney(spent)}
              </Typography>
              {!!planned &&
                <>
                  <Typography sx={{ mx: 1 }}>of</Typography>
                  <Typography>
                    {formatMoney(planned)}
                  </Typography>
                  </>
            }
              <Box
                sx={{
                  position: 'absolute',
                  top: 3,
                  left: 5
                }}
              >
                <Chip
                  size="small"
                  label={date}
                  sx={{
                    fontSize: '0.7em',
                    height: '90%',
                    backgroundColor: 'grey',
                    color: 'white'
                  }}
                  />
              </Box>
            </div>
          </div>
          <div>
            <Box sx={{ position: "relative" }}>
              <LinearProgress
                variant="determinate"
                color={progressColor}
                value={percentage > 100 ? percentage % 100 : percentage}
                sx={{
                  height: 20,
                  mx: 2,
                }}
                />
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  width: "100%",
                  height: "100%",
                }}
              >
                <Typography variant="h6" sx={{
                  display: "flex",
                  color: "white",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}>{planned === 0
                    ? 'Not planned'
                    : `${percentage}%`
                }
                </Typography>
              </Box>
            </Box>
          </div>
        </div>
      </div>
      <DropdownMenu open={isMenuOpened} onOpenChange={(isOpened: boolean) => setIsMenuOpened(isOpened)}>
        <DropdownMenuTrigger />
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleClickTransactions}>Transactions</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsEditDialogOpened(true)}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsConfirmDeleteDialogOpened(true)}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditForm
        uuid={uuid}
        weekUrl={weekUrl}
        monthUrl={monthUrl}
        open={isEditDialogOpened}
        setOpen={setIsEditDialogOpened}
      />
      <ConfirmDeleteForm
        open={isConfirmDeleteDialogOpened}
        setOpen={setIsConfirmDeleteDialogOpened}
        uuid={uuid}
        weekUrl={weekUrl}
        monthUrl={monthUrl}
      />
    </>
  )
}

export default TimelineBudgetItem
