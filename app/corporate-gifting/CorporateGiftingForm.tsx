"use client";

import React, { useState } from "react";

export default function CorporateGiftingForm() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    estimatedQuantity: "",
    customizationDetails: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    // Basic Validation
    if (!formData.companyName.trim() || !formData.contactName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMsg("Please fill out all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/corporate-gifting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: formData.companyName,
          contactName: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          estimatedQuantity: formData.estimatedQuantity ? parseInt(formData.estimatedQuantity) : null,
          customizationDetails: formData.customizationDetails || null,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setSuccess(true);
      setFormData({
        companyName: "",
        contactName: "",
        email: "",
        phone: "",
        estimatedQuantity: "",
        customizationDetails: "",
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Unable to submit lead.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello HUME Fragrance, I just submitted a Corporate Gifting inquiry for my company. Please connect me with a relationship manager.`
  );

  if (success) {
    return (
      <div className="text-center py-8 px-4 animate-fade-in">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 mb-6 border border-emerald-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h4 className="font-serif text-2xl font-light text-foreground mb-3">Inquiry Received</h4>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-sm mx-auto">
          Thank you for choosing HUME. Your inquiry has been saved. Our corporate relationship team will reach out via email/phone within 2 hours. For immediate assistance, feel free to contact us on WhatsApp.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row justify-center">
          <a
            href={`https://wa.me/919559024822?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center bg-[#25D366] px-6 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#20ba59]"
          >
            Chat on WhatsApp
          </a>
          <button
            onClick={() => setSuccess(false)}
            className="inline-flex h-11 items-center justify-center border border-zinc-200 bg-white px-6 text-xs font-semibold uppercase tracking-wider text-foreground transition hover:bg-zinc-50"
          >
            Submit Another Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Company Name Field */}
      <div className="group relative">
        <label
          htmlFor="companyName"
          className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500 mb-2 transition-colors duration-300 group-focus-within:text-amber-800"
        >
          Company Name <span className="text-amber-600 font-bold">*</span>
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-stone-400 group-focus-within:text-amber-700 transition-colors duration-300 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
              />
            </svg>
          </div>
          <input
            type="text"
            id="companyName"
            name="companyName"
            required
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Acme Corporation"
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-stone-200/90 bg-[#FAF9F5]/60 hover:bg-white hover:border-stone-300/90 focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 placeholder:text-stone-400/80 placeholder:font-light text-stone-800 text-sm outline-none transition-all duration-300 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.015)] focus:shadow-[0_4px_20px_rgba(180,83,9,0.05)]"
          />
        </div>
      </div>

      {/* Row for Contact & Phone */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="group relative">
          <label
            htmlFor="contactName"
            className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500 mb-2 transition-colors duration-300 group-focus-within:text-amber-800"
          >
            Contact Name <span className="text-amber-600 font-bold">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-stone-400 group-focus-within:text-amber-700 transition-colors duration-300 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </div>
            <input
              type="text"
              id="contactName"
              name="contactName"
              required
              value={formData.contactName}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-stone-200/90 bg-[#FAF9F5]/60 hover:bg-white hover:border-stone-300/90 focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 placeholder:text-stone-400/80 placeholder:font-light text-stone-800 text-sm outline-none transition-all duration-300 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.015)] focus:shadow-[0_4px_20px_rgba(180,83,9,0.05)]"
            />
          </div>
        </div>

        <div className="group relative">
          <label
            htmlFor="phone"
            className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500 mb-2 transition-colors duration-300 group-focus-within:text-amber-800"
          >
            Phone Number <span className="text-amber-600 font-bold">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-stone-400 group-focus-within:text-amber-700 transition-colors duration-300 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.802-5.194-4.174-7-7l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                />
              </svg>
            </div>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="9876543210"
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-stone-200/90 bg-[#FAF9F5]/60 hover:bg-white hover:border-stone-300/90 focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 placeholder:text-stone-400/80 placeholder:font-light text-stone-800 text-sm outline-none transition-all duration-300 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.015)] focus:shadow-[0_4px_20px_rgba(180,83,9,0.05)]"
            />
          </div>
        </div>
      </div>

      {/* Row for Email & Quantity */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="group relative">
          <label
            htmlFor="email"
            className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500 mb-2 transition-colors duration-300 group-focus-within:text-amber-800"
          >
            Work Email <span className="text-amber-600 font-bold">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-stone-400 group-focus-within:text-amber-700 transition-colors duration-300 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="corporate@acme.com"
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-stone-200/90 bg-[#FAF9F5]/60 hover:bg-white hover:border-stone-300/90 focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 placeholder:text-stone-400/80 placeholder:font-light text-stone-800 text-sm outline-none transition-all duration-300 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.015)] focus:shadow-[0_4px_20px_rgba(180,83,9,0.05)]"
            />
          </div>
        </div>

        <div className="group relative">
          <label
            htmlFor="estimatedQuantity"
            className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500 mb-2 transition-colors duration-300 group-focus-within:text-amber-800"
          >
            Estimated Quantity (units)
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-stone-400 group-focus-within:text-amber-700 transition-colors duration-300 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                />
              </svg>
            </div>
            <input
              type="number"
              id="estimatedQuantity"
              name="estimatedQuantity"
              value={formData.estimatedQuantity}
              onChange={handleChange}
              placeholder="50"
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-stone-200/90 bg-[#FAF9F5]/60 hover:bg-white hover:border-stone-300/90 focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 placeholder:text-stone-400/80 placeholder:font-light text-stone-800 text-sm outline-none transition-all duration-300 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.015)] focus:shadow-[0_4px_20px_rgba(180,83,9,0.05)]"
            />
          </div>
        </div>
      </div>

      {/* Customization Details */}
      <div className="group relative">
        <label
          htmlFor="customizationDetails"
          className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500 mb-2 transition-colors duration-300 group-focus-within:text-amber-800"
        >
          Customization & Branding Requirements
        </label>
        <div className="relative">
          <div className="absolute left-4 top-4 flex items-center justify-center text-stone-400 group-focus-within:text-amber-700 transition-colors duration-300 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.096L15 15l-5.187.904zM18 10.5l-.563 2.25L15 13.5l2.438.75.562 2.25.563-2.25L21 13.5l-2.438-.75-.562-2.25zM6 4.5l-.375 1.5L4 6.5l1.625.5L6 8.5l.375-1.5L8 6.5 6.375 6 6 4.5z"
              />
            </svg>
          </div>
          <textarea
            id="customizationDetails"
            name="customizationDetails"
            rows={4}
            value={formData.customizationDetails}
            onChange={handleChange}
            placeholder="Describe your logo engraving, custom sleeve print, ribbon color preferences, or fragrance notes..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200/90 bg-[#FAF9F5]/60 hover:bg-white hover:border-stone-300/90 focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 placeholder:text-stone-400/80 placeholder:font-light text-stone-800 text-sm outline-none transition-all duration-300 resize-none shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.015)] focus:shadow-[0_4px_20px_rgba(180,83,9,0.05)]"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="group w-full h-12 bg-[#15120f] hover:bg-[#b45309] text-white rounded-xl shadow-[0_4px_14px_rgba(21,18,15,0.15)] hover:shadow-[0_6px_20px_rgba(180,83,9,0.25)] transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-amber-500/20 disabled:opacity-65 text-xs font-semibold uppercase tracking-widest mt-2 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Submitting Inquiry...
          </>
        ) : (
          <>
            <span>Submit Inquiry</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-3.5 h-3.5 ml-1 transition-transform duration-300 group-hover:translate-x-1"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}