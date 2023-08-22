import React from 'react'
import axios from 'axios'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormItem,
  FormMessage,
} from '@/components/ui/form'

const formSchema = z.object({
  email: z.string().email(),
  username: z.string(),
  password: z.string(),
  passwordRepeat: z.string(),
})

const Index: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [email, setEmail] = React.useState<string>('')
  const [username, setUsername] = React.useState<string>('')
  const [password, setPassword] = React.useState<string>('')
  const [passwordRepeat, setPasswordRepeat] = React.useState<string>('')
  const [errors, setErrors] = React.useState<string[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })

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

  const handleSignup = () => {
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-8 mt-20 p-5 rounded-md drop-shadow-md bg-white w-2/3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input className="w-full" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input className="w-full" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input className="w-full" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="passwordRepeat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repeat password</FormLabel>
                  <FormControl>
                    <Input className="w-full" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">
              Create account
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

Index.layout = 'public'

export default Index
