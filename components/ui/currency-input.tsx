import { IMaskInput, IMaskInputProps } from 'react-imask';

import { cn } from '@/lib/utils';

type MaskedInputProps = IMaskInputProps<HTMLInputElement> & {
  className?: string;
};

export function MaskedInput({ className, ...props }: MaskedInputProps) {
  return (
    <IMaskInput
      className={cn(
        'flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',

        className,
      )}
      {...props}
    />
  );
}
