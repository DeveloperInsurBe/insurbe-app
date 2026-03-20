"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function SignaturePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { id } = useParams();
  const router = useRouter();

  const [hasDrawn, setHasDrawn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const isDrawing = useRef(false);

  const getCtx = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#7c3aed";
    return { canvas, ctx };
  };

  const getPos = (canvas: HTMLCanvasElement, clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDraw = (e: React.MouseEvent) => {
    isDrawing.current = true;
    const { canvas, ctx } = getCtx();
    const { x, y } = getPos(canvas, e.clientX, e.clientY);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const endDraw = () => {
    isDrawing.current = false;
    const { ctx } = getCtx();
    ctx.beginPath();
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing.current) return;
    const { canvas, ctx } = getCtx();
    const { x, y } = getPos(canvas, e.clientX, e.clientY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    setHasDrawn(true);
  };

  const startDrawTouch = (e: React.TouchEvent) => {
    e.preventDefault();
    isDrawing.current = true;
    const touch = e.touches[0];
    const { canvas, ctx } = getCtx();
    const { x, y } = getPos(canvas, touch.clientX, touch.clientY);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawTouch = (e: React.TouchEvent) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const { canvas, ctx } = getCtx();
    const { x, y } = getPos(canvas, touch.clientX, touch.clientY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    setHasDrawn(true);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const canvas = canvasRef.current!;
    const base64 = canvas.toDataURL("image/png");
    await fetch(`/api/application/${id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signature: base64 }),
    });
    setSaved(true);
    setTimeout(() => router.push("/dashboard"), 900);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background orbs */}
      <motion.div
        className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-violet-400/10 blur-[100px] pointer-events-none"
        animate={{ scale: [1, 1.1, 1], x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-100px] right-[-80px] w-[350px] h-[350px] rounded-full bg-pink-400/10 blur-[100px] pointer-events-none"
        animate={{ scale: [1, 1.08, 1], x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl overflow-hidden shadow-xl shadow-black/[0.06]">

          {/* Top bar */}
          <div className="bg-black/[0.02] border-b border-black/[0.06] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-1.5 rounded-full w-3 bg-violet-400/60" />
              ))}
            </div>
            <span className="text-xs text-black/30 font-medium tracking-widest uppercase">Final Step</span>
          </div>

          <div className="px-6 pt-7 pb-8">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
                <span className="text-violet-700 text-[10px] font-semibold tracking-[0.12em] uppercase">Signature</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Draw Your Signature</h1>
              <p className="text-sm text-slate-500 mt-1 font-light">
                Sign in the box below using your mouse or finger.
              </p>
            </motion.div>

            {/* Canvas area */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mb-4"
            >
              {/* Canvas wrapper */}
              <motion.div
                animate={hasDrawn
                  ? { borderColor: "rgba(139,92,246,0.4)", boxShadow: "0 0 0 3px rgba(139,92,246,0.08), 0 0 30px rgba(139,92,246,0.05)" }
                  : { borderColor: "rgba(0,0,0,0.1)", boxShadow: "none" }
                }
                transition={{ duration: 0.25 }}
                className="relative rounded-xl border-2 border-dashed overflow-hidden bg-slate-50"
              >
                {/* Placeholder hint */}
                <AnimatePresence>
                  {!hasDrawn && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-2"
                    >
                      <svg className="w-7 h-7 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                      </svg>
                      <p className="text-slate-300 text-xs font-light">Sign here</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Baseline */}
                <div className="absolute bottom-[28px] left-8 right-8 h-px bg-black/[0.06]" />
                <p className="absolute bottom-[10px] left-8 text-[10px] text-slate-400 font-light">Signature</p>

                <canvas
                  ref={canvasRef}
                  width={520}
                  height={180}
                  className="w-full touch-none"
                  style={{ display: "block", cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cline x1='12' y1='2' x2='12' y2='22' stroke='%23334155' stroke-width='1.5'/%3E%3Cline x1='2' y1='12' x2='22' y2='12' stroke='%23334155' stroke-width='1.5'/%3E%3Ccircle cx='12' cy='12' r='2' fill='none' stroke='%23334155' stroke-width='1.5'/%3E%3C/svg%3E") 12 12, crosshair` }}
                  onMouseDown={startDraw}
                  onMouseUp={endDraw}
                  onMouseLeave={endDraw}
                  onMouseMove={draw}
                  onTouchStart={startDrawTouch}
                  onTouchEnd={endDraw}
                  onTouchMove={drawTouch}
                />
              </motion.div>

              {/* Clear button */}
              <div className="flex justify-end mt-2">
                <motion.button
                  onClick={clearCanvas}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-600 transition-colors duration-150 px-2 py-1 rounded-lg hover:bg-black/[0.04]"
                >
                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Clear signature
                </motion.button>
              </div>
            </motion.div>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="h-px bg-gradient-to-r from-transparent via-black/10 to-transparent mb-5 origin-left"
            />

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.button
                onClick={handleSubmit}
                disabled={!hasDrawn || loading || saved}
                whileHover={hasDrawn && !loading && !saved ? { y: -2, scale: 1.01 } : {}}
                whileTap={hasDrawn && !loading && !saved ? { scale: 0.98 } : {}}
                className="w-full relative overflow-hidden rounded-xl py-3.5 font-semibold text-sm text-white bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-200 disabled:opacity-40 disabled:cursor-not-allowed transition-shadow hover:shadow-violet-300 hover:shadow-xl"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <AnimatePresence mode="wait">
                    {loading && !saved ? (
                      <motion.span key="loading" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Submitting…
                      </motion.span>
                    ) : saved ? (
                      <motion.span key="saved" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} className="flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Submitted! Redirecting…
                      </motion.span>
                    ) : (
                      <motion.span key="idle" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex items-center gap-1.5">
                        Submit Application →
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </motion.button>

              {!hasDrawn && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-[11px] text-amber-600/60 mt-2"
                >
                  Please draw your signature before submitting
                </motion.p>
              )}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center text-[11px] text-black/25 mt-4"
            >
              🔒 Your signature is encrypted and legally binding
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}