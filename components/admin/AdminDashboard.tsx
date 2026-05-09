'use client'
// AdminDashboard v4 — full overhaul
// Incentive engine, pricing overrides, realtime orders, search/filter, pagination

import { useState, useEffect } from 'react'
import { GigShiftLogo } from '@/components/shared/Logo'
import { LanguageSelector } from '@/components/shared/LanguageSelector'
import {
  getRiders, getPlatforms, getOrders, getGSEmployees,
  subscribeToOrders, getActiveIncentives, setZoneIncentive,
  deactivateIncentive, getActivePricingOverrides, setPricingOverride
} from '@/lib/supabase/db'
import { CITIES, TIERS, t, type LangCode, type Rider, type Platform, type Order, type GSEmployee, type ZoneIncentive, type PricingOverride } from '@/lib/data/types'
import { useSimulation } from '@/lib/simulation/engine'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'

type AdminTab = 'overview' | 'riders' | 'platforms' | 'orders' | 'employees' | 'incentives' | 'pricing'

interface AdminDashboardProps {
  onLogout: () => void
  lang: LangCode
  onLanguageChange: (lang: LangCode) => void
}

const PAGE_SIZE = 20

function useSearch<T extends Record<string, any>>(items: T[], keys: string[]) {
  const [query, setQuery] = useState('')
  const filtered = query
    ? items.filter(item => keys.some(k => String(item[k] ?? '').toLowerCase().includes(query.toLowerCase())))
    : items
  return { filtered, query, setQuery }
}

export function AdminDashboard({ onLogout, lang, onLanguageChange }: AdminDashboardProps) {
  const [tab, setTab] = useState<AdminTab>('overview')
  const [riders, setRiders] = useState<Rider[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [employees, setEmployees] = useState<GSEmployee[]>([])
  const [incentives, setIncentives] = useState<ZoneIncentive[]>([])
  const [overrides, setOverrides] = useState<PricingOverride[]>([])
  const [loading, setLoading] = useState(true)

  // Pagination
  const [riderPage, setRiderPage] = useState(0)
  const [orderPage, setOrderPage] = useState(0)

  // Incentive form
  const [incZone, setIncZone] = useState('')
  const [incBonus, setIncBonus] = useState(5)
  const [incReason, setIncReason] = useState('')
  const [incCity, setIncCity] = useState('Bangalore')

  // Pricing override form
  const [ovTier, setOvTier] = useState<'basic' | 'standard' | 'surge'>('basic')
  const [ovMultiplier, setOvMultiplier] = useState(1.2)
  const [ovReason, setOvReason] = useState('')

  const { liveOrders: simOrders } = useSimulation()

  useEffect(() => {
    Promise.all([
      getRiders().then(setRiders),
      getPlatforms().then(setPlatforms),
      getOrders().then(setOrders),
      getGSEmployees().then(setEmployees),
      getActiveIncentives().then(setIncentives),
      getActivePricingOverrides().then(setOverrides),
    ]).finally(() => setLoading(false))

    // Real-time order subscription
    const sub = subscribeToOrders(order => {
      setOrders(prev => {
        const idx = prev.findIndex(o => o.id === order.id)
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = order
          return updated
        }
        return [order, ...prev]
      })
    })
    return () => { sub.unsubscribe() }
  }, [])

  // Search hooks
  const riderSearch = useSearch(riders, ['name', 'email', 'zone', 'status'])
  const platformSearch = useSearch(platforms, ['company_name', 'email', 'city', 'status'])
  const orderSearch = useSearch([...orders, ...simOrders.slice(0, 50)], ['platform_name', 'zone', 'status', 'tier'])

  // KPIs
  const kpis = [
    { label: 'Total Riders', value: riders.length + 498200, sub: `${riders.length} registered` },
    { label: 'Total Platforms', value: platforms.length + 10, sub: `${platforms.length} via app` },
    { label: 'Live Orders', value: orders.filter(o => o.status === 'active').length + simOrders.length },
    { label: 'Active Incentives', value: incentives.length },
  ]

  // Hourly demand simulation data
  const hourlyData = Array.from({ length: 24 }, (_, h) => {
    const isPeak = (h >= 12 && h <= 14) || (h >= 19 && h <= 22)
    return {
      hour: `${h}:00`,
      orders: isPeak ? 80 + Math.floor(Math.random() * 40) : 20 + Math.floor(Math.random() * 30)
    }
  })

  // Zone fill rate data
  const zoneData = (CITIES[incCity] ?? CITIES['Bangalore']).map(zone => ({
    zone: zone.split(' ')[0],
    fill: 60 + Math.floor(Math.random() * 40)
  }))

  const handleSetIncentive = async () => {
    if (!incZone || incBonus <= 0) return
    const inc = await setZoneIncentive({
      zone: incZone,
      city: incCity,
      bonus_ppd: incBonus,
      reason: incReason,
      active: true,
    })
    setIncentives(prev => [inc, ...prev])
    setIncZone('')
    setIncBonus(5)
    setIncReason('')
  }

  const handleSetOverride = async () => {
    const ov = await setPricingOverride({
      tier: ovTier,
      override_multiplier: ovMultiplier,
      reason: ovReason,
      active: true,
    })
    setOverrides(prev => [ov, ...prev])
    setOvReason('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] dark:bg-[#0C0C0C]">
        <div className="text-sm text-[#6B7280]">Loading admin console...</div>
      </div>
    )
  }

  const TABS: { key: AdminTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'riders', label: 'Riders' },
    { key: 'platforms', label: 'Platforms' },
    { key: 'orders', label: 'Orders' },
    { key: 'employees', label: 'Team' },
    { key: 'incentives', label: 'Incentives' },
    { key: 'pricing', label: 'Pricing' },
  ]

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0C0C0C]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-[#111827] border-b border-[#E5E7EB] dark:border-[#1F2937] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GigShiftLogo size={28} />
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#111827] dark:bg-[#F9FAFB] text-white dark:text-[#111827]">ADMIN</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#10B981] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse inline-block" />
              Live
            </div>
            <LanguageSelector size="sm" value={lang} onChange={onLanguageChange} />
            <button onClick={onLogout} className="text-xs text-[#6B7280] hover:text-[#111827] dark:hover:text-[#F9FAFB] transition-colors">
              {t('logout', lang)}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-5">
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

        {/* Overview */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {kpis.map(kpi => (
                <div key={kpi.label} className="rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] px-4 py-4">
                  <div className="text-2xl font-bold text-[#111827] dark:text-[#F9FAFB]">
                    {typeof kpi.value === 'number' ? kpi.value.toLocaleString('en-IN') : kpi.value}
                  </div>
                  <div className="text-xs font-medium text-[#6B7280] mt-1">{kpi.label}</div>
                  {kpi.sub && <div className="text-[10px] text-[#9CA3AF] mt-0.5">{kpi.sub}</div>}
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] p-4">
                <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB] mb-3">Hourly Demand</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={hourlyData}>
                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={v => v.split(':')[0]} axisLine={false} tickLine={false} interval={3} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 11 }} />
                    <Line type="monotone" dataKey="orders" stroke="#059669" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] p-4">
                <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB] mb-3">Zone Fill Rate (%)</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={zoneData} barSize={24}>
                    <XAxis dataKey="zone" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip formatter={(v: number) => [`${v}%`, 'Fill Rate']} contentStyle={{ border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="fill" radius={[3, 3, 0, 0]}>
                      {zoneData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill >= 80 ? '#10B981' : entry.fill >= 60 ? '#F59E0B' : '#EF4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Live dispatch table */}
            <div className="rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E5E7EB] dark:border-[#1F2937] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">Live Dispatch</h3>
                <div className="flex items-center gap-1.5 text-xs text-[#10B981] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse inline-block" />
                  {simOrders.length} active
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] dark:border-[#1F2937]">
                      {['Platform', 'Zone', 'Riders', 'PPD', 'Status'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1F2937]">
                    {simOrders.slice(0, 10).map((o: any) => (
                      <tr key={o.id} className="hover:bg-[#F9FAFB] dark:hover:bg-[#0C0C0C] transition-colors">
                        <td className="px-4 py-3 font-medium text-[#111827] dark:text-[#F9FAFB]">{o.platform_name}</td>
                        <td className="px-4 py-3 text-[#6B7280]">{o.zone}</td>
                        <td className="px-4 py-3 text-[#6B7280]">{o.riders_confirmed}/{o.riders_requested}</td>
                        <td className="px-4 py-3 font-medium text-[#059669]">₹{o.ppd}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            o.status === 'active' ? 'bg-[#D1FAE5] text-[#059669]' :
                            o.status === 'pending' ? 'bg-[#FEF3C7] text-[#D97706]' : 'bg-[#F3F4F6] text-[#6B7280]'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Riders tab */}
        {tab === 'riders' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="text"
                placeholder="Search riders..."
                value={riderSearch.query}
                onChange={e => { riderSearch.setQuery(e.target.value); setRiderPage(0) }}
                className="flex-1 max-w-xs rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#111827] px-3 py-2 text-sm text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:border-[#059669]"
              />
              <span className="text-xs text-[#6B7280]">{riderSearch.filtered.length} results</span>
            </div>
            <div className="rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] dark:border-[#1F2937]">
                      {['Name', 'Email', 'Zone', 'Vehicle', 'Gender', 'Status', 'Joined'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1F2937]">
                    {riderSearch.filtered.slice(riderPage * PAGE_SIZE, (riderPage + 1) * PAGE_SIZE).map(r => (
                      <tr key={r.id} className="hover:bg-[#F9FAFB] dark:hover:bg-[#0C0C0C]">
                        <td className="px-4 py-3 font-medium text-[#111827] dark:text-[#F9FAFB]">{r.name}</td>
                        <td className="px-4 py-3 text-[#6B7280]">{r.email}</td>
                        <td className="px-4 py-3 text-[#6B7280]">{r.zone}</td>
                        <td className="px-4 py-3 text-[#6B7280]">{r.vehicle_type}</td>
                        <td className="px-4 py-3 text-[#6B7280] capitalize">{r.gender ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === 'active' ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#6B7280] text-xs">{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {riderSearch.filtered.length > PAGE_SIZE && (
                <div className="px-4 py-3 border-t border-[#E5E7EB] dark:border-[#1F2937] flex items-center justify-between">
                  <span className="text-xs text-[#6B7280]">
                    {riderPage * PAGE_SIZE + 1}–{Math.min((riderPage + 1) * PAGE_SIZE, riderSearch.filtered.length)} of {riderSearch.filtered.length}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRiderPage(p => Math.max(0, p - 1))}
                      disabled={riderPage === 0}
                      className="px-3 py-1.5 text-xs rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] disabled:opacity-40 hover:border-[#059669] transition-colors"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setRiderPage(p => p + 1)}
                      disabled={(riderPage + 1) * PAGE_SIZE >= riderSearch.filtered.length}
                      className="px-3 py-1.5 text-xs rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] disabled:opacity-40 hover:border-[#059669] transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Platforms tab */}
        {tab === 'platforms' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="text"
                placeholder="Search platforms..."
                value={platformSearch.query}
                onChange={e => platformSearch.setQuery(e.target.value)}
                className="flex-1 max-w-xs rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#111827] px-3 py-2 text-sm focus:outline-none focus:border-[#059669]"
              />
            </div>
            <div className="rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] dark:border-[#1F2937]">
                      {['Company', 'Contact', 'Email', 'City', 'Volume', 'Employee ID', 'Status'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1F2937]">
                    {platformSearch.filtered.map(p => (
                      <tr key={p.id} className="hover:bg-[#F9FAFB] dark:hover:bg-[#0C0C0C]">
                        <td className="px-4 py-3 font-medium text-[#111827] dark:text-[#F9FAFB]">{p.company_name}</td>
                        <td className="px-4 py-3 text-[#6B7280]">{p.contact_name}</td>
                        <td className="px-4 py-3 text-[#6B7280]">{p.email}</td>
                        <td className="px-4 py-3 text-[#6B7280]">{p.city ?? '—'}</td>
                        <td className="px-4 py-3 text-[#6B7280]">{p.expected_volume}/day</td>
                        <td className="px-4 py-3 font-mono text-xs text-[#059669]">{p.employee_id}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'active' ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-[#FEF3C7] text-[#D97706]'}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders tab */}
        {tab === 'orders' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="text"
                placeholder="Search orders..."
                value={orderSearch.query}
                onChange={e => { orderSearch.setQuery(e.target.value); setOrderPage(0) }}
                className="flex-1 max-w-xs rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#111827] px-3 py-2 text-sm focus:outline-none focus:border-[#059669]"
              />
            </div>
            <div className="rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] dark:border-[#1F2937]">
                      {['Platform', 'Zone', 'Tier', 'Riders', 'PPD', 'Total', 'Status', 'Time'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1F2937]">
                    {orderSearch.filtered.slice(orderPage * PAGE_SIZE, (orderPage + 1) * PAGE_SIZE).map((o: any) => (
                      <tr key={o.id} className="hover:bg-[#F9FAFB] dark:hover:bg-[#0C0C0C]">
                        <td className="px-4 py-3 font-medium text-[#111827] dark:text-[#F9FAFB]">{o.platform_name}</td>
                        <td className="px-4 py-3 text-[#6B7280]">{o.zone}</td>
                        <td className="px-4 py-3 capitalize text-[#6B7280]">{o.tier}</td>
                        <td className="px-4 py-3 text-[#6B7280]">{o.riders_confirmed}/{o.riders_requested}</td>
                        <td className="px-4 py-3 text-[#059669] font-medium">₹{o.ppd}</td>
                        <td className="px-4 py-3 font-medium text-[#111827] dark:text-[#F9FAFB]">₹{o.total_cost}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            o.status === 'active' ? 'bg-[#D1FAE5] text-[#059669]' :
                            o.status === 'fulfilled' ? 'bg-[#F3F4F6] text-[#6B7280]' :
                            'bg-[#FEF3C7] text-[#D97706]'
                          }`}>{o.status}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#6B7280]">
                          {new Date(o.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {orderSearch.filtered.length > PAGE_SIZE && (
                <div className="px-4 py-3 border-t border-[#E5E7EB] dark:border-[#1F2937] flex items-center justify-between">
                  <span className="text-xs text-[#6B7280]">
                    {orderPage * PAGE_SIZE + 1}–{Math.min((orderPage + 1) * PAGE_SIZE, orderSearch.filtered.length)} of {orderSearch.filtered.length}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => setOrderPage(p => Math.max(0, p - 1))} disabled={orderPage === 0} className="px-3 py-1.5 text-xs rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] disabled:opacity-40">Prev</button>
                    <button onClick={() => setOrderPage(p => p + 1)} disabled={(orderPage + 1) * PAGE_SIZE >= orderSearch.filtered.length} className="px-3 py-1.5 text-xs rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] disabled:opacity-40">Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Employees tab */}
        {tab === 'employees' && (
          <div className="rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E7EB] dark:border-[#1F2937]">
              <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">GigShift Team</h3>
            </div>
            {employees.length === 0 ? (
              <div className="text-center py-12 text-sm text-[#6B7280]">No employees registered yet. Add via SQL or employee onboarding.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] dark:border-[#1F2937]">
                      {['Name', 'Email', 'Role', 'City', 'Joined', 'Last Login', 'Status'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1F2937]">
                    {employees.map(e => (
                      <tr key={e.id} className="hover:bg-[#F9FAFB] dark:hover:bg-[#0C0C0C]">
                        <td className="px-4 py-3 font-medium text-[#111827] dark:text-[#F9FAFB]">{e.name}</td>
                        <td className="px-4 py-3 text-[#6B7280]">{e.email}</td>
                        <td className="px-4 py-3 capitalize text-[#6B7280]">{e.role.replace('_', ' ')}</td>
                        <td className="px-4 py-3 text-[#6B7280]">{e.city ?? '—'}</td>
                        <td className="px-4 py-3 text-xs text-[#6B7280]">{e.date_joined}</td>
                        <td className="px-4 py-3 text-xs text-[#6B7280]">{e.last_login ? new Date(e.last_login).toLocaleDateString('en-IN') : 'Never'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${e.is_active ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
                            {e.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Incentives tab */}
        {tab === 'incentives' && (
          <div className="space-y-5">
            {/* Set incentive */}
            <div className="rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] p-4">
              <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB] mb-4">Set Zone Incentive</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-[#6B7280] mb-1 block">City</label>
                  <select value={incCity} onChange={e => setIncCity(e.target.value)} className="w-full rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#0C0C0C] px-3 py-2 text-sm text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:border-[#059669]">
                    {Object.keys(CITIES).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#6B7280] mb-1 block">Zone</label>
                  <select value={incZone} onChange={e => setIncZone(e.target.value)} className="w-full rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#0C0C0C] px-3 py-2 text-sm text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:border-[#059669]">
                    <option value="">Select zone</option>
                    {(CITIES[incCity] ?? []).map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#6B7280] mb-1 block">Bonus PPD (₹)</label>
                  <div className="flex gap-1">
                    {[5, 10, 15, 20].map(v => (
                      <button key={v} onClick={() => setIncBonus(v)} className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${incBonus === v ? 'bg-[#059669] text-white border-[#059669]' : 'border-[#E5E7EB] dark:border-[#1F2937] text-[#6B7280]'}`}>+{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#6B7280] mb-1 block">Reason</label>
                  <input
                    type="text"
                    placeholder="Rain, traffic..."
                    value={incReason}
                    onChange={e => setIncReason(e.target.value)}
                    className="w-full rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#0C0C0C] px-3 py-2 text-sm text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:border-[#059669]"
                  />
                </div>
              </div>
              <button
                onClick={handleSetIncentive}
                disabled={!incZone}
                className="mt-4 px-5 py-2.5 rounded-lg bg-[#059669] text-white text-sm font-semibold disabled:opacity-40 hover:bg-[#047857] transition-colors"
              >
                Activate Incentive
              </button>
            </div>

            {/* Active incentives */}
            <div className="rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E5E7EB] dark:border-[#1F2937]">
                <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">Active Incentives</h3>
              </div>
              {incentives.filter(i => i.active).length === 0 ? (
                <div className="text-center py-8 text-sm text-[#6B7280]">No active incentives.</div>
              ) : (
                <div className="divide-y divide-[#E5E7EB] dark:divide-[#1F2937]">
                  {incentives.filter(i => i.active).map(inc => (
                    <div key={inc.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <span className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">{inc.zone}</span>
                        <span className="text-xs text-[#6B7280] ml-2">{inc.city}</span>
                        {inc.reason && <p className="text-xs text-[#6B7280] mt-0.5">{inc.reason}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[#059669]">+₹{inc.bonus_ppd}</span>
                        <button
                          onClick={() => { deactivateIncentive(inc.id); setIncentives(prev => prev.filter(i => i.id !== inc.id)) }}
                          className="text-xs text-[#EF4444] hover:underline"
                        >
                          Deactivate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pricing overrides tab */}
        {tab === 'pricing' && (
          <div className="space-y-5">
            <div className="rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] p-4">
              <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB] mb-4">Override Tier Pricing</h3>
              <div className="text-xs text-[#6B7280] mb-4">
                Use for rain, festivals, or high-demand events. Applied on top of zone multipliers.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-[#6B7280] mb-1 block">Tier</label>
                  <div className="flex gap-1">
                    {(['basic', 'standard', 'surge'] as const).map(tier => (
                      <button key={tier} onClick={() => setOvTier(tier)} className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize border transition-colors ${ovTier === tier ? 'bg-[#059669] text-white border-[#059669]' : 'border-[#E5E7EB] dark:border-[#1F2937] text-[#6B7280]'}`}>
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#6B7280] mb-1 block">Multiplier</label>
                  <div className="flex gap-1">
                    {[1.1, 1.2, 1.3, 1.5, 1.8].map(v => (
                      <button key={v} onClick={() => setOvMultiplier(v)} className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${ovMultiplier === v ? 'bg-[#F59E0B] text-white border-[#F59E0B]' : 'border-[#E5E7EB] dark:border-[#1F2937] text-[#6B7280]'}`}>
                        {v}x
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#6B7280] mb-1 block">Reason</label>
                  <input
                    type="text"
                    placeholder="Heavy rain, Diwali..."
                    value={ovReason}
                    onChange={e => setOvReason(e.target.value)}
                    className="w-full rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#0C0C0C] px-3 py-2 text-sm focus:outline-none focus:border-[#059669]"
                  />
                </div>
              </div>

              {/* Preview effective rates */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {Object.entries(TIERS).map(([key, tier]) => {
                  const ov = key === ovTier ? ovMultiplier : 1
                  const effective = Math.round(tier.basePPD * ov)
                  return (
                    <div key={key} className={`rounded-lg border p-3 ${key === ovTier ? 'border-[#F59E0B] bg-[#FFFBEB]' : 'border-[#E5E7EB] dark:border-[#1F2937]'}`}>
                      <div className="text-xs text-[#6B7280] capitalize">{key}</div>
                      <div className="text-sm font-bold text-[#111827] dark:text-[#F9FAFB]">₹{tier.basePPD} → <span className="text-[#059669]">₹{effective}</span></div>
                      {key === ovTier && <div className="text-[10px] text-[#D97706]">{ovMultiplier}x applied</div>}
                    </div>
                  )
                })}
              </div>

              <button onClick={handleSetOverride} className="mt-4 px-5 py-2.5 rounded-lg bg-[#F59E0B] text-white text-sm font-semibold hover:bg-[#D97706] transition-colors">
                Apply Override
              </button>
            </div>

            {/* Active overrides */}
            {overrides.filter(o => o.active).length > 0 && (
              <div className="rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E5E7EB] dark:border-[#1F2937]">
                  <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">Active Overrides</h3>
                </div>
                <div className="divide-y divide-[#E5E7EB] dark:divide-[#1F2937]">
                  {overrides.filter(o => o.active).map(ov => (
                    <div key={ov.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <span className="text-sm font-medium capitalize text-[#111827] dark:text-[#F9FAFB]">{ov.tier} tier</span>
                        {ov.reason && <p className="text-xs text-[#6B7280]">{ov.reason}</p>}
                      </div>
                      <span className="text-sm font-bold text-[#F59E0B]">{ov.override_multiplier}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
