import { FC } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
} from '@mui/material';

interface Types {
  open: boolean
  handleClose: () => void
}

const AddRatesForm: FC<Types> = ({ open, handleClose }) => {
  return (
    <Dialog maxWidth="sm" fullWidth={true} open={open} onClose={handleClose}>
      <DialogTitle>Add rates</DialogTitle>
      <DialogContent>
        <Grid container>
        </Grid>
      </DialogContent>
    </Dialog>
  )
}

export default AddRatesForm;
