import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import React from 'react';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  email: z.email(),
  password: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

const Index: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [values, setValues] = React.useState<FormValues>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormValues, string>>>({});

  const { status } = useSession();
  const router = useRouter();

  if (status === 'authenticated') {
    router.push('/');
  }

  const handleLogin = (payload: FormValues) => {
    setIsLoading(true);

    signIn('credentials', {
      username: payload.email,
      password: payload.password,
      callbackUrl: `${window.location.origin}/`,
    });
    setIsLoading(false);
  };

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = formSchema.safeParse(values);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    setErrors({});
    handleLogin(result.data);
  };

  return (
    status === 'unauthenticated' && (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-100">
        <div className="relative w-full max-w-md space-y-8 rounded-xl bg-white/90 p-10 shadow-md backdrop-blur-sm">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">Welcome back</h1>
            <p className="text-gray-600">Log in to continue managing your finances and achieving your goals.</p>
          </div>
          <Form onSubmit={handleSubmit} className="space-y-8">
            <Field name="email">
              <FieldLabel>Email</FieldLabel>
              <Input
                className="w-full"
                disabled={isLoading}
                value={values.email}
                onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
              />
              <FieldError>{errors.email}</FieldError>
            </Field>
            <Field name="password">
              <FieldLabel>Password</FieldLabel>
              <Input
                type="password"
                className="w-full"
                disabled={isLoading}
                value={values.password}
                onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
              />
              <FieldError>{errors.password}</FieldError>
            </Field>
            <p className="mt-2 flex justify-between text-sm">
              <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Create new account
              </Link>
              <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot Password?
              </Link>
            </p>
            <Button className="w-full" type="submit">
              Login
            </Button>
          </Form>
        </div>
      </div>
    )
  );
};

Index.layout = 'public';

export default Index;
