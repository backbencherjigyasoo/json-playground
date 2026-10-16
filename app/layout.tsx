import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "API Lens — In-Browser API Playground & JSON Explorer",
  description: "Fast, developer-first in-browser API client & JSON explorer. Test REST endpoints, explore nested JSON trees, run queries, and persist request history with zero install.",
  keywords: ["API Client", "JSON Viewer", "JSONPath", "REST API", "Developer Tool", "Postman alternative"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
