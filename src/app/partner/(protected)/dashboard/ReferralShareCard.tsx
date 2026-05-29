"use client";

import {
  Copy,
  Facebook,
  Linkedin,
  Mail,
  MessageCircle,
  Send,
  Share2,
  Twitter,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  referralLink: string;
  partnerName: string;
};

function openShareWindow(url: string) {
  window.open(url, "_blank", "noopener,noreferrer,width=720,height=720");
}

export default function ReferralShareCard({ referralLink, partnerName }: Props) {
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const shareText = `Join InsurBe using my referral link.`;
  const shareTitle = `InsurBe Referral from ${partnerName}`;
  const encodedLink = encodeURIComponent(referralLink);
  const encodedText = encodeURIComponent(`${shareText} ${referralLink}`);

  const shareActions = [
    {
      label: "WhatsApp",
      icon: MessageCircle,
      onClick: () => openShareWindow(`https://wa.me/?text=${encodedText}`),
    },
    {
      label: "Facebook",
      icon: Facebook,
      onClick: () =>
        openShareWindow(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`,
        ),
    },
    {
      label: "X",
      icon: Twitter,
      onClick: () =>
        openShareWindow(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodedLink}`,
        ),
    },
    {
      label: "LinkedIn",
      icon: Linkedin,
      onClick: () =>
        openShareWindow(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`,
        ),
    },
    {
      label: "Telegram",
      icon: Send,
      onClick: () =>
        openShareWindow(
          `https://t.me/share/url?url=${encodedLink}&text=${encodeURIComponent(shareText)}`,
        ),
    },
    {
      label: "Email",
      icon: Mail,
      onClick: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(
          shareTitle,
        )}&body=${encodedText}`;
      },
    },
  ] as const;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to copy link. Please copy manually.");
    }
  }

  async function shareNative() {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: referralLink,
      });
    } catch {
      // User dismissed share sheet; no toast needed.
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[22px] md:rounded-[30px] bg-gradient-to-br from-[#6d00c9] via-[#820ad1] to-[#a855f7] p-4 sm:p-6 text-white shadow-[0_18px_55px_rgba(130,10,209,0.22)]">
      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[2px] text-white/80 backdrop-blur-md">
          Affiliate Link
        </div>

        <h2 className="mt-4 text-2xl sm:text-3xl font-black leading-tight">Invite & Earn</h2>

        <p className="mt-2.5 text-sm leading-relaxed text-white/80">
          Share this link on WhatsApp, social media, or email. If someone submits
          an insurance application through your link, you earn EUR 5 commission.
        </p>

        <div className="mt-5 flex h-14 items-center overflow-hidden rounded-2xl border border-white/15 bg-white/10 px-4 backdrop-blur-md">
          <p className="truncate text-sm font-semibold text-white">{referralLink}</p>
        </div>

        <div className="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-2">
          {shareActions.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className="h-11 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 transition-all inline-flex items-center justify-center"
                aria-label={`Share via ${item.label}`}
                title={`Share via ${item.label}`}
              >
                <Icon size={18} />
              </button>
            );
          })}
        </div>

        <div className="mt-3 text-xs text-white/80">
          Message preview: &quot;Join InsurBe using my referral link.&quot;
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-bold text-[#820ad1] transition-all duration-200 hover:scale-[1.02] gap-2"
          >
            <Copy size={16} />
            Copy Link
          </button>

          {canNativeShare ? (
            <button
              type="button"
              onClick={shareNative}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 text-sm font-bold text-white transition-all duration-200 hover:bg-white/20 gap-2"
            >
              <Share2 size={16} />
              Share
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
