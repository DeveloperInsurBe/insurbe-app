"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: Props) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const err: Record<string, string> = {};
    if (!form.name.trim()) err.name = "Name is required";
    if (!form.email || !form.email.includes("@")) err.email = "Valid email required";
    if (!form.message.trim()) err.message = "Message is required";
    return err;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length > 0) { setErrors(err); return; }
    setErrors({});
    setLoading(true);
    await new Promise((res) => setTimeout(res, 1500));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); onClose(); }, 2500);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setSuccess(false); setErrors({}); setForm({ name: "", email: "", message: "" }); }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: "rgba(10, 10, 10, 0.55)", backdropFilter: "blur(6px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* MODAL WRAPPER */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          >
            <div
              style={{
                background: "#fff",
                width: "100%",
                maxWidth: "448px",
                borderRadius: "20px",
                boxShadow: "0 8px 40px rgba(0,0,0,0.14), 0 1px 3px rgba(0,0,0,0.08)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* TOP ACCENT BAR */}
              <div style={{ height: "4px", background: "linear-gradient(90deg, #820ad1, #a65de0, #c084fc)", width: "100%" }} />

              <div style={{ padding: "1.75rem 2rem 2rem" }}>

                {/* CLOSE BUTTON */}
                <button
                  onClick={handleClose}
                  style={{
                    position: "absolute",
                    top: "1.1rem",
                    right: "1.1rem",
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    border: "1px solid #e5e7eb",
                    background: "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#9ca3af",
                    fontSize: "13px",
                    transition: "background 0.15s, color 0.15s, border-color 0.15s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6";
                    (e.currentTarget as HTMLButtonElement).style.color = "#111827";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#d1d5db";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e7eb";
                  }}
                >
                  ✕
                </button>

                <AnimatePresence mode="wait">
                  {success ? (
                    /* SUCCESS STATE */
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 24 }}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2.5rem 0 1.5rem" }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.1 }}
                        style={{
                          width: "68px",
                          height: "68px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #f3e8ff, #f3e8ff)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "1.25rem",
                          border: "2px solid #c9a6e8",
                        }}
                      >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#820ad1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </motion.div>
                      <p style={{ fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "6px" }}>Message sent!</p>
                      <p style={{ fontSize: "14px", color: "#6b7280" }}>We'll get back to you within a few hours.</p>
                    </motion.div>
                  ) : (
                    /* FORM STATE */
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {/* HEADER */}
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "10px",
                          background: "linear-gradient(135deg, #f3e8ff, #f3e8ff)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          border: "1px solid #c9a6e8",
                          flexShrink: 0,
                        }}>
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#820ad1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>Contact Support</h3>
                        </div>
                      </div>
                      <p style={{ fontSize: "13.5px", color: "#6b7280", marginBottom: "1.5rem", marginTop: "6px" }}>
                        We usually reply within a few hours.
                      </p>

                      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        <FloatingInput
                          label="Your Name"
                          value={form.name}
                          onChange={(v) => setForm({ ...form, name: v })}
                          error={errors.name}
                        />
                        <FloatingInput
                          label="Email Address"
                          value={form.email}
                          onChange={(v) => setForm({ ...form, email: v })}
                          error={errors.email}
                        />
                        <FloatingTextarea
                          label="Your Message"
                          value={form.message}
                          onChange={(v) => setForm({ ...form, message: v })}
                          error={errors.message}
                        />

                        {/* SUBMIT */}
                        <button
                          type="submit"
                          disabled={loading}
                          style={{
                            width: "100%",
                            padding: "13px",
                            borderRadius: "12px",
                            border: "none",
                            cursor: loading ? "not-allowed" : "pointer",
                            background: loading ? "#f3e8ff" : "linear-gradient(135deg, #820ad1, #6b21a8)",
                            color: loading ? "#820ad1" : "#fff",
                            fontSize: "15px",
                            fontWeight: 600,
                            letterSpacing: "0.01em",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            transition: "opacity 0.2s, transform 0.15s",
                            position: "relative",
                            overflow: "hidden",
                            marginTop: "4px",
                          }}
                          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = "0.92"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                        >
                          {loading ? (
                            <>
                              <Spinner />
                              Sending…
                            </>
                          ) : (
                            <>
                              Send Message
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                              </svg>
                            </>
                          )}
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── FLOATING INPUT ─── */

type FloatingInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

function FloatingInput({ label, value, onChange, error }: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div style={{ position: "relative" }}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          border: `1.5px solid ${error ? "#fca5a5" : focused ? "#a65de0" : "#e5e7eb"}`,
          borderRadius: "12px",
          padding: "20px 14px 8px",
          fontSize: "14.5px",
          color: "#111827",
          outline: "none",
          background: focused ? "#fbf7ff" : "#fafafa",
          transition: "border-color 0.2s, background 0.2s",
          boxShadow: focused ? "0 0 0 3px rgba(20,184,166,0.12)" : "none",
        }}
      />
      <label
        style={{
          position: "absolute",
          left: "14px",
          top: lifted ? "7px" : "50%",
          transform: lifted ? "none" : "translateY(-50%)",
          fontSize: lifted ? "11px" : "14px",
          fontWeight: lifted ? 500 : 400,
          color: error ? "#f87171" : lifted ? "#820ad1" : "#9ca3af",
          pointerEvents: "none",
          transition: "all 0.18s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {label}
      </label>
      {error && (
        <p style={{ fontSize: "11.5px", color: "#f87171", marginTop: "4px", paddingLeft: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── FLOATING TEXTAREA ─── */

type FloatingTextareaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

function FloatingTextarea({ label, value, onChange, error }: FloatingTextareaProps) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div style={{ position: "relative" }}>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          border: `1.5px solid ${error ? "#fca5a5" : focused ? "#a65de0" : "#e5e7eb"}`,
          borderRadius: "12px",
          padding: "22px 14px 10px",
          fontSize: "14.5px",
          color: "#111827",
          outline: "none",
          resize: "none",
          background: focused ? "#fbf7ff" : "#fafafa",
          transition: "border-color 0.2s, background 0.2s",
          boxShadow: focused ? "0 0 0 3px rgba(20,184,166,0.12)" : "none",
          fontFamily: "inherit",
        }}
      />
      <label
        style={{
          position: "absolute",
          left: "14px",
          top: lifted ? "7px" : "18px",
          fontSize: lifted ? "11px" : "14px",
          fontWeight: lifted ? 500 : 400,
          color: error ? "#f87171" : lifted ? "#820ad1" : "#9ca3af",
          pointerEvents: "none",
          transition: "all 0.18s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {label}
      </label>
      {error && (
        <p style={{ fontSize: "11.5px", color: "#f87171", marginTop: "4px", paddingLeft: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── SPINNER ─── */

function Spinner() {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#820ad1" strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: "spin 0.75s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2a10 10 0 1 0 10 10" />
    </svg>
  );
}

