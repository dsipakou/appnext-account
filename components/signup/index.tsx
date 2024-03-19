import React from 'react'
import Link from 'next/link'
import axios from 'axios'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { signIn } from 'next-auth/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormItem,
  FormMessage
} from '@/components/ui/form'

const formSchema = z.object({
  email: z.string().email(),
  username: z.string(),
  password: z.string(),
  repeatPassword: z.string()
}).refine((data) => data.password === data.repeatPassword, {
  message: "Passwords don't match",
  path: ['repeatPassword']
})

const Index: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      repeatPassword: ''
    }
  })

  const onSubmit = (payload: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    if (payload.password !== payload.repeatPassword) {
      setIsLoading(false)
      return
    }

    axios.post('users/register/', {
      ...payload
    }).then((res) => {
      if (res.status === 201) {
        signIn('credentials', {
          username: payload.email,
          password: payload.password,
          callbackUrl: `${window.location.origin}/`
        })
        console.log('after signin')
      }
    }).catch((err) => {
      if (err.response.data.hasOwnProperty('password')) {
        form.setError('password', { type: 'custom', message: err.response.data.password })
      } else if (err.response.data.hasOwnProperty('email')) {
        form.setError('email', { type: 'custom', message: 'Most probably this email is already registered' })
      }
    }).finally(() => {
      setIsLoading(false)
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-20 p-5 rounded-md drop-shadow-md bg-white w-2/3">
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
                    <Input type="password" className="w-full" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="repeatPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repeat Password</FormLabel>
                  <FormControl>
                    <Input type="password" className="w-full" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              <Link href="/login" className="underline text-blue-500">Existing account?</Link>
            </div>
            <Button type="submit">Join now</Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

Index.layout = 'public'

export default Index
