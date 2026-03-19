"use client";

import { useRef } from "react";
import { useParams, useRouter } from "next/navigation";

export default function SignaturePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { id } = useParams();
  const router = useRouter();

  let drawing = false;

  const startDraw = () => (drawing = true);
  const endDraw = () => (drawing = false);

  const draw = (e: any) => {
    if (!drawing) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    const rect = canvas.getBoundingClientRect();

    ctx.lineTo(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
  };

  const handleSubmit = async () => {
    const canvas = canvasRef.current!;
    const base64 = canvas.toDataURL("image/png");

    await fetch(`/api/application/${id}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ signature: base64 }),
    });

    router.push("/dashboard");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        Draw Your Signature
      </h1>

      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        className="border"
        onMouseDown={startDraw}
        onMouseUp={endDraw}
        onMouseMove={draw}
      />

      <button
        onClick={handleSubmit}
        className="mt-4 px-6 py-2 bg-purple-600 text-white"
      >
        Submit Application
      </button>
    </div>
  );
}