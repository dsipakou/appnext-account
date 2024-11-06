import React from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormItem,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

const Index: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const { status } = useSession()
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  if (status === 'authenticated') {
    router.push('/')
  }

  const handleLogin = (payload: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    signIn('credentials', {
      username: payload.email,
      password: payload.password,
      callbackUrl: `${window.location.origin}/`
    })
    setIsLoading(false)
  }

  return (
    status === 'unauthenticated' && (
      <div className="relative flex min-h-screen items-center justify-center bg-gray-100 overflow-hidden">
        <div className="relative w-full max-w-md space-y-8 rounded-xl bg-white/90 p-10 shadow-md backdrop-blur-sm">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-gray-900">Welcome back</h1>
            <p className="text-gray-600">
              Log in to continue managing your finances and achieving your goals.
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-8">
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
              <p className="flex mt-2 justify-between text-sm">
                <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">Create new account</Link>
                <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">Forgot Password?</Link>
              </p>
              <Button className="w-full" type="submit">Login</Button>
            </form>
          </Form>
        </div>
      </div>
    )
  )
}

Index.layout = 'public'

export default Index
