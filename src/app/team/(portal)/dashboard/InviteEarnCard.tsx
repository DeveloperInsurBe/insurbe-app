"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Facebook, Gift, Linkedin, Mail, MessageCircle, Send, Share2, Twitter } from "lucide-react";

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const openShareWindow = (url: string) => window.open(url, "_blank", "noopener,noreferrer,width=720,height=720");

/**
 * Compact "Invite & Earn" for the Sales Leader dashboard: the customer link,
 * a copy button and share shortcuts in one slim card.
 */
export default function InviteEarnCard({ link, name, rate }: { link: string; name: string; rate: number }) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share), []);

  const text = "Join InsurBe using my referral link.";
  const title = `InsurBe Referral from ${name}`;
  const encodedLink = encodeURIComponent(link);
  const encodedText = encodeURIComponent(`${text} ${link}`);

  const actions = [
    { label: "WhatsApp", icon: MessageCircle, run: () => openShareWindow(`https://wa.me/?text=${encodedText}`) },
    {
      label: "Email",
      icon: Mail,
      run: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}`;
      },
    },
    { label: "LinkedIn", icon: Linkedin, run: () => openShareWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`) },
    { label: "Facebook", icon: Facebook, run: () => openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`) },
    {
      label: "X",
      icon: Twitter,
      run: () => openShareWindow(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodedLink}`),
    },
    {
      label: "Telegram",
      icon: Send,
      run: () => openShareWindow(`https://t.me/share/url?url=${encodedLink}&text=${encodeURIComponent(text)}`),
    },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Unable to copy the link. Please copy it manually.");
    }
  };

  const shareNative = async () => {
    try {
      await navigator.share({ title, text, url: link });
    } catch {
      // share sheet closed
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        {/* Title */}
        <div className="flex min-w-0 items-center gap-3 lg:w-56 lg:shrink-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#820ad1] to-[#a855f7] text-white">
            <Gift className="h-[18px] w-[18px]" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-gray-900">Invite &amp; Earn</span>
            <span className="block text-xs text-gray-500">{euro.format(rate)} per application through your link</span>
          </span>
        </div>

        {/* Link + copy */}
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-1 pl-3 pr-1">
          <span className="min-w-0 flex-1 truncate font-mono text-xs text-gray-600" title={link}>
            {link.replace(/^https?:\/\//, "")}
          </span>
          <button
            type="button"
            onClick={copy}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-[#820ad1] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#6d08b0]"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        {/* Share shortcuts */}
        <div className="flex items-center gap-1.5" aria-label="Share your link">
          {actions.map(({ label, icon: Icon, run }) => (
            <button
              key={label}
              type="button"
              onClick={run}
              aria-label={`Share via ${label}`}
              title={`Share via ${label}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:border-[#820ad1]/40 hover:bg-[#820ad1]/5 hover:text-[#820ad1]"
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
          {canNativeShare ? (
            <button
              type="button"
              onClick={shareNative}
              aria-label="More sharing options"
              title="More sharing options"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:border-[#820ad1]/40 hover:bg-[#820ad1]/5 hover:text-[#820ad1]"
            >
              <Share2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
