import { IMaskInputProps, IMaskMixin } from "react-imask";

import { Input } from "@/components/ui/input";

export const MaskedInput = IMaskMixin(({ inputRef, ...props }) => {
  return <Input ref={inputRef} {...props} />;
});

export const AmountInput = (props: IMaskInputProps) => {
  return (
    <MaskedInput
      mask={Number}
      unmask="typed"
      scale={2}
      thousandsSeparator=" "
      radix="."
      normalizeZeros
      autofix
      padFractionalZeros={false}
      mapToRadix={[",", "ю", "б"]}
      {...props}
    />
  );
};
