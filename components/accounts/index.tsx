import * as React from 'react'
import {
  Box,
  Button,
  Grid,
  Toolbar,
  Typography
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import { useAccounts } from '@/hooks/accounts'
import AccountCard from './AccountCard'
import { Account } from './types'
import { AddForm, EditForm, ConfirmDeleteForm } from './forms'

const Index: React.FC = () => {
  const {
    data: accounts
  } = useAccounts()

  const [activeAccount, setActiveAccount] = React.useState<string | null>(null)
  const [isAddFormOpened, setIsAddFormOpened] = React.useState<boolean>(false)
  const [isEditFormOpened, setIsEditFormOpened] = React.useState<boolean>(false)
  const [isConfirmDeleteFormOpened, setIsConfirmDeleteFormOpened] = React.useState<boolean>(false)

  const clickAccount = (uuid: string): void => {
    setActiveAccount(uuid)
    setIsEditFormOpened(true)
  }

  const clickDelete = (uuid: string): void => {
    setActiveAccount(uuid)
    setIsConfirmDeleteFormOpened(true)
  }

  const handleOpenAddForm = (): void => {
    setIsAddFormOpened(true)
  }

  const handleClose = (): void => {
    setIsAddFormOpened(false)
    setIsEditFormOpened(false)
    setIsConfirmDeleteFormOpened(false)
    setActiveAccount(null)
  }

  return (
    <>
      <Toolbar sx={{ pb: 1 }}>
        <Typography variant="h4" sx={{ my: 2 }}>Accounts</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          sx={{ textTransform: 'none' }}
          onClick={handleOpenAddForm}
        >
          Add account
        </Button>
      </Toolbar>
      <Grid container spacing={2}>
        { accounts && accounts.map((item: Account) => (
          <Grid key={item.uuid} item xs={3}>
            <AccountCard
              key={item.uuid}
              item={item}
              clickAccount={clickAccount}
              clickDelete={clickDelete}
            />
          </Grid>
        ))}
      </Grid>
      <AddForm
        open={isAddFormOpened}
        handleClose={handleClose}
      />
      {
        activeAccount && (
          <>
            <EditForm
              uuid={activeAccount}
              open={isEditFormOpened}
              handleClose={handleClose}
            />
            <ConfirmDeleteForm
              uuid={activeAccount}
              open={isConfirmDeleteFormOpened}
              handleClose={handleClose}
            />
          </>
        )
      } 
    </>
  )
}

export default Index
