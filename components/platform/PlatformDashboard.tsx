'use client'
import { useState, useEffect } from 'react'
import { GigShiftLogo } from '@/components/shared/Logo'
import { LanguageSelector } from '@/components/shared/LanguageSelector'
import {
  getOrders, createOrder, updateOrderStatus,
  subscribeToOrders, getRiders
} from '@/lib/supabase/db'
import { TIERS, ZONE_MULTIPLIERS, t, type LangCode, type Platform, type Order, type Rider, type TierKey } from '@/lib/data/types'
import { useSimulation } from '@/lib/simulation/engine'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface PlatformDashboardProps {
  platform: Platform
  onLogout: () => void
  onLanguageChange: (lang: LangCode) => void
}

export function PlatformDashboard({ platform, onLogout, onLanguageChange }: PlatformDashboardProps) {
  const lang = platform.language as LangCode
  const [orders, setOrders] = useState<Order[]>([])
  const [availableRiders, setAvailableRiders] = useState<Rider[]>([])
  const [tab, setTab] = useState<'dashboard' | 'new_order' | 'orders' | 'riders' | 'sla'>('dashboard')

  // New order form
  const [selectedZone, setSelectedZone] = useState(platform.zones?.[0] ?? '')
  const [ridersNeeded, setRidersNeeded] = useState(5)
  const [placing, setPlacing] = useState(false)
  const [placed, setPlaced] = useState(false)

  const { liveOrders } = useSimulation()

  useEffect(() => {
    getOrders(platform.id).then(setOrders)
    getRiders().then(r => setAvailableRiders(r.filter(rider => rider.status === 'active')))

    const sub = subscribeToOrders(order => {
      if (order.platform_id !== platform.id) return
      setOrders(prev => {
        const idx = prev.findIndex(o => o.id === order.id)
        if (idx >= 0) { const u = [...prev]; u[idx] = order; return u }
        return [order, ...prev]
      })
    })
    return () => { sub.unsubscribe() }
  }, [platform.id])

  // Calculate tier
  const tier: TierKey = ridersNeeded <= 10 ? 'basic' : ridersNeeded <= 50 ? 'standard' : 'surge'
  const tierConfig = TIERS[tier]
  const zoneMultiplier = ZONE_MULTIPLIERS[selectedZone] ?? 1.0
  const ppd = Math.round(tierConfig.basePPD * zoneMultiplier)
  const totalCost = ppd * ridersNeeded

  // SLA data
  const slaData = orders.slice(0, 7).map((o, i) => ({
    order: `#${i + 1}`,
    target: platform.sla_target_minutes,
    actual: platform.sla_target_minutes - 5 + Math.floor(Math.random() * 15)
  }))

  // Stats
  const activeOrders = orders.filter(o => o.status === 'active').length
  const fulfilledOrders = orders.filter(o => o.status === 'fulfilled').length
  const totalSpend = orders.reduce((s, o) => s + (o.total_cost ?? 0), 0)

  const handlePlaceOrder = async () => {
    setPlacing(true)
    try {
      const order = await createOrder({
        platform_id: platform.id,
        platform_name: platform.company_name,
        zone: selectedZone,
        riders_requested: ridersNeeded,
        riders_confirmed: 0,
        tier,
        ppd,
        total_cost: totalCost,
        status: 'pending'
      })
      setOrders(prev => [order, ...prev])
      setPlaced(true)
      setTimeout(() => { setPlaced(false); setTab('orders') }, 2000)
    } catch (e) {
      console.error(e)
    } finally {
      setPlacing(false)
    }
  }

  const TABS = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'new_order', label: 'New Order' },
    { key: 'orders', label: 'My Orders' },
    { key: 'riders', label: 'Riders' },
    { key: 'sla', label: 'SLA' },
  ] as const

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0C0C0C]">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#111827] border-b border-[#E5E7EB] dark:border-[#1F2937] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GigShiftLogo size={28} theme={platform.dark_mode ? 'dark' : 'light'} />
            <div>
              <div className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">{platform.company_name}</div>
              <div className="text-xs text-[#6B7280]">{platform.city} · ID: {platform.employee_id}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector size="sm" value={lang} onChange={onLanguageChange} />
            <button onClick={onLogout} className="text-xs text-[#6B7280] hover:text-[#111827] transition-colors">
              {t('logout', lang)}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-5">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {TABS.map(tb => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === tb.key
                  ? 'bg-[#111827] dark:bg-[#F9FAFB] text-white dark:text-[#111827]'
                  : 'text-[#6B7280] hover:text-[#111827] dark:hover:text-[#F9FAFB] bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937]'
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {tab === 'dashboard' && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Active Orders', value: activeOrders + liveOrders.filter((o: any) => o.platform_name === platform.company_name).length },
                { label: 'Fulfilled', value: fulfilledOrders },
                { label: 'Total Spend', value: `₹${totalSpend.toLocaleString('en-IN')}` },
              ].map(s => (
                <div key={s.label} className="rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] px-4 py-4">
                  <div className="text-2xl font-bold text-[#111827] dark:text-[#F9FAFB]">{s.value}</div>
                  <div className="text-xs text-[#6B7280] mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Zone availability */}
            <div className="rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] p-4">
              <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB] mb-3">Rider Availability by Zone</h3>
              <div className="space-y-2">
                {(platform.zones ?? []).map(zone => {
                  const count = availableRiders.filter(r => r.zone === zone).length
                  const pct = Math.min(100, (count / 20) * 100)
                  return (
                    <div key={zone} className="flex items-center gap-3">
                      <span className="text-xs text-[#6B7280] w-28 shrink-0">{zone}</span>
                      <div className="flex-1 h-2 rounded-full bg-[#F3F4F6] dark:bg-[#1F2937] overflow-hidden">
                        <div className="h-full rounded-full bg-[#059669] transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-medium text-[#111827] dark:text-[#F9FAFB] w-8 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Quick order button */}
            <button
              onClick={() => setTab('new_order')}
              className="w-full py-4 rounded-xl bg-[#059669] text-white text-sm font-semibold hover:bg-[#047857] transition-colors"
            >
              + Place New Rider Order
            </button>
          </div>
        )}

        {/* New Order */}
        {tab === 'new_order' && (
          <div className="max-w-lg mx-auto">
            <div className="rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] p-5">
              <h2 className="text-base font-bold text-[#111827] dark:text-[#F9FAFB] mb-5">Place Rider Order</h2>

              <div className="space-y-4">
                {/* Zone select */}
                <div>
                  <label className="text-xs font-medium text-[#6B7280] block mb-1.5">{t('zone', lang)}</label>
                  <div className="flex flex-wrap gap-2">
                    {(platform.zones ?? []).map(zone => (
                      <button
                        key={zone}
                        onClick={() => setSelectedZone(zone)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          selectedZone === zone
                            ? 'bg-[#059669] text-white border-[#059669]'
                            : 'border-[#E5E7EB] dark:border-[#1F2937] text-[#6B7280] hover:border-[#059669]'
                        }`}
                      >
                        {zone}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Riders needed */}
                <div>
                  <label className="text-xs font-medium text-[#6B7280] block mb-1.5">
                    Riders Needed: <span className="text-[#111827] dark:text-[#F9FAFB] font-bold">{ridersNeeded}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={200}
                    value={ridersNeeded}
                    onChange={e => setRidersNeeded(Number(e.target.value))}
                    className="w-full accent-[#059669]"
                  />
                  <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-1">
                    <span>1</span><span>50</span><span>100</span><span>200</span>
                  </div>
                </div>

                {/* Tier indicator */}
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(TIERS) as [TierKey, typeof TIERS[TierKey]][]).map(([key, t]) => (
                    <div key={key} className={`rounded-lg border p-3 transition-colors ${tier === key ? 'border-[#059669] bg-[#F0FDF4] dark:bg-[#052e16]' : 'border-[#E5E7EB] dark:border-[#1F2937]'}`}>
                      <div className="text-xs font-semibold text-[#111827] dark:text-[#F9FAFB] capitalize">{key}</div>
                      <div className="text-[10px] text-[#6B7280] mt-0.5">{t.minRiders}–{t.maxRiders} riders</div>
                      <div className="text-xs font-bold text-[#059669] mt-1">₹{t.basePPD} base</div>
                    </div>
                  ))}
                </div>

                {/* Cost breakdown */}
                <div className="rounded-lg bg-[#F9FAFB] dark:bg-[#0C0C0C] border border-[#E5E7EB] dark:border-[#1F2937] p-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6B7280]">Base PPD</span>
                    <span className="text-[#111827] dark:text-[#F9FAFB]">₹{tierConfig.basePPD}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6B7280]">Zone multiplier ({selectedZone})</span>
                    <span className="text-[#111827] dark:text-[#F9FAFB]">{zoneMultiplier}x</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6B7280]">Final PPD</span>
                    <span className="font-bold text-[#059669]">₹{ppd}</span>
                  </div>
                  <div className="border-t border-[#E5E7EB] dark:border-[#1F2937] pt-1.5 flex justify-between text-sm">
                    <span className="font-semibold text-[#111827] dark:text-[#F9FAFB]">Total ({ridersNeeded} riders)</span>
                    <span className="font-bold text-[#111827] dark:text-[#F9FAFB]">₹{totalCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-[10px] text-[#6B7280]">Notice period: {tierConfig.notice}</div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={placing || placed || !selectedZone}
                  className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-colors ${
                    placed
                      ? 'bg-[#D1FAE5] text-[#059669] cursor-default'
                      : 'bg-[#059669] text-white hover:bg-[#047857] disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                >
                  {placed ? '✓ Order Placed!' : placing ? 'Placing...' : `Place Order — ₹${totalCost.toLocaleString('en-IN')}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <div className="rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E7EB] dark:border-[#1F2937]">
              <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">My Orders</h3>
            </div>
            {orders.length === 0 ? (
              <div className="text-center py-12 text-sm text-[#6B7280]">No orders yet.</div>
            ) : (
              <div className="divide-y divide-[#E5E7EB] dark:divide-[#1F2937]">
                {orders.map(o => (
                  <div key={o.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">{o.zone}</div>
                      <div className="text-xs text-[#6B7280]">{o.riders_confirmed}/{o.riders_requested} riders · ₹{o.ppd}/delivery · {o.tier}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#111827] dark:text-[#F9FAFB]">₹{o.total_cost?.toLocaleString('en-IN')}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        o.status === 'active' ? 'bg-[#D1FAE5] text-[#059669]' :
                        o.status === 'fulfilled' ? 'bg-[#F3F4F6] text-[#6B7280]' : 'bg-[#FEF3C7] text-[#D97706]'
                      }`}>{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Riders */}
        {tab === 'riders' && (
          <div className="rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E7EB] dark:border-[#1F2937]">
              <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">Riders in Your Zones</h3>
            </div>
            <div className="divide-y divide-[#E5E7EB] dark:divide-[#1F2937]">
              {availableRiders.filter(r => (platform.zones ?? []).includes(r.zone)).slice(0, 50).map(r => (
                <div key={r.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F0FDF4] flex items-center justify-center text-sm font-bold text-[#059669]">
                      {r.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">{r.name}</div>
                      <div className="text-xs text-[#6B7280]">{r.zone} · {r.vehicle_type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#F59E0B]">★ {r.rating}</span>
                    <span className={`w-2 h-2 rounded-full ${r.is_online ? 'bg-[#10B981]' : 'bg-[#D1D5DB]'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLA */}
        {tab === 'sla' && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'SLA Target', value: `${platform.sla_target_minutes} min` },
                { label: 'Avg Delivery', value: `${Math.round(platform.sla_target_minutes * 0.9)} min` },
                { label: 'Breach Rate', value: '8%' },
              ].map(s => (
                <div key={s.label} className="rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] px-4 py-4">
                  <div className="text-xl font-bold text-[#111827] dark:text-[#F9FAFB]">{s.value}</div>
                  <div className="text-xs text-[#6B7280] mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] p-4">
              <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB] mb-3">Delivery Time vs SLA</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={slaData} barSize={20}>
                  <XAxis dataKey="order" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="target" fill="#E5E7EB" radius={[3, 3, 0, 0]} name="Target" />
                  <Bar dataKey="actual" fill="#059669" radius={[3, 3, 0, 0]} name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
