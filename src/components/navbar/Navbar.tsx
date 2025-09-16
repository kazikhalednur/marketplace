"use client";

import MobileSidebar from "@/components/navbar/MobileSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import Avatar from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/hooks/useAuth";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { cn } from "@/lib/utils";
import { HelpCircle, LogOut, Menu, Settings, User as UserIcon, Wifi, ChevronDown, FileText, Briefcase } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import NotificationDropdown from "./NotificationDropdown";
import MessagesDropdown from "./MessagesDropdown";


export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { isOnline } = useNetworkStatus();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [manageWorkDropdownOpen, setManageWorkDropdownOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const manageWorkButtonRef = useRef<HTMLButtonElement>(null);
  const manageWorkDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!profileDropdownOpen && !manageWorkDropdownOpen) return;
    function handleClick(e: MouseEvent) {
      // Close profile dropdown
      if (
        profileDropdownOpen &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(e.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
      
      // Close manage work dropdown
      if (
        manageWorkDropdownOpen &&
        manageWorkDropdownRef.current &&
        !manageWorkDropdownRef.current.contains(e.target as Node) &&
        manageWorkButtonRef.current &&
        !manageWorkButtonRef.current.contains(e.target as Node)
      ) {
        setManageWorkDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [profileDropdownOpen, manageWorkDropdownOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => pathname.startsWith(path);

  // Helper to get display name
  function getDisplayName() {
    if (user?.name && user.name.trim().length > 0) {
      return user.name;
    }
    if (user?.first_name || user?.last_name) {
      return `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
    }
    return 'User';
  }

  // Helper to determine if avatar is real
  function hasRealAvatar() {
    if (!user?.avatar) return false;
    const placeholderList = ["/avatar-placeholder.png", "/placeholder.png", "placeholder", "avatar-placeholder"];
    return !placeholderList.includes(user.avatar.trim());
  }

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all",
      scrolled ? "shadow-sm border-b bg-background/90 backdrop-blur" : "bg-background/70"
    )}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary">CPCHUB</Link>

        {/* Desktop Nav - Aligned to the right */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className={cn("hover:text-primary", isActive("/dashboard") && "text-primary font-medium")}>Dashboard</Link>
            {user?.role === "client" && (
              <>
                <Link href="/my-jobs" className={cn("hover:text-primary", isActive("/my-jobs") && "text-primary font-medium")}>My Jobs</Link>
                <div className="relative">
                  <button
                    ref={manageWorkButtonRef}
                    className={cn(
                      "flex items-center gap-1 hover:text-primary transition-colors",
                      (isActive("/manage-work") || isActive("/contract")) && "text-primary font-medium"
                    )}
                    onClick={() => setManageWorkDropdownOpen((v) => !v)}
                    aria-haspopup="true"
                    aria-expanded={manageWorkDropdownOpen}
                    aria-label="Open manage work menu"
                    type="button"
                  >
                    Manage Work
                    <ChevronDown className={cn("w-4 h-4 transition-transform", manageWorkDropdownOpen && "rotate-180")} />
                  </button>
                  {manageWorkDropdownOpen && (
                    <div
                      ref={manageWorkDropdownRef}
                      className="absolute top-full left-0 mt-2 w-48 bg-popover border border-border shadow-xl rounded-lg py-2 z-50 transition-all duration-200 opacity-100 translate-y-0"
                    >
                      <Link
                        href="/manage-work"
                        className="flex items-center gap-3 w-full px-4 py-2 hover:bg-primary/10 hover:border-l-4 hover:border-primary transition text-sm font-medium"
                        onClick={() => setManageWorkDropdownOpen(false)}
                      >
                        <Icon icon={Briefcase} size={16} />
                        Manage Work
                      </Link>
                      <Link
                        href="/contract"
                        className="flex items-center gap-3 w-full px-4 py-2 hover:bg-primary/10 hover:border-l-4 hover:border-primary transition text-sm font-medium"
                        onClick={() => setManageWorkDropdownOpen(false)}
                      >
                        <Icon icon={FileText} size={16} />
                        Contract
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
            {user?.role === "freelancer" && (
              <>
                <Link href="/my-bids" className={cn("hover:text-primary", isActive("/my-bids") && "text-primary font-medium")}>My Bids</Link>
                <div className="relative">
                  <button
                    ref={manageWorkButtonRef}
                    className={cn(
                      "flex items-center gap-1 hover:text-primary transition-colors",
                      (isActive("/manage-work") || isActive("/contract")) && "text-primary font-medium"
                    )}
                    onClick={() => setManageWorkDropdownOpen((v) => !v)}
                    aria-haspopup="true"
                    aria-expanded={manageWorkDropdownOpen}
                    aria-label="Open manage work menu"
                    type="button"
                  >
                    Manage Work
                    <ChevronDown className={cn("w-4 h-4 transition-transform", manageWorkDropdownOpen && "rotate-180")} />
                  </button>
                  {manageWorkDropdownOpen && (
                    <div
                      ref={manageWorkDropdownRef}
                      className="absolute top-full left-0 mt-2 w-48 bg-popover border border-border shadow-xl rounded-lg py-2 z-50 transition-all duration-200 opacity-100 translate-y-0"
                    >
                      <Link
                        href="/manage-work"
                        className="flex items-center gap-3 w-full px-4 py-2 hover:bg-primary/10 hover:border-l-4 hover:border-primary transition text-sm font-medium"
                        onClick={() => setManageWorkDropdownOpen(false)}
                      >
                        <Icon icon={Briefcase} size={16} />
                        Manage Work
                      </Link>
                      <Link
                        href="/contract"
                        className="flex items-center gap-3 w-full px-4 py-2 hover:bg-primary/10 hover:border-l-4 hover:border-primary transition text-sm font-medium"
                        onClick={() => setManageWorkDropdownOpen(false)}
                      >
                        <Icon icon={FileText} size={16} />
                        Contract
                      </Link>
                    </div>
                  )}
                </div>
              </>
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
                {/* Network Status Indicator */}
                {isOnline && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50">
                    <Wifi className="w-4 h-4 text-green-500" />
                  </div>
                )}
                
                <NotificationDropdown />
                <MessagesDropdown />
                
                <div className="relative">
                  <button
                    ref={profileButtonRef}
                    className="p-0.5 rounded-full border-2 border-transparent hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary transition bg-background cursor-pointer"
                    onClick={() => setProfileDropdownOpen((v) => !v)}
                    aria-haspopup="true"
                    aria-expanded={profileDropdownOpen}
                    aria-label="Open profile menu"
                    type="button"
                  >
                    <Avatar src={user?.avatar ?? undefined} name={getDisplayName() ?? undefined} size={40} />
                  </button>
                  {/* Improved Dropdown */}
                  {profileDropdownOpen && (
                    <div
                      ref={profileDropdownRef}
                      className="absolute right-0 mt-2 w-72 bg-popover border border-border shadow-xl rounded-2xl py-2 px-0 z-50 transition-all duration-200 opacity-100 translate-y-0"
                    >
                      <div className="flex flex-col items-center gap-2 py-5 border-b border-border">
                        {hasRealAvatar() ? (
                          <Avatar src={user?.avatar ?? undefined} name={getDisplayName() ?? undefined} size={80} />
                        ) : null }
                        <span className="font-bold text-lg">{getDisplayName()}</span>
                        <span className="text-base font-medium text-muted-foreground">{user?.email}</span>
                      </div>
                      <Link 
                        href={`/profile/${user?.username || 'profile'}`}
                        className="flex items-center gap-3 w-full px-4 py-2 mt-1 hover:bg-primary/10 hover:border-l-4 hover:border-primary rounded-lg transition text-base font-semibold"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <Icon icon={UserIcon} size={18} /> Profile
                      </Link>
                      <button 
                        className="flex items-center gap-3 w-full px-4 py-2 hover:bg-primary/10 hover:border-l-4 hover:border-primary rounded-lg transition text-base font-semibold cursor-pointer"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <Icon icon={Settings} size={18} /> Settings
                      </button>
                      <button 
                        className="flex items-center gap-3 w-full px-4 py-2 hover:bg-primary/10 hover:border-l-4 hover:border-primary rounded-lg transition text-base font-semibold cursor-pointer"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <Icon icon={HelpCircle} size={18} /> Help
                      </button>
                      <button
                        className="flex items-center gap-3 w-full px-4 py-2 mt-2 hover:bg-red-100 hover:border-l-4 hover:border-red-500 rounded-lg transition text-base font-semibold text-red-600 cursor-pointer"
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                        }}
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
          className="md:hidden flex items-center justify-center p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
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
 