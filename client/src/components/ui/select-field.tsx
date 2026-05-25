import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface SelectFieldOption {
  value: string | number;
  label: string;
}

interface SelectFieldProps {
  options: SelectFieldOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const SelectField = React.forwardRef<HTMLButtonElement, SelectFieldProps>(
  ({ options, value, onChange, onBlur, placeholder = "Select an option", className, disabled }, ref) => {
    const [open, setOpen] = React.useState(false);
    const selected = options.find((opt) => String(opt.value) === String(value));

    const handleOpenChange = (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (!nextOpen) {
        onBlur?.();
      }
    };

    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            className={cn(
              "w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition outline-none",
              disabled && "opacity-60 pointer-events-none",
              className
            )}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <span className={cn(!selected && "text-muted-foreground")}>{selected ? selected.label : placeholder}</span>
            <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-full min-w-[var(--radix-popover-trigger-width)] max-w-none" align="start" sideOffset={4}>
          <ul
            tabIndex={-1}
            role="listbox"
            className="max-h-60 overflow-y-auto rounded-md bg-background py-1 text-sm shadow-lg border border-border focus:outline-none"
          >
            {options.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={String(opt.value) === String(value)}
                className={cn(
                  "flex items-center cursor-pointer select-none px-4 py-2 transition-colors",
                  String(opt.value) === String(value)
                    ? "bg-primary/10 text-primary font-semibold"
                    : "hover:bg-muted/60 hover:text-primary"
                )}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  onBlur?.();
                }}
              >
                <span className="flex-1">{opt.label}</span>
                {String(opt.value) === String(value) && (
                  <Check className="ml-2 h-4 w-4 text-primary" />
                )}
              </li>
            ))}
            {options.length === 0 && (
              <li className="px-4 py-2 text-muted-foreground">No options</li>
            )}
          </ul>
        </PopoverContent>
      </Popover>
    );
  }
);
SelectField.displayName = "SelectField";

interface MultiSelectFieldProps {
  options: SelectFieldOption[];
  value: string[];
  onChange: (value: string[]) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
}

export const MultiSelectField = React.forwardRef<HTMLDivElement, MultiSelectFieldProps>(
  ({ options, value, onChange, onBlur, placeholder, className = "" }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const handleSelect = (optionValue: string) => {
      if (value.includes(optionValue)) {
        onChange(value.filter(v => v !== optionValue));
      } else {
        onChange([...value, optionValue]);
      }
    };

    const handleRemove = (optionValue: string) => {
      onChange(value.filter(v => v !== optionValue));
    };

    const selectedOptions = options.filter(opt => value.includes(String(opt.value)));
    const unselectedOptions = options.filter(opt => !value.includes(String(opt.value)));

    return (
      <div
        ref={ref}
        className={`relative ${className}`}
        tabIndex={0}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsOpen(false);
            onBlur?.();
          }
        }}
      >
        {/* Selected items display */}
        <div 
          className="min-h-[42px] w-full rounded-md border border-input bg-background px-3 pr-10 py-2 text-sm shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary cursor-pointer flex flex-wrap gap-1 items-center transition"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedOptions.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium"
                >
                  {option.label}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); handleRemove(String(option.value)); }}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder || "Select options..."}</span>
          )}
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-y-auto animate-in fade-in">
            {unselectedOptions.length > 0 ? (
              unselectedOptions.map((option) => (
                <div
                  key={option.value}
                  className="px-3 py-2 hover:bg-primary/10 cursor-pointer text-sm rounded transition-colors"
                  onClick={() => handleSelect(String(option.value))}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                All options selected
              </div>
            )}
          </div>
        )}

        {/* Backdrop to close dropdown */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  }
);
MultiSelectField.displayName = "MultiSelectField"; 