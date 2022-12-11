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

const Index: React.FC = () => {
  const {
    data: accounts,
    isLoading
  } = useAccounts()

  return (
    <>
      <Toolbar sx={{ pb: 1 }}>
        <Typography variant="h4" sx={{ my: 2 }}>Accounts</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          sx={{ textTransform: 'none' }}
          onClick={() => {}}
        >
          Add account
        </Button>
      </Toolbar>
      <Grid container spacing={2}>
        { accounts && accounts.map((item: Account) => (
          <Grid item>
            <AccountCard key={item.uuid} item={item} />
          </Grid>
        ))}
      </Grid>
    </>
  )
}

export default Index
