import React from 'react'
import axios from 'axios'
import { useSWRConfig } from 'swr'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  Typography
} from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import { useBudgetDuplicate } from '@/hooks/budget'
import { getFormattedDate } from '@/utils/dateUtils'
import { DuplicateBudgetResponse } from '@/components/budget/types'

interface BudgetCardTypes {
  date: string
  title: string
  selected: boolean
  handleClick: (uuid: string) => void
}

interface Types {
  open: boolean
  date: Date
  type: "month" | "week"
  handleClose: () => void
  mutateBudget: () => void
}

const BudgetCard: React.FC<BudgetCardTypes> = ({
  date,
  title,
  selected = false,
  handleClick
}) => {
  return (
    <Paper
      elevation={selected ? 0 : 3}
      onClick={handleClick}
      sx={{
        overflow: 'hidden',
        width: '100%',
        height: '100px',
        p: 1,
        cursor: 'pointer',
        backgroundColor: selected ? '#03a9f4' : 'white',
        color: selected ? 'white' : 'black'
     }}
    >
      <Stack>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography
            variant="caption"
          >
            {date}
          </Typography>
          { selected && <CheckIcon /> }
        </Box> 
        <Typography
          variant="h6"
          sx={{
            width: '100%'
          }}
        >
          {title}
        </Typography>
      </Stack>
    </Paper>
  )
}

const DuplicateForm: React.FC<Types> = ({ open, date, type, handleClose, mutateBudget }) => {
  const [selectedBudgetUuids, setSelectedBudgetUuids] = React.useState<string[]>([])
  const formattedDate = getFormattedDate(date)
  const {
    data: budgetList = [],
    url: urlToMutate
  } = useBudgetDuplicate(type, formattedDate)
  const { mutate } = useSWRConfig()

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

  const closeModal = (): void => {
    setSelectedBudgetUuids([])
    handleClose()
  }

  const handleDuplicateClick = (): void => {
    axios.post('budget/duplicate/', {
      uuids: selectedBudgetUuids,
    }).then(
      res => {
        if (res.status === 201) {
          mutate(urlToMutate)
          mutateBudget()
          // TODO: Done
        }
      }
    ).catch(
      (error) => {
        // TODO: Handle errors
        }
      )
  }

  return (
    <Dialog maxWidth="md" fullWidth open={open} onClose={closeModal}>
      <DialogTitle>
        <Grid container sx={{justifyContent: 'space-between'}}>
          <Grid item>
            <Typography variant="h4">Select budgets to repeat</Typography>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Button onClick={selectAllBudgets}>Select all</Button>
            <Button onClick={() => setSelectedBudgetUuids([])}>Deselect all</Button>
          </Grid>
          <Grid item xs={6} align="right">
            <Button onClick={closeModal} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleDuplicateClick}
              disabled={selectedBudgetUuids.length === 0}
            >
              Duplicate selected
            </Button>
          </Grid>
          <>
            { budgetList.length === 0 
              ? <Grid item xs={12}>Nothing to duplicate</Grid> 
              : budgetList.map((budgetItem: DuplicateBudgetResponse) => (
                  <Grid key={budgetItem.uuid} item xs={3}>
                    <BudgetCard
                      title={budgetItem.title}
                      date={budgetItem.date}
                      handleClick={() => handleClickBudget(budgetItem.uuid)}
                      selected={isBudgetSelected(budgetItem.uuid)}
                    />
                  </Grid>
                ))
            }
          </>
        </Grid>
      </DialogContent>
    </Dialog>
  )
}

export default DuplicateForm
