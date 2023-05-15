import React from 'react'
import {
  Button,
  ButtonGroup,
  Typography
} from '@mui/material'

type TransactionType = 'outcome' | 'income'

const SourceSwitcher: React.FC = () => {
  const [activeType, setActiveType] = React.useState<TransactionType>('outcome')

  const handleTypeButtonClick = (type: TransactionType) => {
    setActiveType(type)
  }
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
        onClick={() => handleTypeButtonClick('outcome')}
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
        onClick={() => handleTypeButtonClick('income')}
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
