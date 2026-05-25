import React, { useState } from "react";

interface TagsInputProps {
  value?: string[];
  onChange: (tags: string[]) => void;
  onBlur?: () => void;
  placeholder?: string;
}

export function TagsInput({ value = [], onChange, onBlur, placeholder = "" }: TagsInputProps) {
  const [input, setInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()]);
      }
      setInput("");
    }
    if (e.key === "," && input.trim()) {
      e.preventDefault();
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()]);
      }
      setInput("");
    }
  };

  const handleRemove = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border border-input rounded-md px-2 py-1 bg-background focus-within:ring-2 focus-within:ring-primary">
      {value.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2.5 py-1.5 rounded-full font-semibold border border-primary/15 shadow-sm"
        >
          {tag}
          <button
            type="button"
            className="ml-1 w-4 h-4 flex items-center justify-center rounded-full text-xs text-primary/70 hover:text-destructive hover:bg-destructive/10 transition-colors focus:outline-none"
            onClick={() => handleRemove(tag)}
            aria-label={`Remove tag ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        placeholder={placeholder}
        className="flex-1 min-w-[120px] bg-transparent outline-none border-none shadow-none px-0 py-1 text-sm"
      />
    </div>
  );
} 