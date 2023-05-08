import React from 'react'
import {
  Dialog,
  DialogTitle,
} from '@mui/material'

interface Types {
  open: boolean,
  handleClose: () => void,
}

const AddIncomeForm: React.FC<Types> = ({ open, handleClose }) => {
  return (
    <Dialog maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle>Add your income</DialogTitle>
    </Dialog>
  )
}

export default AddIncomeForm
