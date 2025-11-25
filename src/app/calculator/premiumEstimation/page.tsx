"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { usePremiumStore } from "@/app/stores/premiumStore";
import Image from "next/image";

export default function PremiumEstimationPage() {
  const router = useRouter();
  const { form, setForm } = usePremiumStore();

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentEmail, setAppointmentEmail] = useState("");
  const [appointmentPhone, setAppointmentPhone] = useState("");
  const [appointmentError, setAppointmentError] = useState("");

  // Set default values on component mount if form is empty
  React.useEffect(() => {
    if (!form.firstName && !form.lastName) {
      const today = new Date();
      const coverageStartDate = today.toISOString().split("T")[0];

      const dobDate = new Date();
      dobDate.setFullYear(dobDate.getFullYear() - 30);
      const defaultDob = dobDate.toISOString().split("T")[0];

      setForm({
        title: "Mr",
        firstName: "Max",
        lastName: "Mustermann",
        dob: defaultDob,
        age: "30",
        gender: "Male",
        coverageStart: coverageStartDate,
        employmentStatus: "Student",
        planNameVersion: "MAWISTA Expat",
        hasSchengenVisa: "yes",
      });
    }
  }, [form.firstName, form.lastName, setForm]);

  function calculateAge(dateString: string) {
    if (!dateString) return "";
    const today = new Date();
    const dob = new Date(dateString);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  }

  // Handle appointment booking
  const handleBookAppointment = () => {
    // Validate email and phone
    if (!appointmentEmail || !appointmentPhone) {
      setAppointmentError("Both email and phone number are required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(appointmentEmail)) {
      setAppointmentError("Please enter a valid email address");
      return;
    }

    // Basic phone validation (at least 10 digits)
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(appointmentPhone)) {
      setAppointmentError("Please enter a valid phone number");
      return;
    }

    // TODO: Send appointment data to backend
    console.log("Appointment booked:", {
      email: appointmentEmail,
      phone: appointmentPhone,
      customerInfo: form,
    });

    // Show success message
    alert("Appointment request submitted! We will contact you shortly.");

    // Close modal and reset
    setShowAppointmentModal(false);
    setAppointmentEmail("");
    setAppointmentPhone("");
    setAppointmentError("");
  };

  // Handle proceed to application
  const handleProceedToApplication = () => {
    // Validate required fields
    if (!form.firstName || !form.lastName || !form.dob || !form.gender) {
      alert("Please fill in all required fields before proceeding");
      return;
    }

    router.push("/calculator/submitApplication");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full h-40 bg-primary relative flex items-center justify-center">
        {/* Left Image */}
        <div className="absolute left-0 h-full flex items-center">
          <Image
            src="/icons/leftside.svg"
            alt="Left Decoration"
            width={100}
            height={100}
            className="object-cover h-full"
          />
        </div>

        {/* Center Text */}
        <div className="text-center">
          <span className="inline-block bg-white/20 rounded-full px-4 py-1 mb-2 text-sm font-medium text-white">
            Health Prioritized
          </span>
          <h1 className="text-3xl font-bold text-white">
            Get a Premium Estimation
          </h1>
          <p className="text-center text-sm text-gray-400 mb-6">
            Enter your basic details to calculate your premium for MAWISTA Expat
          </p>
        </div>

        {/* Right Image */}
        <div className="absolute right-0 h-full flex items-center">
          <Image
            src="/icons/rightside.svg"
            alt="Right Decoration"
            width={100}
            height={100}
            className="object-cover h-full"
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6 mt-4">
        <a
          className="text-sm text-gray-600 hover:underline cursor-pointer mb-4"
          onClick={() => router.back()}
        >
          ← Back to Plans
        </a>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Title */}
          <label className="space-y-1">
            <div className="text-sm text-gray-600">Title *</div>
            <select
              value={form.title}
              onChange={(e) => setForm({ title: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select title</option>
              <option>Mr</option>
              <option>Mrs</option>
              <option>Ms</option>
              <option>Dr</option>
            </select>
          </label>

          {/* First Name */}
          <label className="space-y-1">
            <div className="text-sm text-gray-600">First Name *</div>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.firstName}
              onChange={(e) => setForm({ firstName: e.target.value })}
              placeholder="First name"
            />
          </label>

          {/* Last Name */}
          <label className="space-y-1">
            <div className="text-sm text-gray-600">Last Name *</div>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.lastName}
              onChange={(e) => setForm({ lastName: e.target.value })}
              placeholder="Last name"
            />
          </label>

          {/* DOB */}
          <label className="space-y-1">
            <div className="text-sm text-gray-600">Date of Birth *</div>
            <input
              onChange={(e) => {
                const value = e.target.value;
                setForm({
                  dob: value,
                  age: calculateAge(value).toString(),
                });
              }}
              type="date"
              className="w-full border rounded px-3 py-2"
              value={form.dob}
              max={new Date().toISOString().split("T")[0]}
            />
          </label>

          {/* Gender */}
          <label className="space-y-1">
            <div className="text-sm text-gray-600">Gender *</div>
            <select
              value={form.gender}
              onChange={(e) => setForm({ gender: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </label>

          {/* Coverage Start */}
          <label className="space-y-1">
            <div className="text-sm text-gray-600">Coverage Start Date *</div>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={form.coverageStart}
              onChange={(e) => setForm({ coverageStart: e.target.value })}
              min={new Date().toISOString().split("T")[0]}
            />
          </label>

          {/* Employment Status */}
          <div className="md:col-span-2 border border-primary/40 bg-primary/10 rounded-lg p-8">
            <div className="text-md text-gray-800 mb-2">Employment Status</div>
            <div className="flex gap-3">
              {["Student", "Freelancer/ Self-employed", "Insolder"].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setForm({ employmentStatus: val })}
                  className={`px-3 py-1 rounded-md border transition-all ${
                    form.employmentStatus === val
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Plan Name & Version */}
          <div className="md:col-span-1">
            <div className="text-sm text-gray-600">Plan Name & Version</div>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.planNameVersion}
              onChange={(e) => setForm({ planNameVersion: e.target.value })}
              placeholder="MAWISTA Expat"
            />
          </div>

          {/* Age */}
          <div className="md:col-span-1">
            <div className="text-sm text-gray-600">Age (in years)</div>
            <input
              className="w-full border rounded px-3 py-2 bg-gray-100"
              value={form.age || "1"}
              readOnly
            />
          </div>

          {/* Schengen Visa */}
          <div className="md:col-span-2">
            <div className="text-sm text-gray-600 mb-2">
              Do you have Schengen Visa?
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForm({ hasSchengenVisa: "yes" })}
                className={`px-3 py-1 rounded-md border ${
                  form.hasSchengenVisa === "yes" ? "bg-primary text-white" : ""
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setForm({ hasSchengenVisa: "no" })}
                className={`px-3 py-1 rounded-md border ${
                  form.hasSchengenVisa === "no" ? "bg-primary text-white" : ""
                }`}
              >
                No
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center mt-6 mb-6">
          <button
            onClick={handleProceedToApplication}
            className="px-6 py-3 rounded-full bg-primary text-white cursor-pointer font-semibold hover:bg-primary/90 transition"
          >
            Proceed to Application
          </button>
          <button
            onClick={() => setShowAppointmentModal(true)}
            className="px-6 py-3 rounded-full border-2 cursor-pointer border-primary text-primary font-semibold hover:bg-primary/10 transition"
          >
            Book an Appointment
          </button>
        </div>
      </div>

      {/* Book Appointment Modal */}
      {showAppointmentModal && (
        <>
          {/* Backdrop with Blur */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => {
              setShowAppointmentModal(false);
              setAppointmentError("");
            }}
          />

          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 z-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Book an Appointment
            </h2>
            <p className="text-gray-600 mb-6">
              Our team will contact you to schedule a consultation
            </p>

            {appointmentError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {appointmentError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="your.email@example.com"
                  value={appointmentEmail}
                  onChange={(e) => {
                    setAppointmentEmail(e.target.value);
                    setAppointmentError("");
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="+49 123 456 7890"
                  value={appointmentPhone}
                  onChange={(e) => {
                    setAppointmentPhone(e.target.value);
                    setAppointmentError("");
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAppointmentModal(false);
                  setAppointmentError("");
                  setAppointmentEmail("");
                  setAppointmentPhone("");
                }}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBookAppointment}
                className="flex-1 px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition"
              >
                Submit
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
