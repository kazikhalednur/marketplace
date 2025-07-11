"use client";
import Link from "next/link";
import { Linkedin, Twitter, Github } from "lucide-react";
import Icon from "@/components/ui/Icon";

export default function Footer() {
  return (
    <footer className="w-full bg-background border-t border-border pt-10">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-start md:justify-between gap-10">
        {/* Branding & Social */}
        <div className="flex-1 flex flex-col gap-4">
          <Link href="/" className="text-2xl font-extrabold text-primary tracking-tight">UniMarket</Link>
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
            The modern marketplace for students, employers, and professionals. Discover, connect, and grow with the best projects in the industry.
          </p>
          <div className="flex gap-2 mt-2">
            <a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn"
              className="rounded-full p-2 hover:bg-accent transition">
              <Icon icon={Linkedin} size={18} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter"
              className="rounded-full p-2 hover:bg-accent transition">
              <Icon icon={Twitter} size={18} />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener" aria-label="GitHub"
              className="rounded-full p-2 hover:bg-accent transition">
              <Icon icon={Github} size={18} />
            </a>
          </div>
        </div>
        {/* Navigation */}
        <div className="flex-1 flex flex-col gap-2 min-w-[120px]">
          <span className="font-semibold text-base mb-1 text-foreground">Navigation</span>
          <Link href="/" className="text-muted-foreground hover:text-primary transition text-sm">Home</Link>
          <Link href="/jobs" className="text-muted-foreground hover:text-primary transition text-sm">Browse Jobs</Link>
          <Link href="/about" className="text-muted-foreground hover:text-primary transition text-sm">About</Link>
          <Link href="/contact" className="text-muted-foreground hover:text-primary transition text-sm">Contact</Link>
        </div>
        {/* Newsletter or CTA */}
        <div className="flex-1 flex flex-col gap-3">
          <span className="font-semibold text-base mb-1 text-foreground">Stay in the loop</span>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="Your email"
              className="rounded-md border border-border bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full"
            />
            <button
              type="submit"
              className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition"
            >
              Subscribe
            </button>
          </form>
          <span className="text-xs text-muted-foreground">Get updates on the best projects and new features.</span>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground bg-muted/60 mt-10">
        © {new Date().getFullYear()} UniMarket. All rights reserved. &nbsp;|&nbsp;
        <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link> &nbsp;|&nbsp;
        <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
      </div>
    </footer>
  );
} 