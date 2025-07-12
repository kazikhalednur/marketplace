"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, Bell, UserCircle2, LogOut, Settings, HelpCircle, User as UserIcon } from "lucide-react";
import Icon from "@/components/ui/Icon";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import MobileSidebar from "@/components/navbar/MobileSidebar";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!profileDropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(e.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [profileDropdownOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => pathname.startsWith(path);

  // Helper to get user initials
  function getUserInitials() {
    if (user?.name && user.name.trim().length > 0) {
      return user.name.trim().split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (user?.first_name || user?.last_name) {
      return `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase();
    }
    return null;
  }

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all",
      scrolled ? "shadow-sm border-b bg-background/90 backdrop-blur" : "bg-background/70"
    )}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary">UniMarket</Link>

        {/* Desktop Nav - Aligned to the right */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className={cn("hover:text-primary", isActive("/dashboard") && "text-primary font-medium")}>Dashboard</Link>
            {user?.role === "client" && (
              <Link href="/my-jobs" className={cn("hover:text-primary", isActive("/my-jobs") && "text-primary font-medium")}>My Jobs</Link>
            )}
            {/* {isAuthenticated && (
              <>
                <Link href="/messages" className={cn("hover:text-primary", isActive("/messages") && "text-primary font-medium")}>Messages</Link>
                <Link href={roleDashboard} className={cn("hover:text-primary", isActive("/dashboard") && "text-primary font-medium")}>Dashboard</Link>
              </>
            )} */}
          </nav>
          
          {/* Actions - Theme toggle at the end */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="p-1.5 relative">
                  <Icon icon={Bell} size={32} />
                  {/* Example unread dot */}
                  <span className="absolute top-0 right-0 block w-2 h-2 rounded-full bg-red-500" />
                </Button>
                <div className="relative">
                  <button
                    ref={profileButtonRef}
                    className="p-0.5 rounded-full border-2 border-transparent hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary transition bg-background"
                    onClick={() => setProfileDropdownOpen((v) => !v)}
                    aria-haspopup="true"
                    aria-expanded={profileDropdownOpen}
                    aria-label="Open profile menu"
                    type="button"
                  >
                    {user?.avatar ? (
                      <Image
                        src={user.avatar || ""}
                        alt={user.name || ""}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      getUserInitials() ? (
                        <span
                          className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-tr from-primary/70 via-accent/60 to-secondary/70 text-lg font-extrabold text-white ring-2 ring-primary/30 shadow-md select-none"
                        >
                          {getUserInitials()}
                        </span>
                      ) : (
                        <Icon icon={UserCircle2} size={24} className="text-muted-foreground" />
                      )
                    )}
                  </button>
                  {/* Improved Dropdown */}
                  {profileDropdownOpen && (
                    <div
                      ref={profileDropdownRef}
                      className="absolute right-0 mt-2 w-72 bg-popover border border-border shadow-xl rounded-2xl py-2 px-0 z-50 transition-all duration-200 opacity-100 translate-y-0"
                    >
                      <div className="flex flex-col items-center gap-2 py-5 border-b border-border">
                        {user?.avatar ? (
                          <Image
                            src={user.avatar || ""}
                            alt={user.name || ""}
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/30 shadow"
                          />
                        ) : (
                          getUserInitials() ? (
                            <span className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-tr from-primary/70 via-accent/60 to-secondary/70 text-3xl font-extrabold text-white ring-2 ring-primary/30 shadow-md select-none">
                              {getUserInitials()}
                            </span>
                          ) : (
                            <Icon icon={UserCircle2} size={40} className="text-muted-foreground" />
                          )
                        )}
                        <span className="font-bold text-lg">{user?.name}</span>
                        <span className="text-base font-medium text-muted-foreground">{user?.email}</span>
                      </div>
                      <Link href="/profile" className="flex items-center gap-3 w-full px-4 py-2 mt-1 hover:bg-primary/10 hover:border-l-4 hover:border-primary rounded-lg transition text-base font-semibold">
                        <Icon icon={UserIcon} size={18} /> Profile
                      </Link>
                      <button className="flex items-center gap-3 w-full px-4 py-2 hover:bg-primary/10 hover:border-l-4 hover:border-primary rounded-lg transition text-base font-semibold">
                        <Icon icon={Settings} size={18} /> Settings
                      </button>
                      <button className="flex items-center gap-3 w-full px-4 py-2 hover:bg-primary/10 hover:border-l-4 hover:border-primary rounded-lg transition text-base font-semibold">
                        <Icon icon={HelpCircle} size={18} /> Help
                      </button>
                      <button
                        className="flex items-center gap-3 w-full px-4 py-2 mt-2 hover:bg-red-100 hover:border-l-4 hover:border-red-500 rounded-lg transition text-base font-semibold text-red-600"
                        onClick={logout}
                      >
                        <Icon icon={LogOut} size={18} className="-scale-x-100" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}
            
            {/* Theme Toggle - Always at the end */}
            <span className="scale-125">
              <ThemeToggle />
            </span>
          </div>
        </div>
        {/* Hamburger (Mobile only) */}
        <button
          className="md:hidden flex items-center justify-center p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      {/* Mobile Sidebar */}
      <MobileSidebar open={mobileSidebarOpen} setOpen={setMobileSidebarOpen} />
    </header>
  );
}
 