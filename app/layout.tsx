import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ChakraConfigProvider } from "@/lib/chakra-config";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "视频生成平台",
  description: "专业的AI视频生成平台",
  icons: {
    icon: [
      { url: '/video/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/video/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/video/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/video/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/video/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/video/favicon.ico',
  },
  manifest: '/video/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="manifest" href="/video/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ChakraConfigProvider>
          <Navbar />
          <main>
            {children}
          </main>
        </ChakraConfigProvider>
      </body>
    </html>
  );
}