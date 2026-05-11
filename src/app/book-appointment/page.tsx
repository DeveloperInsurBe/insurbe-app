"use client";

import { trackEvent } from "@/lib/gtag";
import { useEffect } from "react";
import { InlineWidget } from "react-calendly";

export default function BookAppointment() {
  useEffect(() => {
    trackEvent("book_appointment");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-10 overflow-hidden">
      <div className="w-full max-w-5xl h-[700px] overflow-hidden">
        <InlineWidget
          url="https://calendly.com/marvin-fuerst-insurbe/30min"
          styles={{ height: "100%" }}
        />
      </div>
    </div>
  );
}
