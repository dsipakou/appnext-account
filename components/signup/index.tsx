import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import React from 'react';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Form, type FormErrors } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z
  .object({
    email: z.string().email(),
    password: z.string(),
    repeatPassword: z.string(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords don't match",
    path: ['repeatPassword'],
  });

type FormValues = z.infer<typeof formSchema>;

const Index: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [values, setValues] = React.useState<FormValues>({
    email: '',
    password: '',
    repeatPassword: '',
  });
  const [errors, setErrors] = React.useState<FormErrors>({});

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = (payload: FormValues) => {
    setIsLoading(true);

    if (payload.password !== payload.repeatPassword) {
      setIsLoading(false);
      return;
    }

    axios
      .post('users/register/', {
        ...payload,
        username: payload.email.split('@')[0],
      })
      .then((res) => {
        if (res.status === 201) {
          signIn('credentials', {
            username: payload.email,
            password: payload.password,
            callbackUrl: `${window.location.origin}/`,
          });
        }
      })
      .catch((err) => {
        if (Object.prototype.hasOwnProperty.call(err.response.data, 'password')) {
          setErrors((current) => ({ ...current, password: err.response.data.password }));
        } else if (Object.prototype.hasOwnProperty.call(err.response.data, 'email')) {
          setErrors((current) => ({ ...current, email: 'Most probably this email is already registered' }));
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = formSchema.safeParse(values);

    if (!result.success) {
      setErrors(z.flattenError(result.error).fieldErrors);
      return;
    }

    setErrors({});
    onSubmit(result.data);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-100">
      <div className="relative w-full max-w-md space-y-8 rounded-xl bg-white/90 p-10 shadow-md backdrop-blur-sm">
        <div className="flex flex-col space-y-2 text-center">
          <span className="text-xl font-extrabold text-gray-900">Welcome to </span>
          <span className="text-3xl font-extrabold text-gray-900">
            I Spent a <strong>Dollar</strong>
          </span>
          <p className="text-gray-600">Sign up now and take control of your finances.</p>
        </div>
        <div className="text-center">
          <span className="mt-6 text-xl font-bold text-gray-900">Create your account</span>
        </div>
        <Form errors={errors} onSubmit={handleSubmit} className="space-y-6">
          <Field name="email">
            <FieldLabel>Email</FieldLabel>
            <Input
              className="w-full"
              disabled={isLoading}
              value={values.email}
              onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
            />
            <FieldError />
          </Field>
          <Field name="password">
            <FieldLabel>Password</FieldLabel>
            <div className="relative w-full">
              <Input
                type={showPassword ? 'text' : 'password'}
                className="w-full"
                disabled={isLoading}
                required
                value={values.password}
                onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
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
            <FieldError />
          </Field>
          <Field name="repeatPassword">
            <FieldLabel>Repeat Password</FieldLabel>
            <Input
              type={showPassword ? 'text' : 'password'}
              className="w-full"
              disabled={isLoading}
              value={values.repeatPassword}
              onChange={(event) => setValues((current) => ({ ...current, repeatPassword: event.target.value }))}
            />
            <FieldError />
          </Field>
          <Button className="w-full" type="submit">
            Join now
          </Button>
        </Form>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

Index.layout = 'public';

export default Index;
