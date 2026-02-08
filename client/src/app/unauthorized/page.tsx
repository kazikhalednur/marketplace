import Link from "next/link";
import { ShieldOff } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="flex flex-col items-center justify-center gap-8 w-full max-w-md mx-auto">
        <div className="flex flex-col items-center gap-4">
          <span className="inline-flex items-center justify-center rounded-full bg-muted p-6 shadow-md">
            <ShieldOff className="w-14 h-14 text-destructive" />
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight select-none">Unauthorized</h1>
        </div>
        <div className="flex flex-col items-center gap-3">
          <p className="text-lg sm:text-xl font-semibold text-foreground mb-1 text-center">
            You do not have permission to access this page.
          </p>
          <p className="text-base sm:text-lg text-muted-foreground max-w-md text-center">
            Please contact your administrator if you believe this is a mistake.
          </p>
        </div>
        <Link
          href="/"
          className="mt-6 px-6 py-2 rounded-md bg-muted text-foreground font-medium text-base shadow transition-all duration-200 border border-border focus:outline-none focus:ring-2 focus:ring-ring flex items-center gap-2 hover:bg-foreground/10 hover:shadow-lg hover:-translate-y-0.5"
        >
          Go back to homepage
        </Link>
      </div>
    </main>
  );
} 