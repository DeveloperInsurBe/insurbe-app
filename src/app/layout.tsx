import type { Metadata } from "next";
import { Geist, Geist_Mono, Jost, Lexend } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import Header from "./components/Header";

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
  title: "InsureBe",
  description: "Unlock the Best Insurance Solutions in Germany",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jost.variable} ${lexend.variable}`}>
      <body
        className={`font-jost ${geistSans.variable} ${geistMono.variable} antialiased gradient-to-br from-white to-[#fdf3ff] min-h-screen`}
      >
        <Header/>
        {children}
        <Footer/>
      </body>
    </html>
  );
}
