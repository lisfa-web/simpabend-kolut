import { Input } from "@/components/ui/input";
import { formatCurrencyInput, parseCurrency } from "@/lib/currency";
import { forwardRef } from "react";

interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: number;
  onChange?: (value: number) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const numericValue = parseCurrency(e.target.value);
      onChange?.(numericValue);
    };

    const displayValue = value ? formatCurrencyInput(value.toString()) : "";

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          Rp
        </span>
        <Input
          {...props}
          ref={ref}
          type="text"
          value={displayValue}
          onChange={handleChange}
          className="pl-10"
          placeholder="0"
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
