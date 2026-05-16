import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GymPath | 黑白训练系统",
  description: "Python 核心逻辑驱动的 React 健身计划 MVP。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
