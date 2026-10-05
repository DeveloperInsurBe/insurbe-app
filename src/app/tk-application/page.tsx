import type { Metadata } from "next";

import TkApplicationForm from "./TkApplicationForm";

export const metadata: Metadata = {
  title: "Apply for TK Health Insurance | InsurBe",
  description: "Apply for Techniker Krankenkasse (TK) public health insurance online with InsurBe.",
  robots: { index: false },
};

export default function TkApplicationPage() {
  return <TkApplicationForm />;
}
