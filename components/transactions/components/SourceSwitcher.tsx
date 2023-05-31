import React from 'react'
import {
  Button,
  ButtonGroup,
  Typography
} from '@mui/material'
import { TransactionType } from '../index'

interface Types {
  activeType: TransactionType
  changeType: () => void
}

const SourceSwitcher: React.FC<Types> = ({ activeType, changeType }) => {
  return (
    <ButtonGroup
      disableElevation
      size="large"
      aria-label="outlined primary button group"
      sx={{ backgroundColor: "info.dark" }}
    >
      <Button
        disabled={activeType === 'outcome'}
        variant={activeType === 'outcome' ? "text" : "contained"}
        onClick={() => changeType('outcome')}
        sx={{ width: 180, p: 0, backgroundColor: "info.dark" }}
      >
        <Typography
          variant="h5"
          sx={activeType === "outcome" ? {
            display: 'flex',
            justifyContent: 'center',
            color: "info.dark",
            backgroundColor: "white",
            border: 4,
            borderRadius: 2,
            width: '100%',
            height: '100%',
            alignItems: 'center',
          } : {}}
        >
          Spendings
        </Typography>
      </Button>
      <Button
        disabled={activeType === 'income'}
        color="info"
        variant={activeType === 'income' ? "text" : "contained"}
        onClick={() => changeType('income')}
        sx={{ width: 180, p: 0, backgroundColor: "info.dark" }}
      >
        <Typography
          variant="h5"
          sx={activeType === "income" ? {
            display: 'flex',
            justifyContent: 'center',
            color: 'info.dark',
            backgroundColor: "white",
            border: 4,
            borderRadius: 2,
            width: '100%',
            height: '100%',
            alignItems: 'center',
          } : {}}
        >
          Income
        </Typography>
      </Button>
    </ButtonGroup>
  )
}

export default SourceSwitcher
