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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ChakraConfigProvider>
          {/* 导航栏组件内部会判断是否显示 */}
          <Navbar />
          <main>
            {children}
          </main>
        </ChakraConfigProvider>
      </body>
    </html>
  );
}