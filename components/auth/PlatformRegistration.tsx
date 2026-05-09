"use client";

import { useState } from "react";
import { ZONES } from "@/lib/data/types";
import { registerPlatform } from "@/lib/supabase";
import { sendWelcomeEmail } from "@/lib/emailjs";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface Props {
  email: string;
  mobile: string;
  onComplete: (name: string) => void;
  onBack: () => void;
}

const VOLUMES = [
  "1–10 riders/day", "10–50 riders/day",
  "50–100 riders/day", "100–500 riders/day", "500+ riders/day",
];

export default function PlatformRegistration({ email, mobile, onComplete, onBack }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState(
    email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase())
  );
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [volume, setVolume] = useState(VOLUMES[1]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [employeeId, setEmployeeId] = useState('');

  function toggleZone(z: string) {
    setSelectedZones(p => p.includes(z) ? p.filter(x => x !== z) : [...p, z]);
  }

  async function handleSubmit() {
    setLoading(true);
    const { error, employee_id } = await registerPlatform({
      company_name: companyName.trim(), email, mobile,
      contact_name: contactName.trim(),
      expected_volume: volume, zones: selectedZones,
    });

    if (error && error.code !== "23505") {
      setErrors({ submit: "Registration failed. Please try again." });
      setLoading(false);
      return;
    }

    setEmployeeId(employee_id ?? '');
    sendWelcomeEmail({ to_name: contactName.trim(), to_email: email, role: "Platform", company: companyName.trim(), employee_id: employee_id });

    setLoading(false);
    setDone(true);
    setTimeout(() => onComplete(contactName.trim()), 1200);
  }

  if (done) return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-[#F0FDF4] border-2 border-[#059669] flex items-center justify-center mx-auto mb-4">
          <Check size={24} className="text-[#059669]" />
        </div>
        <h2 className="text-[20px] font-semibold text-gray-900 mb-1">Platform registered</h2>
        {employeeId && (
          <div className="mt-3 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200">
            <div className="text-[11px] text-gray-500 mb-0.5">Your GigShift ID — save this</div>
            <div className="text-[18px] font-bold text-gray-900 font-mono">{employeeId}</div>
          </div>
        )}
        <p className="text-[14px] text-gray-500 mt-2">Check your email. Setting up your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
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
              <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight mb-1">Company details</h1>
              <p className="text-[14px] text-gray-500 mb-7">Tell us about your platform.</p>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Company name</label>
                  <input type="text" value={companyName} onChange={e => { setCompanyName(e.target.value); setErrors({}); }}
                    placeholder="Swiggy, Zomato, Dunzo..." autoFocus
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-[14px] text-gray-900 outline-none transition-colors ${errors.company ? "border-red-400" : "border-gray-300 focus:border-[#059669]"}`}
                  />
                  {errors.company && <p className="text-red-500 text-[12px] mt-1">{errors.company}</p>}
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Your name</label>
                  <input type="text" value={contactName} onChange={e => setContactName(e.target.value)}
                    placeholder="Contact person"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-[#059669] text-[14px] text-gray-900 outline-none transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-gray-200 px-3 py-2.5">
                    <div className="text-[10px] text-gray-400 mb-0.5">Email</div>
                    <div className="text-[12px] text-gray-600 truncate">{email}</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 px-3 py-2.5">
                    <div className="text-[10px] text-gray-400 mb-0.5">Mobile</div>
                    <div className="text-[12px] text-gray-600">+91 {mobile}</div>
                  </div>
                </div>
              </div>
              <button onClick={() => {
                if (!companyName.trim()) { setErrors({ company: "Enter company name" }); return; }
                setStep(2);
              }} className="w-full py-2.5 rounded-lg bg-[#059669] text-white text-[14px] font-semibold cursor-pointer hover:bg-[#047857] transition-colors flex items-center justify-center gap-2">
                Continue <ChevronRight size={15} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="gs-fade-in">
              <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight mb-1">Coverage & volume</h1>
              <p className="text-[14px] text-gray-500 mb-7">Where do you need riders and how many?</p>
              <div className="mb-5">
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">
                  Operating zones <span className="text-gray-400 font-normal">(select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ZONES.map(z => {
                    const sel = selectedZones.includes(z);
                    return (
                      <button key={z} onClick={() => toggleZone(z)}
                        className={`py-2.5 px-3 rounded-lg border text-[13px] text-left cursor-pointer transition-all flex items-center justify-between ${
                          sel ? "border-[#059669] bg-[#F0FDF4] text-[#059669]" : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}>
                        <span>{z}</span>
                        {sel && <Check size={12} />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Expected rider volume</label>
                <div className="space-y-2">
                  {VOLUMES.map(v => (
                    <button key={v} onClick={() => setVolume(v)}
                      className={`w-full py-2.5 px-3.5 rounded-lg border text-[13px] text-left cursor-pointer transition-all flex items-center justify-between ${
                        volume === v ? "border-[#059669] bg-[#F0FDF4] text-[#059669] font-medium" : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}>
                      {v} {volume === v && <Check size={12} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 cursor-pointer hover:bg-gray-50">Back</button>
                <button onClick={() => setStep(3)} className="flex-1 py-2.5 rounded-lg bg-[#059669] text-white text-[13px] font-semibold cursor-pointer hover:bg-[#047857] flex items-center justify-center gap-2">
                  Continue <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="gs-fade-in">
              <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight mb-1">Review & confirm</h1>
              <p className="text-[14px] text-gray-500 mb-7">Everything look right?</p>
              <div className="rounded-xl border border-gray-200 overflow-hidden mb-6">
                {[
                  { label: "Company", value: companyName },
                  { label: "Contact", value: contactName },
                  { label: "Email",   value: email },
                  { label: "Mobile",  value: "+91 " + mobile },
                  { label: "Volume",  value: volume },
                  { label: "Zones",   value: selectedZones.length > 0 ? selectedZones.join(", ") : "Not selected" },
                ].map((row, i, arr) => (
                  <div key={row.label} className={`flex items-start justify-between px-4 py-3 ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}>
                    <span className="text-[12px] text-gray-500 shrink-0">{row.label}</span>
                    <span className="text-[13px] font-medium text-gray-900 text-right ml-4 max-w-[180px]">{row.value}</span>
                  </div>
                ))}
              </div>
              {errors.submit && <p className="text-red-500 text-[13px] mb-3 text-center">{errors.submit}</p>}
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 cursor-pointer hover:bg-gray-50">Back</button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 py-2.5 rounded-lg bg-[#059669] text-white text-[13px] font-semibold cursor-pointer hover:bg-[#047857] transition-colors disabled:opacity-60">
                  {loading ? "Registering..." : "Complete setup"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
