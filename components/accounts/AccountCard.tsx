import * as React from 'react'
import {
  Grid,
  Paper,
  Typography
} from '@mui/material'
import { Account } from './types'

interface Types {
  item: Account
}

const AccountCard: React.FC<Types> = ({ item }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        width: 300,
        height: 100,
        background: '-webkit-linear-gradient(145deg, #4684c1, #343174)',
        borderRadius: 3
      }}
    >
      <Grid container>
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
      </Grid>
    </Paper>
  )
}

export default AccountCard
