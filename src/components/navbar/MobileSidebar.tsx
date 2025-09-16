// components/MobileSidebar.tsx
"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { Briefcase, Home, LogOut, MessageSquare, UserCircle2, FileText } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

interface MobileSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function MobileSidebar({ open, setOpen }: MobileSidebarProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const roleDashboard =
    user?.role === "employer"
      ? "/dashboard/employer"
      : user?.role === "admin"
      ? "/dashboard/admin"
      : "/dashboard";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-64 px-6 py-6">
        {/* Visually hidden title for accessibility */}
        <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="text-xl font-bold text-primary"
              onClick={() => setOpen(false)}
            >
              CPCHUB
            </Link>
          </div>

          <nav className="flex flex-col gap-4 mt-6">
            <Link
              href="/"
              className="flex items-center gap-3 text-base font-medium hover:text-primary"
              onClick={() => setOpen(false)}
            >
              <Home className="w-5 h-5" /> Home
            </Link>
            <Link
              href="/jobs"
              className="flex items-center gap-3 text-base font-medium hover:text-primary"
              onClick={() => setOpen(false)}
            >
              <Briefcase className="w-5 h-5" /> Browse Jobs
            </Link>
            {isAuthenticated && (
              <>
                {user?.role === "client" && (
                  <>
                    <Link
                      href="/my-jobs"
                      className="flex items-center gap-3 text-base font-medium hover:text-primary"
                      onClick={() => setOpen(false)}
                    >
                      <Briefcase className="w-5 h-5" /> My Jobs
                    </Link>
                    <Link
                      href="/manage-work"
                      className="flex items-center gap-3 text-base font-medium hover:text-primary"
                      onClick={() => setOpen(false)}
                    >
                      <Briefcase className="w-5 h-5" /> Manage Work
                    </Link>
                    <Link
                      href="/contract"
                      className="flex items-center gap-3 text-base font-medium hover:text-primary ml-6"
                      onClick={() => setOpen(false)}
                    >
                      <FileText className="w-5 h-5" /> Contract
                    </Link>
                  </>
                )}
                {user?.role === "freelancer" && (
                  <>
                    <Link
                      href="/my-bids"
                      className="flex items-center gap-3 text-base font-medium hover:text-primary"
                      onClick={() => setOpen(false)}
                    >
                      <Briefcase className="w-5 h-5" /> My Bids
                    </Link>
                    <Link
                      href="/manage-work"
                      className="flex items-center gap-3 text-base font-medium hover:text-primary"
                      onClick={() => setOpen(false)}
                    >
                      <Briefcase className="w-5 h-5" /> Manage Work
                    </Link>
                    <Link
                      href="/contract"
                      className="flex items-center gap-3 text-base font-medium hover:text-primary ml-6"
                      onClick={() => setOpen(false)}
                    >
                      <FileText className="w-5 h-5" /> Contract
                    </Link>
                  </>
                )}
                <Link
                  href="/messages"
                  className="flex items-center gap-3 text-base font-medium hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  <MessageSquare className="w-5 h-5" /> Messages
                </Link>
                <Link
                  href={roleDashboard}
                  className="flex items-center gap-3 text-base font-medium hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  <UserCircle2 className="w-5 h-5" /> Dashboard
                </Link>
                <Button
                  variant="destructive"
                  className="text-left w-full px-0 py-2 text-sm font-semibold rounded-md mt-2"
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                >
                  <span className="inline-flex items-center gap-2 align-middle">
                    <LogOut className="w-4 h-4 -scale-x-100" />
                    <span className="leading-none">Logout</span>
                  </span>
                </Button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link
                  href="/login"
                  className="text-base font-medium hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-base font-medium hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* Theme Toggle at the bottom */}
        </div>
        <div className="absolute bottom-0 left-0 w-full px-6 pb-6">
          <div className="flex items-center justify-center gap-3 bg-muted/60 rounded-lg py-3 shadow-sm">
            <span
              className={`text-sm font-medium ${isDark ? 'text-white' : 'text-muted-foreground'}`}
            >
              Theme
            </span>
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
