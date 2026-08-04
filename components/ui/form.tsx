'use client';

import { Form as FormPrimitive } from '@base-ui/react/form';
import type React from 'react';

export type FormErrors = NonNullable<FormPrimitive.Props['errors']>;

export function Form({ className, ...props }: FormPrimitive.Props): React.ReactElement {
  return <FormPrimitive className={className} data-slot="form" {...props} />;
}

export { FormPrimitive };
