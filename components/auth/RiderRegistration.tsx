"use client";

import { useState } from "react";
import { ZONES, LANGUAGES, t } from "@/lib/data/types";
import { registerRider } from "@/lib/supabase";
import { sendWelcomeEmail } from "@/lib/emailjs";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface Props {
  email: string;
  mobile: string;
  language: string;
  onComplete: (name: string) => void;
  onBack: () => void;
}

const VEHICLES = [
  { id: "bike",    label: "Motorcycle", sub: "100cc+" },
  { id: "scooter", label: "Scooter",    sub: "Activa, Dio, etc." },
  { id: "ev",      label: "Electric",   sub: "EV two-wheeler" },
  { id: "cycle",   label: "Bicycle",    sub: "Short distance" },
] as const;

export default function RiderRegistration({ email, mobile, language, onComplete, onBack }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState(
    email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase())
  );
  const [zone, setZone] = useState(ZONES[0]);
  const [vehicle, setVehicle] = useState<typeof VEHICLES[number]["id"]>("bike");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    const { error } = await registerRider({
      name: name.trim(), email, mobile, zone,
      vehicle_type: vehicle, language,
    });

    if (error && error.code !== "23505") {
      setErrors({ submit: "Registration failed. Please try again." });
      setLoading(false);
      return;
    }

    // Fire welcome email — don't block on it
    sendWelcomeEmail({ to_name: name.trim(), to_email: email, role: "Rider", zone });

    setLoading(false);
    setDone(true);
    setTimeout(() => onComplete(name.trim()), 1200);
  }

  if (done) return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-[#F0FDF4] border-2 border-[#059669] flex items-center justify-center mx-auto mb-4">
          <Check size={24} className="text-[#059669]" />
        </div>
        <h2 className="text-[20px] font-semibold text-gray-900 mb-1">You're registered</h2>
        <p className="text-[14px] text-gray-500">Check your email. Setting up your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-gray-100">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-900 cursor-pointer transition-colors">
          <ChevronLeft size={15} /> Back
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#059669] rounded-md flex items-center justify-center">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M8 1L10.5 6H15L11.5 9.5L13 15L8 12L3 15L4.5 9.5L1 6H5.5L8 1Z" fill="white"/></svg>
          </div>
          <span className="text-[14px] font-semibold text-gray-900">GigShift</span>
        </div>
        <div className="flex items-center gap-1.5">
          {([1,2,3] as const).map(s => (
            <div key={s} className={`w-5 h-1 rounded-full transition-colors ${step >= s ? "bg-[#059669]" : "bg-gray-200"}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 sm:px-8 py-10">
        <div className="w-full max-w-sm">

          {step === 1 && (
            <div className="gs-fade-in">
              <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight mb-1">What's your name?</h1>
              <p className="text-[14px] text-gray-500 mb-7">This will appear on your rider profile.</p>
              <div className="mb-4">
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Full name</label>
                <input type="text" value={name} onChange={e => { setName(e.target.value); setErrors({}); }}
                  placeholder="Ravi Kumar" autoFocus
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-[14px] text-gray-900 outline-none transition-colors ${errors.name ? "border-red-400" : "border-gray-300 focus:border-[#059669]"}`}
                />
                {errors.name && <p className="text-red-500 text-[12px] mt-1">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="rounded-lg border border-gray-200 px-3 py-2.5">
                  <div className="text-[10px] text-gray-400 mb-0.5">Email</div>
                  <div className="text-[12px] text-gray-600 truncate">{email}</div>
                </div>
                <div className="rounded-lg border border-gray-200 px-3 py-2.5">
                  <div className="text-[10px] text-gray-400 mb-0.5">Mobile</div>
                  <div className="text-[12px] text-gray-600">+91 {mobile}</div>
                </div>
              </div>
              <button onClick={() => { if (!name.trim()) { setErrors({ name: "Enter your full name" }); return; } setStep(2); }}
                className="w-full py-2.5 rounded-lg bg-[#059669] text-white text-[14px] font-semibold cursor-pointer hover:bg-[#047857] transition-colors flex items-center justify-center gap-2">
                Continue <ChevronRight size={15} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="gs-fade-in">
              <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight mb-1">Your work zone</h1>
              <p className="text-[14px] text-gray-500 mb-7">Where will you primarily deliver?</p>
              <div className="mb-5">
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Preferred zone</label>
                <div className="grid grid-cols-2 gap-2">
                  {ZONES.map(z => (
                    <button key={z} onClick={() => setZone(z)}
                      className={`py-2.5 px-3 rounded-lg border text-[13px] text-left cursor-pointer transition-all ${
                        zone === z ? "border-[#059669] bg-[#F0FDF4] text-[#059669] font-medium" : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}>
                      {z}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Vehicle type</label>
                <div className="grid grid-cols-2 gap-2">
                  {VEHICLES.map(v => (
                    <button key={v.id} onClick={() => setVehicle(v.id)}
                      className={`py-3 px-3 rounded-lg border text-left cursor-pointer transition-all ${
                        vehicle === v.id ? "border-[#059669] bg-[#F0FDF4]" : "border-gray-200 hover:border-gray-300"
                      }`}>
                      <div className={`text-[13px] font-semibold ${vehicle === v.id ? "text-[#059669]" : "text-gray-800"}`}>{v.label}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{v.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 cursor-pointer hover:bg-gray-50">Back</button>
                <button onClick={() => setStep(3)} className="flex-1 py-2.5 rounded-lg bg-[#059669] text-white text-[13px] font-semibold cursor-pointer hover:bg-[#047857] transition-colors flex items-center justify-center gap-2">
                  Continue <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="gs-fade-in">
              <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight mb-1">Confirm your details</h1>
              <p className="text-[14px] text-gray-500 mb-7">Review before we create your account.</p>
              <div className="rounded-xl border border-gray-200 overflow-hidden mb-6">
                {[
                  { label: "Name",     value: name },
                  { label: "Email",    value: email },
                  { label: "Mobile",   value: "+91 " + mobile },
                  { label: "Zone",     value: zone },
                  { label: "Vehicle",  value: VEHICLES.find(v => v.id === vehicle)?.label ?? vehicle },
                  { label: "Language", value: LANGUAGES.find(l => l.code === language)?.label ?? language },
                ].map((row, i, arr) => (
                  <div key={row.label} className={`flex items-center justify-between px-4 py-3 ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}>
                    <span className="text-[12px] text-gray-500">{row.label}</span>
                    <span className="text-[13px] font-medium text-gray-900 truncate ml-4 max-w-[200px] text-right">{row.value}</span>
                  </div>
                ))}
              </div>
              {errors.submit && <p className="text-red-500 text-[13px] mb-3 text-center">{errors.submit}</p>}
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 cursor-pointer hover:bg-gray-50">Back</button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 py-2.5 rounded-lg bg-[#059669] text-white text-[13px] font-semibold cursor-pointer hover:bg-[#047857] transition-colors disabled:opacity-60">
                  {loading ? "Creating..." : "Create account"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
