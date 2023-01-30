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
  const [email, setEmail] = React.useState<string>('')
  const [username, setUsername] = React.useState<string>('')
  const [password, setPassword] = React.useState<string>('')
  const [passwordRepeat, setPasswordRepeat] = React.useState<string>('')
  const [errors, setErrors] = React.useState<string[]>([])

  const handleEmailInput = (e) => {
    setEmail(e.target.value)
  }

  const handleUsernameInput = (e) => {
    setUsername(e.target.value)
  }

  const handlePasswordInput = (e) => {
    setPassword(e.target.value)
  }

  const handlePasswordRepeatInput = (e) => {
    setPasswordRepeat(e.target.value)
  }

  const submit = () => {
    setErrors([])
    if (password !== passwordRepeat) {
      const error = "Please, check your password"
      setErrors((oldErrors: string[]) => [...oldErrors, error])
    }
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
          <TextField
            label="Email"
            id="email"
            type="email"
            fullWidth
            onChange={handleEmailInput}
          />
          <TextField
            label="Username"
            id="username"
            type="text"
            fullWidth
            onChange={handleUsernameInput}
          />
          <TextField
            label="Password"
            id="password"
            type="password"
            fullWidth
            onChange={handlePasswordInput}
          />
          <TextField
            label="Password again"
            id="password-repeat"
            type="password"
            fullWidth
            onChange={handlePasswordRepeatInput}
          />
          <Button
            className="bg-sky-500"
            variant="contained"
            size="large"
            sx={{
              width: '40%'
            }}
            onClick={submit}
          >
            Create account
          </Button>
          { errors.map((error: string) => (
            <Typography>{error}</Typography>
          ))}
        </Stack>
      </Grid>
    </Grid>
  )
}

Index.layout = 'public'

export default Index
