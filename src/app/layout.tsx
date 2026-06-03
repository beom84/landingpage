import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-FG5T2B8DPX";

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken-grotesk",
});

export const metadata: Metadata = {
  title: "Trace | 나를 위한 계획표",
  description:
    "Trace는 막연한 목표를 오늘 바로 시작할 수 있는 첫 행동으로 나눠 주는 ADHD 친화형 실행 랜딩 페이지입니다.",
  icons: {
    icon: "/trace-logo.png",
    apple: "/trace-logo.png",
    shortcut: "/trace-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="light">
      <body className={hankenGrotesk.variable}>
        {children}
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
}
