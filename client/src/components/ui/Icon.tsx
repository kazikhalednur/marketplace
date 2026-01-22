// components/ui/Icon.tsx

import type { LucideIcon } from "lucide-react";

interface IconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export default function Icon({
  icon: IconComponent,
  size = 20,
  className = "text-gray-700",
  strokeWidth = 1.5,
}: IconProps) {
  return (
    <IconComponent
      size={size}
      className={className}
      strokeWidth={strokeWidth}
    />
  );
}
