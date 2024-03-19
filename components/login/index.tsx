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
      <div className="flex gap-4 justify-end">
        <div className="w-1/2">
          <div className="flex flex-col gap-4 mt-10">
            <span className="text-2xl font-semibold">Login to your account</span>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-8">
                <div className="flex flex-col gap-4 w-2/3 bg-white p-6 rounded-lg drop-shadow-lg">
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
                  <div className="flex justify-between">
                    <Link href="/signup" className="underline text-blue-500">Create new account</Link>
                    <Link href="/" className="underline text-blue-500">Forgot Password?</Link>
                  </div>
                  <Button type="submit">Login</Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    )
  )
}

Index.layout = 'public'

export default Index
