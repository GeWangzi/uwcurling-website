import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/components/AuthProvider";
import { Navbar } from "@/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-zinc-950">
      <head>
        <meta name="theme-color" content="#09090b" />
        <meta name="color-scheme" content="dark" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="vsc-initialized min-h-screen bg-zinc-950">
        <AuthProvider>
          <Navbar />
          <main className="text-white">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
