import { FC, ChangeEvent, useState } from 'react'
import {
  Box,
  Grid,
  Link,
  Stack,
  TextField,
  Typography,
  Button
} from '@mui/material'
import { useAuth } from '@/context/auth'

const Index: FC = () => {
  const { login } = useAuth()
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  const handleEmailInput = (e: ChangeEvent): void => {
    setEmail(e.target.value)
  }

  const handlePasswordInput = (e: ChangeEvent): void => {
    setPassword(e.target.value)
  }

  const handleLogin = async (): void => {
    await login(email, password)
  }

  return (
    <Grid container spacing={4}>
      <Grid item xs={6}></Grid>
      <Grid item xs={6}>
        <Box sx={{ p: 4 }}>
          <Stack spacing={4}>
            <Typography variant="h4">Welcome to Flying Budget</Typography>
            <TextField
              autoFocus
              id="email"
              label="Email Address"
              type="text"
              fullWidth
              value={email}
              onChange={handleEmailInput} />
            <TextField
              id="password"
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={handlePasswordInput} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link href="/">Forgot Password?</Link>
            </Box>
            <Button size="large" onClick={handleLogin} variant="contained">Login</Button>
          </Stack>
        </Box>
      </Grid>
    </Grid>
  )
}

export default Index
