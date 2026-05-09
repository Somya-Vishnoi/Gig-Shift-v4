'use client'
import { useState } from 'react'
import { GigShiftLogo } from '@/components/shared/Logo'
import { LanguageSelector } from '@/components/shared/LanguageSelector'
import { getRiderByEmail, createRider, getPlatformByEmail, createPlatform } from '@/lib/supabase/db'
import { CITIES, VEHICLE_TYPES, PLATFORMS as PLATFORM_LIST, t, type LangCode, type UserRole, type VehicleType } from '@/lib/data/types'

type Step = 'role' | 'login' | 'register_rider' | 'register_platform'

interface AuthFlowProps {
  onAuth: (user: any, role: UserRole) => void
}

export function AuthFlow({ onAuth }: AuthFlowProps) {
  const [step, setStep] = useState<Step>('role')
  const [role, setRole] = useState<UserRole>('rider')
  const [lang, setLang] = useState<LangCode>('en')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Rider fields
  const [rName, setRName] = useState('')
  const [rMobile, setRMobile] = useState('')
  const [rCity, setRCity] = useState('Bangalore')
  const [rZone, setRZone] = useState('Koramangala')
  const [rVehicle, setRVehicle] = useState<VehicleType>('2-Wheeler')
  const [rGender, setRGender] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say'>('male')
  const [rPreferredZones, setRPreferredZones] = useState<string[]>([])

  // Platform fields
  const [pName, setPName] = useState('')
  const [pContact, setPContact] = useState('')
  const [pMobile, setPMobile] = useState('')
  const [pCity, setPCity] = useState('Bangalore')
  const [pZones, setPZones] = useState<string[]>([])
  const [pVolume, setPVolume] = useState(50)
  const [pEmployeeId, setPEmployeeId] = useState('')

  const handleRoleSelect = (r: UserRole) => {
    setRole(r)
    if (r === 'admin') {
      // Admin: just check email domain
      setStep('login')
    } else {
      setStep('login')
    }
  }

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      if (role === 'admin') {
        if (!email.endsWith('@gigshift.in')) {
          setError('Admin access requires @gigshift.in email')
          return
        }
        onAuth({ id: 'admin', email, role: 'super_admin' }, 'admin')
        return
      }
      if (role === 'rider') {
        const rider = await getRiderByEmail(email)
        if (rider) { onAuth(rider, 'rider'); return }
        setStep('register_rider')
      } else {
        const platform = await getPlatformByEmail(email)
        if (platform) { onAuth(platform, 'platform'); return }
        setStep('register_platform')
      }
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterRider = async () => {
    if (!rName || !rMobile) { setError('Name and mobile are required'); return }
    setLoading(true)
    try {
      const rider = await createRider({
        name: rName,
        email,
        mobile: rMobile,
        zone: rZone,
        preferred_zones: rPreferredZones.length ? rPreferredZones : [rZone],
        vehicle_type: rVehicle,
        language: lang,
        gender: rGender,
        status: 'active',
        city: rCity,
        dark_mode: false,
        latitude: undefined,
        longitude: undefined,
        is_online: true,
      })
      onAuth(rider, 'rider')
    } catch (e: any) {
      setError(e.message ?? 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterPlatform = async () => {
    if (!pName || !pContact || !pMobile || !pEmployeeId) {
      setError('All fields required')
      return
    }
    setLoading(true)
    try {
      const platform = await createPlatform({
        company_name: pName,
        email,
        mobile: pMobile,
        contact_name: pContact,
        expected_volume: pVolume,
        zones: pZones.length ? pZones : [pCity + ' Central'],
        status: 'active',
        employee_id: pEmployeeId,
        city: pCity,
        language: lang,
        dark_mode: false,
        sla_target_minutes: 30,
      })
      onAuth(platform, 'platform')
    } catch (e: any) {
      setError(e.message ?? 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const toggleZone = (zone: string, arr: string[], setArr: (v: string[]) => void) => {
    setArr(arr.includes(zone) ? arr.filter(z => z !== zone) : [...arr, zone])
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0C0C0C] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo + lang */}
        <div className="flex items-center justify-between mb-8">
          <GigShiftLogo size={32} />
          <LanguageSelector size="sm" value={lang} onChange={setLang} />
        </div>

        {/* Role select */}
        {step === 'role' && (
          <div>
            <h1 className="text-xl font-bold text-[#111827] dark:text-[#F9FAFB] mb-1">{t('select_role', lang)}</h1>
            <p className="text-sm text-[#6B7280] mb-6">Choose how you use GigShift</p>
            <div className="space-y-3">
              {[
                { role: 'rider' as UserRole, icon: '🛵', title: t('rider', lang), sub: 'Find gigs and earn' },
                { role: 'platform' as UserRole, icon: '🏢', title: t('platform', lang), sub: 'Hire riders for delivery' },
                { role: 'admin' as UserRole, icon: '⚡', title: t('admin', lang), sub: 'GigShift operations' },
              ].map(opt => (
                <button
                  key={opt.role}
                  onClick={() => handleRoleSelect(opt.role)}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] hover:border-[#059669] transition-colors text-left"
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">{opt.title}</div>
                    <div className="text-xs text-[#6B7280]">{opt.sub}</div>
                  </div>
                  <svg className="ml-auto" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4l4 4-4 4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Login (email) */}
        {step === 'login' && (
          <div>
            <button onClick={() => setStep('role')} className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-6 hover:text-[#111827]">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back
            </button>
            <h1 className="text-xl font-bold text-[#111827] dark:text-[#F9FAFB] mb-1 capitalize">{role} {t('login', lang)}</h1>
            <p className="text-sm text-[#6B7280] mb-6">Enter your email to continue</p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder={t('email', lang)}
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full rounded-xl border border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#111827] px-4 py-3 text-sm text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:border-[#059669] placeholder:text-[#9CA3AF]"
              />
              {error && <p className="text-xs text-[#EF4444]">{error}</p>}
              <button
                onClick={handleLogin}
                disabled={!email || loading}
                className="w-full py-3.5 rounded-xl bg-[#059669] text-white text-sm font-semibold disabled:opacity-40 hover:bg-[#047857] transition-colors"
              >
                {loading ? 'Checking...' : t('continue', lang)}
              </button>
            </div>
          </div>
        )}

        {/* Register Rider */}
        {step === 'register_rider' && (
          <div>
            <button onClick={() => setStep('login')} className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-5 hover:text-[#111827]">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back
            </button>
            <h1 className="text-xl font-bold text-[#111827] dark:text-[#F9FAFB] mb-5">Create Rider Profile</h1>
            <div className="space-y-3">
              <input type="text" placeholder={t('name', lang)} value={rName} onChange={e => setRName(e.target.value)} className="w-full rounded-xl border border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#111827] px-4 py-3 text-sm text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:border-[#059669] placeholder:text-[#9CA3AF]" />
              <input type="tel" placeholder={t('mobile', lang)} value={rMobile} onChange={e => setRMobile(e.target.value)} className="w-full rounded-xl border border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#111827] px-4 py-3 text-sm text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:border-[#059669] placeholder:text-[#9CA3AF]" />

              {/* Gender */}
              <div>
                <label className="text-xs text-[#6B7280] mb-1.5 block">Gender</label>
                <div className="flex gap-2 flex-wrap">
                  {['male', 'female', 'other', 'prefer_not_to_say'].map(g => (
                    <button key={g} onClick={() => setRGender(g as any)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${rGender === g ? 'bg-[#059669] text-white border-[#059669]' : 'border-[#E5E7EB] dark:border-[#1F2937] text-[#6B7280]'}`}>
                      {g === 'prefer_not_to_say' ? 'Prefer not to say' : g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle */}
              <div>
                <label className="text-xs text-[#6B7280] mb-1.5 block">{t('vehicle', lang)}</label>
                <div className="flex gap-2 flex-wrap">
                  {VEHICLE_TYPES.map(v => (
                    <button key={v} onClick={() => setRVehicle(v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${rVehicle === v ? 'bg-[#059669] text-white border-[#059669]' : 'border-[#E5E7EB] dark:border-[#1F2937] text-[#6B7280]'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* City + zone */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-[#6B7280] mb-1 block">{t('city', lang)}</label>
                  <select value={rCity} onChange={e => { setRCity(e.target.value); setRZone(CITIES[e.target.value][0]) }} className="w-full rounded-xl border border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#111827] px-3 py-2.5 text-sm text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:border-[#059669]">
                    {Object.keys(CITIES).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#6B7280] mb-1 block">Home Zone</label>
                  <select value={rZone} onChange={e => setRZone(e.target.value)} className="w-full rounded-xl border border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#111827] px-3 py-2.5 text-sm text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:border-[#059669]">
                    {(CITIES[rCity] ?? []).map(z => <option key={z}>{z}</option>)}
                  </select>
                </div>
              </div>

              {/* Preferred zones */}
              <div>
                <label className="text-xs text-[#6B7280] mb-1.5 block">Preferred Zones (optional)</label>
                <div className="flex flex-wrap gap-1.5">
                  {(CITIES[rCity] ?? []).map(zone => (
                    <button key={zone} onClick={() => toggleZone(zone, rPreferredZones, setRPreferredZones)} className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${rPreferredZones.includes(zone) ? 'bg-[#D1FAE5] text-[#059669] border-[#059669]' : 'border-[#E5E7EB] dark:border-[#1F2937] text-[#6B7280]'}`}>
                      {zone}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-xs text-[#EF4444]">{error}</p>}
              <button onClick={handleRegisterRider} disabled={loading} className="w-full py-3.5 rounded-xl bg-[#059669] text-white text-sm font-semibold disabled:opacity-40 hover:bg-[#047857] transition-colors">
                {loading ? 'Creating profile...' : 'Create Profile'}
              </button>
            </div>
          </div>
        )}

        {/* Register Platform */}
        {step === 'register_platform' && (
          <div>
            <button onClick={() => setStep('login')} className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-5 hover:text-[#111827]">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back
            </button>
            <h1 className="text-xl font-bold text-[#111827] dark:text-[#F9FAFB] mb-5">Register Platform</h1>
            <div className="space-y-3">
              <input type="text" placeholder="Company Name" value={pName} onChange={e => setPName(e.target.value)} className="w-full rounded-xl border border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#111827] px-4 py-3 text-sm text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:border-[#059669] placeholder:text-[#9CA3AF]" />
              <input type="text" placeholder="Contact Person" value={pContact} onChange={e => setPContact(e.target.value)} className="w-full rounded-xl border border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#111827] px-4 py-3 text-sm text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:border-[#059669] placeholder:text-[#9CA3AF]" />
              <input type="tel" placeholder={t('mobile', lang)} value={pMobile} onChange={e => setPMobile(e.target.value)} className="w-full rounded-xl border border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#111827] px-4 py-3 text-sm text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:border-[#059669] placeholder:text-[#9CA3AF]" />
              <input type="text" placeholder="GigShift Employee ID (from your sales rep)" value={pEmployeeId} onChange={e => setPEmployeeId(e.target.value)} className="w-full rounded-xl border border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#111827] px-4 py-3 text-sm text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:border-[#059669] placeholder:text-[#9CA3AF]" />

              <div>
                <label className="text-xs text-[#6B7280] mb-1 block">{t('city', lang)}</label>
                <select value={pCity} onChange={e => setPCity(e.target.value)} className="w-full rounded-xl border border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#111827] px-3 py-2.5 text-sm text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:border-[#059669]">
                  {Object.keys(CITIES).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-[#6B7280] mb-1.5 block">Operating Zones</label>
                <div className="flex flex-wrap gap-1.5">
                  {(CITIES[pCity] ?? []).map(zone => (
                    <button key={zone} onClick={() => toggleZone(zone, pZones, setPZones)} className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${pZones.includes(zone) ? 'bg-[#D1FAE5] text-[#059669] border-[#059669]' : 'border-[#E5E7EB] dark:border-[#1F2937] text-[#6B7280]'}`}>
                      {zone}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-[#6B7280] mb-1 block">Expected Volume: {pVolume}/day</label>
                <input type="range" min={10} max={500} value={pVolume} onChange={e => setPVolume(Number(e.target.value))} className="w-full accent-[#059669]" />
              </div>

              {error && <p className="text-xs text-[#EF4444]">{error}</p>}
              <button onClick={handleRegisterPlatform} disabled={loading} className="w-full py-3.5 rounded-xl bg-[#059669] text-white text-sm font-semibold disabled:opacity-40 hover:bg-[#047857] transition-colors">
                {loading ? 'Registering...' : 'Register Platform'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
