import * as React from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid
} from '@mui/material'
import { Account } from '@/components/accounts/types'
import { useAccounts } from '@/hooks/accounts'

interface Types {
  uuid: string
  open: boolean
  handleClose: () => void
}

const EditForm: React.FC<Types> = ({ uuid, open = false, handleClose }) => {
  const [account, setAccount] = React.useState<Account | undefined>()

  const {
    data: accounts,
    isLoading: isAccountLoading
  } = useAccounts()

  React.useEffect(() => {
    if (!accounts) return

    setAccount(accounts.find((_account: Account) => _account.uuid === uuid))
  }, [accounts])
  return (
    <Dialog maxWidth="sm" fullWidth={true} open={open} onClose={handleClose}>
      <DialogTitle>Edit {account?.title}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item>
            {account?.uuid}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button>Save</Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditForm
