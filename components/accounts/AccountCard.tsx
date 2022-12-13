import * as React from 'react'
import {
  Grid,
  IconButton,
  Paper,
  Typography
} from '@mui/material'
import { Account } from './types'
import DeleteIcon from '@mui/icons-material/Delete';
import { useUsers, UserResponse } from '@/hooks/users'

interface Types {
  item: Account,
  clickAccount: (uuid: string) => void
  clickDelete: (uuid: string) => void
}

const AccountCard: React.FC<Types> = ({ item, clickAccount, clickDelete }) => {
  const {
    data: users = []
  } = useUsers()

  const user: UserResponse | undefined = users.find((_user: UserResponse) => _user.uuid === item.user)

  const handleClickAccount = (e): void => {
    clickAccount(item.uuid)
  }

  const handleClickDelete = (e): void => {
    e.stopPropagation()
    clickDelete(item.uuid)
  }

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        height: 100,
        background: '-webkit-linear-gradient(145deg, #4684c1, #343174)',
        borderRadius: 3,
        cursor: 'pointer'
      }}
      onClick={handleClickAccount}
    >
      <Grid container sx={{
        height: '100%'
      }}>
        <Grid item xs={12}>
          <Typography
            variant="h6"
            align="center"
            sx={{
              color: 'white'
            }}
          >
            {item.title}
          </Typography>
        </Grid>
        <Grid item align="center" xs={3}>
          <Typography sx={{
            color: 'white'
          }}>
            @{user?.username}
          </Typography>
        </Grid>
        <Grid item align="right" xs={12}>
          <IconButton variant="contained" onClick={handleClickDelete}><DeleteIcon /></IconButton>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default AccountCard
