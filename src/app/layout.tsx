import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Jost, Lexend } from "next/font/google";

import "./globals.css";

import Header from "./components/Header";
import Footernew from "./components/footernew";
import CookieBanner from "./cookie/CookieBanner";
import { Providers } from "./providers";
import LayoutWrapper from "./components/LayoutWrapper";
import { Toaster } from "sonner";
import ReferralCapture from "./components/ReferralCapture";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jost",
  display: "swap",
});

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-lexend",
  display: "swap",
});

export const metadata: Metadata = {
  title: "InsurBe",
  description: "Unlock the Best Insurance Solutions in Germany",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${jost.variable} ${lexend.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-67FRT0NP1T"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];

            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;

            gtag('js', new Date());

            // Default denied until user accepts cookies
            gtag('consent', 'default', {
              analytics_storage: 'denied'
            });

            gtag('config', 'G-67FRT0NP1T', {
              send_page_view: true
            });
          `}
        </Script>
      </head>

      <body
        className={`font-jost ${geistSans.variable} ${geistMono.variable} antialiased gradient-to-br from-white to-[#fdf3ff] min-h-screen`}
        suppressHydrationWarning
      >
        <Providers>
          <ReferralCapture />
          <LayoutWrapper>{children}</LayoutWrapper>

          <CookieBanner />
          <Toaster position="top-right" theme="light" richColors />
        </Providers>
      </body>
    </html>
  );
}
