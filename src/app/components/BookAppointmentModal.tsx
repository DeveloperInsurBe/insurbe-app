// components/BookAppointmentModal.tsx
"use client";
import React, { useState } from "react";

interface BookAppointmentModalProps {
  open: boolean;
  onClose: () => void;
}

export default function BookAppointmentModal({ open, onClose }: BookAppointmentModalProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const handleSubmit = () => {
    if (!email || !phone) return alert("Please fill all fields");

    setSubmitted(true);

    // You can send this to backend later
    // fetch("/api/bookAppointment", { method: "POST", body: JSON.stringify({email, phone}) })

    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setEmail("");
      setPhone("");
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-xl">

        {!submitted ? (
          <>
            <h2 className="text-xl font-semibold text-center mb-4">Book an Appointment</h2>

            {/* Email */}
            <label className="block mb-3">
              <span className="text-sm text-gray-600">Email</span>
              <input
                type="email"
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </label>

            {/* Phone */}
            <label className="block mb-4">
              <span className="text-sm text-gray-600">Phone Number</span>
              <input
                type="tel"
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
              />
            </label>

            {/* Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-primary text-white"
              >
                Submit
              </button>
            </div>
          </>
        ) : (
          <h3 className="text-center text-green-600 text-lg font-medium">
            Thank you! We will connect you shortly.
          </h3>
        )}
      </div>
    </div>
  );
}
