"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Eye, EyeOff, KeyRound, Lock, Mail, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";

import { api } from "../../_lib/client";
import { useReviewer } from "../../_components/PortalShell";
import { Button, initials, PageHeader, Panel } from "../../_components/ui";

type Tab = "profile" | "security";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-300 transition focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[200px_1fr] sm:gap-6">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-slate-900">
          {label}
        </label>
        {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder="••••••••••••"
        className={`${inputClass} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function DakAccountPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const reviewer = useReviewer();
  const [tab, setTab] = useState<Tab>("profile");
  const [firstName, setFirstName] = useState(reviewer.firstName);
  const [lastName, setLastName] = useState(reviewer.lastName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const displayName = [firstName, lastName].filter(Boolean).join(" ") || reviewer.name;

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api("/account", { method: "PATCH", json: { firstName, lastName } });
      toast.success("Profile saved");
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) return toast.error("The new passwords do not match.");
    setSaving(true);
    try {
      await api("/account", { method: "POST", json: { currentPassword, newPassword } });
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const TABS: { id: Tab; label: string; icon: typeof UserRound }[] = [
    { id: "profile", label: "Profile", icon: UserRound },
    { id: "security", label: "Security", icon: ShieldCheck },
  ];

  return (
    <>
      <PageHeader title="Account & Security" subtitle="Manage your profile and sign-in credentials" />

      <div className="max-w-4xl space-y-6">
        {/* PROFILE HEADER */}
        <Panel>
          <div className="relative h-24 bg-gradient-to-r from-[#5b21b6] via-[#8b2be2] to-[#c084fc]">
            <div
              className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "18px 18px" }}
              aria-hidden
            />
          </div>
          <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
            <span className="-mt-10 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-[#8b2be2] to-[#5b21b6] text-2xl font-bold text-white shadow-lg">
              {initials(displayName)}
            </span>
            <div className="flex-1">
              <p className="text-lg font-semibold text-slate-900">{displayName}</p>
              <p className="flex items-center gap-1.5 text-sm text-slate-500">
                <Mail className="h-3.5 w-3.5" aria-hidden /> {reviewer.email}
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/15">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden /> DAK Reviewer · Active
            </span>
          </div>
        </Panel>

        {/* TABS */}
        <div role="tablist" aria-label="Account sections" className="flex gap-1 border-b border-slate-200">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setTab(id)}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  active ? "text-violet-700" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
                {active && (
                  <motion.span layoutId="dak-account-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-violet-600" aria-hidden />
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            role="tabpanel"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "profile" ? (
              <Panel title="Profile" padded>
                <form onSubmit={saveProfile} className="space-y-6">
                  <Field id="dak-first-name" label="First name" hint="Your name is shown in the activity log.">
                    <input
                      id="dak-first-name"
                      required
                      maxLength={80}
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field id="dak-last-name" label="Last name">
                    <input
                      id="dak-last-name"
                      maxLength={80}
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field id="dak-account-email" label="Email address" hint="Email changes require InsurBe administrator support.">
                    <div className="relative">
                      <input id="dak-account-email" value={reviewer.email} disabled className={`${inputClass} pr-10`} />
                      <Lock className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                    </div>
                  </Field>
                  <div className="flex justify-end border-t border-slate-100 pt-5">
                    <Button type="submit" variant="primary" loading={saving}>
                      Save changes
                    </Button>
                  </div>
                </form>
              </Panel>
            ) : (
              <Panel title={<span className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-violet-600" aria-hidden /> Password</span>} padded>
                <form onSubmit={updatePassword} className="space-y-6">
                  <Field id="dak-current-password" label="Current password">
                    <PasswordInput
                      id="dak-current-password"
                      value={currentPassword}
                      onChange={setCurrentPassword}
                      autoComplete="current-password"
                    />
                  </Field>
                  <Field id="dak-new-password" label="New password" hint="Use at least 12 characters.">
                    <PasswordInput id="dak-new-password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
                  </Field>
                  <Field id="dak-confirm-password" label="Confirm new password">
                    <PasswordInput
                      id="dak-confirm-password"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      autoComplete="new-password"
                    />
                  </Field>
                  <div className="flex justify-end border-t border-slate-100 pt-5">
                    <Button type="submit" variant="primary" loading={saving}>
                      Update password
                    </Button>
                  </div>
                </form>
              </Panel>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
