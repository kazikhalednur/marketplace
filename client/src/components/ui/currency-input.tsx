import React from "react";
import { Input } from "./input";

interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  prefix?: string;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, prefix = '', ...props }, ref) => (
    <div className="flex items-center">
      {prefix && <span className="mr-2 text-muted-foreground">{prefix}</span>}
      <Input
        ref={ref}
        type="number"
        value={value}
        onChange={onChange}
        className="w-full"
        {...props}
      />
    </div>
  )
);
CurrencyInput.displayName = "CurrencyInput"; 