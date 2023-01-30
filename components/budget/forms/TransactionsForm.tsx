import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle
} from '@mui/material'

interface Props {
  open: boolean
  handleClose: () => void
}

const TransactionsForm: React.FC<Props> = ({ open, handleClose }) => {
  return (
    <Dialog maxWidth="md" fullWidth={true} open={open} onClose={handleClose}>
      <DialogTitle>Transactions for selected budget</DialogTitle>
      <DialogContent>
        transactions here
      </DialogContent>
    </Dialog>
  )
}

export default TransactionsForm
