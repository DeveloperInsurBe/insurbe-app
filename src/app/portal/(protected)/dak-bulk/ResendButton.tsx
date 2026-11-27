"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCw } from "lucide-react";

/** "Send again" for an invitation that failed or expired. */
export default function ResendButton({ draftId }: { draftId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const resend = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/partner/dak-bulk/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Could not send again.");
      router.refresh();
    } catch (resendError) {
      setError((resendError as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={resend}
        disabled={busy}
        className="inline-flex items-center gap-1 text-xs font-semibold text-[#820ad1] hover:underline disabled:opacity-60"
      >
        {busy ? <Loader2 size={12} className="animate-spin" /> : <RotateCw size={12} />} Send again
      </button>
      {error ? <span className="text-[11px] text-red-600">{error}</span> : null}
    </span>
  );
}
