import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sign in | DAK Provider Portal",
  robots: { index: false, follow: false },
};

export default function DakLoginLayout({ children }: { children: ReactNode }) {
  return children;
}
