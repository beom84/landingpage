import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";

const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim() || "GTM-PZQ7HG3D";

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken-grotesk",
});

export const metadata: Metadata = {
  title: "Trace | 막연한 목표를 행동으로",
  description:
    "Trace는 막연한 목표를 오늘 바로 시작할 수 있는 첫 행동으로 나눠주는 ADHD 친화형 실행 랜딩 페이지입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="light">
      <body className={hankenGrotesk.variable}>
        <noscript>
          <iframe
            height="0"
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
            width="0"
          />
        </noscript>
        {children}
        {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
      </body>
    </html>
  );
}
