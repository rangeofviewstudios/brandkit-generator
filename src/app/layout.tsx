import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Toaster from "@/components/Toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Brand Kit Generator — Range of View Studios",
  description: "Generate beautiful, interactive brand kits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col antialiased`} suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
