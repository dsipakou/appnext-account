import React from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
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
  password: z.string(),
  repeatPassword: z.string()
}).refine((data) => data.password === data.repeatPassword, {
  message: "Passwords don't match",
  path: ['repeatPassword']
})

const Index: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [showPassword, setShowPassword] = React.useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      repeatPassword: ''
    }
  })

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const onSubmit = (payload: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    if (payload.password !== payload.repeatPassword) {
      setIsLoading(false)
      return
    }

    axios.post('users/register/', {
      ...payload,
      username: payload.email.split('@')[0]
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
    <div className="relative flex min-h-screen items-center justify-center bg-gray-100 overflow-hidden">
      <div className="relative w-full max-w-md space-y-8 rounded-xl bg-white/90 p-10 shadow-md backdrop-blur-sm">
        <div className="flex flex-col text-center space-y-2">
          <span className="text-xl font-extrabold text-gray-900">Welcome to </span>
          <span className="text-3xl font-extrabold text-gray-900">I Spent a <strong>Dollar</strong></span>
          <p className="text-gray-600">
            Sign up now and take control of your finances.
          </p>
        </div>
        <div className="text-center">
          <span className="mt-6 text-xl font-bold text-gray-900">Create your account</span>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      disabled={isLoading}
                      {...field}
                    />
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
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        className="w-full"
                        disabled={isLoading}
                        required
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transform"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
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
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit">Join now</Button>
          </form>
        </Form>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">Log In</Link>
        </p>
      </div>
    </div>
  )
}

Index.layout = 'public'

export default Index
