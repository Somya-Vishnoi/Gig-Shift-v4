'use client'
import { useState, useEffect } from 'react'
import { GigShiftSplash } from '@/components/shared/Logo'
import { AuthFlow } from '@/components/auth/AuthFlow'
import { RiderDashboard } from '@/components/rider/RiderDashboard'
import { PlatformDashboard } from '@/components/platform/PlatformDashboard'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { updateRider, updatePlatform } from '@/lib/supabase/db'
import type { UserRole, LangCode } from '@/lib/data/types'
type AppState = 'splash' | 'auth' | 'rider' | 'platform' | 'admin'

export default function App() {
  const [appState, setAppState] = useState<AppState>('auth')
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<UserRole>('rider')
  const [lang, setLang] = useState<LangCode>('en')
  const [darkMode, setDarkMode] = useState(false)

  // Dark mode toggle on root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Persist session
  useEffect(() => {
    const saved = localStorage.getItem('gs_session')
    if (saved) {
      try {
        const { user: u, role: r } = JSON.parse(saved)
        setUser(u)
        setRole(r)
        setLang(u.language ?? 'en')
        setDarkMode(u.dark_mode ?? false)
        setAppState(r)
      } catch {
        localStorage.removeItem('gs_session')
      }
    }
  }, [])

  const handleAuth = (u: any, r: UserRole) => {
    setUser(u)
    setRole(r)
    setLang(u.language ?? 'en')
    setDarkMode(u.dark_mode ?? false)
    localStorage.setItem('gs_session', JSON.stringify({ user: u, role: r }))

    // Update last_login
    if (r === 'rider') updateRider(u.id, { last_login: new Date().toISOString(), is_online: true }).catch(() => {})
    if (r === 'platform') updatePlatform(u.id, { last_login: new Date().toISOString() }).catch(() => {})

    setAppState(r)
  }

  const handleLogout = () => {
    if (role === 'rider' && user?.id) {
      updateRider(user.id, { is_online: false }).catch(() => {})
    }
    localStorage.removeItem('gs_session')
    setUser(null)
    setAppState('auth')
  }

  const handleLanguageChange = async (l: LangCode) => {
    setLang(l)
    setUser((prev: any) => ({ ...prev, language: l }))
    if (role === 'rider' && user?.id) await updateRider(user.id, { language: l }).catch(() => {})
    if (role === 'platform' && user?.id) await updatePlatform(user.id, { language: l }).catch(() => {})
    localStorage.setItem('gs_session', JSON.stringify({ user: { ...user, language: l }, role }))
  }

  return (
    <>
      {false && (
  <GigShiftSplash onComplete={() => setAppState('auth')} />
)}
      {appState === 'auth' && (
        <AuthFlow onAuth={handleAuth} />
      )}
      {appState === 'rider' && user && (
        <RiderDashboard
          rider={{ ...user, language: lang, dark_mode: darkMode }}
          onLogout={handleLogout}
          onLanguageChange={handleLanguageChange}
        />
      )}
      {appState === 'platform' && user && (
        <PlatformDashboard
          platform={{ ...user, language: lang, dark_mode: darkMode }}
          onLogout={handleLogout}
          onLanguageChange={handleLanguageChange}
        />
      )}
      {appState === 'admin' && (
        <AdminDashboard
          onLogout={handleLogout}
          lang={lang}
          onLanguageChange={handleLanguageChange}
        />
      )}
    </>
  )
}
