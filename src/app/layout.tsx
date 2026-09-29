import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import MainLayout from "@/components/MainLayout";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: "Wardrobe AI | Digital Closet",
  description: "AI-assisted digital closet, outfit planner, and wardrobe insights.",
};

const themeScript = `
  try {
    const savedTheme = localStorage.getItem("wardrobe-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const useDarkTheme = savedTheme ? savedTheme === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", useDarkTheme);
  } catch {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lexend.variable} font-lexend`}>
        <Script id="wardrobe-theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
