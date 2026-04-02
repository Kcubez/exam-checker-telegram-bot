import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ToastProvider } from "@/components/ui/toast";
import { NextProgressBar } from "@/components/ui/progress-bar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Exam Checker Bot Dashboard",
  description: "စာမေးပွဲစစ်ဆေးမည့် တယ်လီဂရမ်ဘော့တ် ထိန်းချုပ်ခန်း",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <NextProgressBar />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
