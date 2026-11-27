"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";

const MIN_LENGTH = 8;

type Mode = "continue" | "wrong-account" | "sign-in" | "create";

export default function InviteClient({
  token,
  email,
  hasAccount,
  signedInEmail,
}: {
  token: string;
  email: string;
  hasAccount: boolean;
  signedInEmail: string | null;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(
    signedInEmail ? (signedInEmail === email ? "continue" : "wrong-account") : hasAccount ? "sign-in" : "create",
  );
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const accept = async (extra: Record<string, unknown> = {}) => {
    const response = await fetch("/api/dak/invite/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...extra }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || "Something went wrong. Please try again.");
    return data as { ok?: boolean; needsSignIn?: boolean };
  };

  const run = async (task: () => Promise<void>) => {
    setError("");
    setBusy(true);
    try {
      await task();
    } catch (taskError) {
      setError((taskError as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const goToDashboard = () => router.push("/dashboard");

  const signInAndAccept = () =>
    run(async () => {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (!result || result.error) throw new Error("The password is not correct.");
      await accept();
      goToDashboard();
    });

  const createAndAccept = () =>
    run(async () => {
      if (password.length < MIN_LENGTH) throw new Error(`Your password must be at least ${MIN_LENGTH} characters long.`);
      if (password !== confirm) throw new Error("The two passwords do not match.");
      if (!acceptTerms) throw new Error("Please accept the terms and privacy policy.");
      const result = await accept({ password, acceptTerms: true });
      if (result.needsSignIn) {
        setMode("sign-in");
        setPassword("");
        throw new Error("You already have an InsurBe account. Please sign in with it.");
      }
      const login = await signIn("credentials", { email, password, redirect: false });
      if (!login || login.error) throw new Error("Your account was created. Please sign in at the login page.");
      goToDashboard();
    });

  const inputClass =
    "h-12 w-full rounded-xl border border-[#efe3fb] bg-white px-4 pr-11 text-sm outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10";
  const buttonClass =
    "mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#820ad1] to-[#a855f7] text-sm font-semibold text-white shadow-lg shadow-[#820ad1]/25 disabled:cursor-not-allowed disabled:opacity-60";

  const passwordField = (value: string, onChange: (next: string) => void, label: string, autoComplete: string) => (
    <label className="mt-4 block">
      <span className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</span>
      <span className="relative block">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          required
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => setShow((current) => !current)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#820ad1]"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </span>
    </label>
  );

  return (
    <div className="mt-6">
      {error ? (
        <p role="alert" className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
        </p>
      ) : null}

      {mode === "continue" ? (
        <button type="button" disabled={busy} onClick={() => run(async () => { await accept(); goToDashboard(); })} className={buttonClass}>
          {busy ? <Loader2 size={16} className="animate-spin" /> : null} Continue to my application <ArrowRight size={16} />
        </button>
      ) : null}

      {mode === "wrong-account" ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          You are signed in as <b>{signedInEmail}</b>, but this invitation is for <b>{email}</b>.
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: `/dak-invite?token=${encodeURIComponent(token)}` })}
            className="mt-3 block font-semibold text-[#820ad1] hover:underline"
          >
            Sign out and continue as {email}
          </button>
        </div>
      ) : null}

      {mode === "sign-in" ? (
        <form onSubmit={(event) => { event.preventDefault(); signInAndAccept(); }}>
          <p className="text-sm text-gray-600">
            Sign in to your InsurBe account <b>{email}</b> to continue.
          </p>
          {passwordField(password, setPassword, "Password", "current-password")}
          <button type="submit" disabled={busy} className={buttonClass}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : null} Sign in and continue
          </button>
          <Link href="/forgot-password" className="mt-3 inline-block text-sm font-semibold text-[#820ad1] hover:underline">
            Forgot your password?
          </Link>
        </form>
      ) : null}

      {mode === "create" ? (
        <form onSubmit={(event) => { event.preventDefault(); createAndAccept(); }}>
          <p className="text-sm text-gray-600">
            Create your InsurBe account for <b>{email}</b>. Opening this link from your inbox confirms your email address.
          </p>
          {passwordField(password, setPassword, `Choose a password (at least ${MIN_LENGTH} characters)`, "new-password")}
          {passwordField(confirm, setConfirm, "Repeat the password", "new-password")}
          <label className="mt-4 flex items-start gap-2.5 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(event) => setAcceptTerms(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#820ad1]"
            />
            <span>
              I accept the{" "}
              <Link href="/termscondition" target="_blank" className="font-semibold text-[#820ad1] underline">terms</Link>{" "}
              and the{" "}
              <Link href="/privacypolicy" target="_blank" className="font-semibold text-[#820ad1] underline">privacy policy</Link>.
            </span>
          </label>
          <button type="submit" disabled={busy} className={buttonClass}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : null} Create account and continue
          </button>
        </form>
      ) : null}
    </div>
  );
}
