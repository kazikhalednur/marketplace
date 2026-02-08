// src/app/not-found.tsx

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { Ghost, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="flex flex-col items-center justify-center gap-8 w-full max-w-md mx-auto">
        <div className="flex flex-col items-center gap-4">
          <span className="inline-flex items-center justify-center rounded-full bg-muted p-6 shadow-md">
            <Icon icon={Ghost} size={56} className="text-muted-foreground" />
          </span>
          <h1 className="text-6xl sm:text-7xl font-extrabold text-foreground tracking-tight select-none">404</h1>
        </div>
        <div className="flex flex-col items-center gap-3">
          <p className="text-xl sm:text-2xl font-semibold text-foreground mb-1 text-center">
            Page Not Found
          </p>
          <p className="text-base sm:text-lg text-muted-foreground max-w-md text-center">
            Sorry, the page you are looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="mt-6 px-6 py-2 rounded-md bg-muted text-foreground font-medium text-base shadow transition-all duration-200 border border-border focus:outline-none focus:ring-2 focus:ring-ring flex items-center gap-2
            hover:bg-foreground/10 hover:shadow-lg hover:-translate-y-0.5"
        >
          <Icon icon={Home} size={20} className="text-foreground" />
        Go back to homepage
      </Link>
    </div>
    </main>
  );
}
