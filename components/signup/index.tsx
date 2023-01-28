import React from 'react'
import axios from 'axios'
import {
  Box,
  Button,
  Grid,
  Stack,
  TextField,
  Typography
} from '@mui/material'

const Index: React.FC = () => {
  const submit = () => {

  }

  return (
    <Grid container spacing={4} sx={{ mt: 5 }}>
      <Grid item xs={6}>
        <Box
          sx={{
            backgroundColor: 'blue',
            p: 4,
            height: '100%',
            borderRadius: '25px',
            color: 'white'
          }}
        >
          <Typography variant="h3">
            Welcome to Fly Budget
          </Typography>
          <Typography variant="h5">
            Create an account now to control your expenses
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={6}>
        <Stack spacing={4}>
          <Typography variant="h4">
            Sign Up
          </Typography>
          <TextField label="Email" fullWidth />
          <TextField label="Username" fullWidth />
          <TextField label="Password" type="password" fullWidth />
          <TextField label="Password again" type="password" fullWidth />
          <Button
            className="bg-sky-500"
            variant="contained"
            size="large"
            sx={{
              width: '40%'
            }}
          >
            Create account
          </Button>
        </Stack>
      </Grid>
    </Grid>
  )
}

Index.layout = 'public'

export default Index
