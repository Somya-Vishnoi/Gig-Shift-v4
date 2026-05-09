"use client";

import { useState } from "react";
import type { Role } from "@/lib/data/types";
import { LANGUAGES, t } from "@/lib/data/types";

interface Props {
  onAuth: (role: Role, name: string, email: string, mobile: string, language: string) => void;
}

const ADMIN_EMAIL = "admin@gigshift.in";

function validateEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
}
function validateMobile(m: string) {
  return /^[6-9]\d{9}$/.test(m.replace(/\s/g, ""));
}

export default function LoginScreen({ onAuth }: Props) {
  const [lang, setLang] = useState("en");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState<"rider" | "platform" | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = email.trim().toLowerCase() === ADMIN_EMAIL;

  function handleSubmit() {
    const errs: Record<string, string> = {};
    if (!validateEmail(email)) errs.email = t(lang, "emailError");
    if (!validateMobile(mobile)) errs.mobile = t(lang, "mobileError");
    if (!isAdmin && !role) errs.role = t(lang, "roleError");
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const finalRole: Role = isAdmin ? "admin" : role!;
    const name = email.split("@")[0]
      .replace(/[._\-]/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim();

    setSubmitting(true);
    setTimeout(() => onAuth(finalRole, name, email.trim(), mobile.trim(), lang), 400);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" onKeyDown={handleKeyDown}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#059669] rounded-lg flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L10.5 6H15L11.5 9.5L13 15L8 12L3 15L4.5 9.5L1 6H5.5L8 1Z" fill="white"/>
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-gray-900">GigShift</span>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`px-3 py-1.5 rounded-md text-[12px] cursor-pointer transition-all ${
                lang === l.code
                  ? "bg-gray-900 text-white font-medium"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Left — form */}
        <div className="flex-1 flex items-center justify-center px-8 py-16">
          <div className="w-full max-w-sm">
            <div className="mb-10">
              <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight mb-2">
                {isAdmin ? t(lang, "adminDetected") : "Sign in"}
              </h1>
              <p className="text-[14px] text-gray-500">{t(lang, "tagline")}</p>
            </div>

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">
                  {t(lang, "emailLabel")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setErrors(p => ({ ...p, email: "" }));
                  }}
                  placeholder="name@company.com"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-[14px] text-gray-900 placeholder-gray-400 outline-none transition-colors bg-white ${
                    errors.email
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-300 focus:border-[#059669]"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-[12px] mt-1">{errors.email}</p>
                )}
                {isAdmin && !errors.email && (
                  <p className="text-[#059669] text-[12px] mt-1 font-medium">
                    Admin access unlocked
                  </p>
                )}
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">
                  {t(lang, "mobileLabel")}
                </label>
                <div className="flex gap-2">
                  <div className={`flex items-center px-3 rounded-lg border text-[14px] text-gray-500 bg-gray-50 shrink-0 ${
                    errors.mobile ? "border-red-400" : "border-gray-300"
                  }`}>
                    +91
                  </div>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={e => {
                      setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                      setErrors(p => ({ ...p, mobile: "" }));
                    }}
                    placeholder="98765 43210"
                    className={`flex-1 px-3.5 py-2.5 rounded-lg border text-[14px] text-gray-900 placeholder-gray-400 outline-none transition-colors bg-white ${
                      errors.mobile
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-300 focus:border-[#059669]"
                    }`}
                  />
                </div>
                {errors.mobile && (
                  <p className="text-red-500 text-[12px] mt-1">{errors.mobile}</p>
                )}
              </div>

              {/* Role selector — hidden for admin */}
              {!isAdmin && (
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1.5">
                    {t(lang, "roleLabel")}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["rider", "platform"] as const).map(r => (
                      <button
                        key={r}
                        onClick={() => {
                          setRole(r);
                          setErrors(p => ({ ...p, role: "" }));
                        }}
                        className={`py-3 px-4 rounded-lg border text-[13px] font-medium cursor-pointer transition-all text-left ${
                          role === r
                            ? "border-[#059669] bg-[#F0FDF4] text-[#059669]"
                            : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="font-semibold mb-0.5">
                          {r === "rider" ? t(lang, "roleRider") : t(lang, "rolePlatform")}
                        </div>
                        <div className={`text-[11px] font-normal ${role === r ? "text-[#059669]/70" : "text-gray-400"}`}>
                          {r === "rider" ? "Delivery partner" : "Ops & dispatch"}
                        </div>
                      </button>
                    ))}
                  </div>
                  {errors.role && (
                    <p className="text-red-500 text-[12px] mt-1">{errors.role}</p>
                  )}
                </div>
              )}

              {/* Admin info panel */}
              {isAdmin && (
                <div className="p-3.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0]">
                  <div className="text-[13px] font-semibold text-[#059669] mb-0.5">
                    GigShift Admin Console
                  </div>
                  <div className="text-[12px] text-[#047857]">
                    Full access — riders, platforms, live dispatch, analytics
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-2.5 rounded-lg bg-[#059669] text-white text-[14px] font-semibold cursor-pointer hover:bg-[#047857] active:scale-[0.99] transition-all disabled:opacity-60 mt-2"
              >
                {submitting ? t(lang, "loading") : t(lang, "continueBtn")}
              </button>
            </div>

            <p className="text-[11px] text-gray-400 text-center mt-6">
              By continuing, you agree to GigShift's Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* Right — visual panel (desktop only) */}
        <div className="hidden lg:flex flex-1 bg-gray-50 border-l border-gray-100 items-center justify-center p-16">
          <div className="max-w-xs">
            <div className="space-y-4 mb-10">
              {[
                { label: "Active Riders", value: "2,847", delta: "+12% today" },
                { label: "Orders Fulfilled", value: "94.2%", delta: "SLA rate" },
                { label: "Avg. Dispatch Time", value: "4.3 min", delta: "-0.8 from yesterday" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                  <div>
                    <div className="text-[12px] text-gray-500 mb-0.5">{item.label}</div>
                    <div className="text-[22px] font-semibold text-gray-900 tracking-tight">{item.value}</div>
                  </div>
                  <div className="text-[11px] text-[#059669] font-medium">{item.delta}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#059669] gs-pulse-dot" />
              <span className="text-[12px] text-gray-400">Live data · Updated every 4s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
