import { useState } from "react";

interface AvatarProps {
  src?: string;
  name?: string;
  size?: number; // e.g., 120
  className?: string;
}

function getInitials(name?: string) {
  if (!name) return "";
  return name.trim().split(" ").map(n => n[0]).join("").toUpperCase();
}

export default function Avatar({ src, name, size = 120, className = "" }: AvatarProps) {
  const [showInitials, setShowInitials] = useState(false);
  const initials = getInitials(name);

  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-tr from-primary/70 via-accent/60 to-secondary/70 text-white font-extrabold select-none border-4 border-background shadow-lg ${className}`}
      style={{ width: size, height: size, fontSize: size / 2.5 }}
    >
      {src && !showInitials ? (
        // Using native img instead of next/image to avoid SSRF protection
        // that blocks private IPs (e.g. 127.0.0.1:9000 for MinIO)
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name || ""}
          width={size}
          height={size}
          className="rounded-full object-cover w-full h-full"
          onError={() => setShowInitials(true)}
          onLoad={() => setShowInitials(false)}
          loading="lazy"
        />
      ) : initials ? (
        initials
      ) : (
        <span>?</span>
      )}
    </span>
  );
} 