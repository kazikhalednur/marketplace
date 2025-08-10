import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from '@/components/ui/toast-provider';
import ReduxProvider from '@/store/Provider';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import React from 'react';
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/Footer";
import NotificationWebSocketProvider from "@/components/NotificationWebSocketProvider";
import ChatWebSocketProvider from '@/components/ChatWebSocketProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
      title: "CPCHUB",
  description: "Online Marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        <ReduxProvider>
          <ThemeProvider>
            <ToastProvider>
              <NotificationWebSocketProvider>
                <ChatWebSocketProvider>
                  <Navbar />
                  {children}
                  <Footer />
                </ChatWebSocketProvider>
              </NotificationWebSocketProvider>
            </ToastProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
