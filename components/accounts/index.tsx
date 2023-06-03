import * as React from 'react'
import {
  Box,
  Grid,
  Toolbar,
  Typography
} from '@mui/material'
import { useAccounts } from '@/hooks/accounts'
import AccountCard from './AccountCard'
import { Account } from './types'
import { AddForm, EditForm, ConfirmDeleteForm } from './forms'

const Index: React.FC = () => {

  const [activeAccount, setActiveAccount] = React.useState<string | null>(null)
  const [isEditFormOpened, setIsEditFormOpened] = React.useState<boolean>(false)
  const [isConfirmDeleteFormOpened, setIsConfirmDeleteFormOpened] = React.useState<boolean>(false)

  const {
    data: accounts
  } = useAccounts()

  const clickAccount = (uuid: string): void => {
    setActiveAccount(uuid)
    setIsEditFormOpened(true)
  }

  const clickDelete = (uuid: string): void => {
    setActiveAccount(uuid)
    setIsConfirmDeleteFormOpened(true)
  }

  const handleClose = (): void => {
    setIsEditFormOpened(false)
    setIsConfirmDeleteFormOpened(false)
    setActiveAccount(null)
  }

  return (
    <>
      <Toolbar sx={{ pb: 1 }}>
        <Typography variant="h4" sx={{ my: 2 }}>Accounts</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <AddForm
          open={isAddFormOpened}
          handleClose={handleClose}
        />
      </Toolbar>
      <Grid container spacing={2}>
        {accounts && accounts.map((item: Account) => (
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
