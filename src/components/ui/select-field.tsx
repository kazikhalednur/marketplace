import React, { useState } from "react";
import { X } from "lucide-react";

interface SelectFieldOption {
  value: string | number;
  label: string;
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectFieldOption[];
  placeholder?: string;
}

export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ options, placeholder, ...props }, ref) => (
    <select
      ref={ref}
      className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
);
SelectField.displayName = "SelectField";

interface MultiSelectFieldProps {
  options: SelectFieldOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const MultiSelectField = React.forwardRef<HTMLDivElement, MultiSelectFieldProps>(
  ({ options, value, onChange, placeholder, className = "" }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

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
      <div ref={ref} className={`relative ${className}`}>
        {/* Selected items display */}
        <div 
          className="min-h-[42px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary cursor-pointer"
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(String(option.value));
                    }}
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
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-y-auto">
            {unselectedOptions.length > 0 ? (
              unselectedOptions.map((option) => (
                <div
                  key={option.value}
                  className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
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