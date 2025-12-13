import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import Image from "next/image";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { HeaderSection } from "@/components/index/header-section"
import { FooterSection } from "@/components/index/footer-section"

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "半栈人生",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >

          <HeaderSection />

          {children}
          <FooterSection />
        </ThemeProvider>
      </body>
    </html>
  );
}
