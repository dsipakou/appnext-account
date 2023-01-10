import React from 'react'
import {
  Box,
  Button,
  Grid,
  Stack,
  TextField,
  Typography
} from '@mui/material'

const Index: React.FC = () => {
  return (
    <Grid container spacing={4}>
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
          <TextField label="Email repeat" fullWidth />
          <TextField label="Username" fullWidth />
          <TextField label="Password" fullWidth />
          <TextField label="Password again" fullWidth />
          <Button
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

export default Index
