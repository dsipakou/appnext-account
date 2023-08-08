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
    axios.post('users/register/', {
      email,
      username,
      password,
      repeatPassword: passwordRepeat
    }).then((res) => {
      if (res.status === 200) {
        console.log('Everything is ok')
      }
    }).catch((err) => {
      console.log(`Something went wrong: ${err}`)
    })
  }

  return (
    <div className="flex w-full h-screen gap-5">
      <div className="flex-1">
        <div className="flex flex-col bg-blue-500 p-4 h-full text-white gap-5">
          <span className="text-2xl font-bold">Welcome to Fly Budget</span>
          <span className="text-xl">Create an account now to control your expenses</span>
        </div>
      </div>
      <div className="flex-1">
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
          {errors.map((error: string) => (
            <Typography>{error}</Typography>
          ))}
        </Stack>
      </div>
    </div>
  )
}

Index.layout = 'public'

export default Index
