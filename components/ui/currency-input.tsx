import { IMaskInputProps, IMaskMixin } from 'react-imask';

import { Input } from '@/components/ui/input';

export const MaskedInput = IMaskMixin(({ inputRef, ...props }) => <Input ref={inputRef} {...props} />);
