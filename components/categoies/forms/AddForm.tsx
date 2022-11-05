import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Select,
  Button,
} from '@mui/material';

const AddForm = ({ onOpen, onClose }) => {
  return (
    <Dialog maxWidth="sm" fullWidth={true} open={onOpen} onClose={onClose}>
      <DialogTitle>Add category</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              autofocus
              margin="dense"
              id="name"
              label="Category name"
              type="text"
              fullWidth
            />
          </Grid>
          <Grid item xs={4}>
            <FormControlLabel control={<Checkbox />} label="Parent category" />
          </Grid>
          <Grid item xs={8}>
            <Select
              label="Parent category"
              fullWidth
            ></Select>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onClose}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddForm;
