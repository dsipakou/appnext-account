import React from 'react'
import { signIn } from 'next-auth/react'
import {
  Box,
  Grid,
  Link,
  TextField,
  Typography,
  Button
} from '@mui/material'
import { 
  FieldValues,
  SubmitHandler,
  useForm
} from 'react-hook-form'

const Index: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const {
    register,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      password: ''
    }
  })

  const handleLogin: SubmitHandler<FieldValues> = async (data): void => {
    console.log(data)
    setIsLoading(true)
    signIn('credentials', {
      username: data.email,
      password: data.password,
      callbackUrl: `${window.location.origin}/accounts`,
    })
    setIsLoading(false)
  }

  return (
    <Grid container spacing={4}>
      <Grid item xs={6}></Grid>
      <Grid item xs={6}>
        <div className="flex flex-col gap-4 mt-10">
          <Typography variant="h4">Welcome to Flying Budget</Typography>
          <form onSubmit={handleSubmit(handleLogin)}>
            <div className="flex flex-col gap-4 w-1/2">
              <TextField
                {...register("email", {
                  required: "Required",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Entered value does not match email format"
                  }
                })}
                autoFocus
                error={!!errors?.email}
                helperText={errors.email ? errors.email.message : ''}
                id="email"
                label="Email Address"
                type="text"
                disabled={isLoading}
                fullWidth
              />
              <TextField
                {...register("password", {required: "Required"})}
                error={!!errors?.password}
                helperText={errors.password ? errors.password.message: ''}
                id="password"
                label="Password"
                type="password"
                fullWidth
                disabled={isLoading}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link href="/">Forgot Password?</Link>
              </Box>
              <Button type="submit" variant="contained">Login</Button>
            </div>
          </form>
        </div>
      </Grid>
    </Grid>
  )
}

Index.layout = 'public'

export default Index
