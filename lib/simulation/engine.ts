'use client'
import { useState, useEffect, useRef } from 'react'
import { PLATFORMS, ZONES, TIERS, ZONE_MULTIPLIERS } from '@/lib/data/types'

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export interface SimOrder {
  id: string
  platform_id: string
  platform_name: string
  zone: string
  riders_requested: number
  riders_confirmed: number
  tier: 'basic' | 'standard' | 'surge'
  ppd: number
  total_cost: number
  status: 'pending' | 'active' | 'fulfilled' | 'cancelled'
  created_at: string
}

export interface GigSlot {
  id: string
  platform: string
  platformId: string
  zone: string
  ppd: number
  time: string
  ridersLeft: number
}

function generateOrder(): SimOrder {
  const platform = randomFrom(PLATFORMS)
  const zone = randomFrom(ZONES)
  const riders = randomInt(1, 80)
  const tier = riders <= 10 ? 'basic' : riders <= 50 ? 'standard' : 'surge'
  const mult = ZONE_MULTIPLIERS[zone] ?? 1.0
  const ppd = Math.round(TIERS[tier].basePPD * mult)
  return {
    id: crypto.randomUUID(),
    platform_id: platform.id,
    platform_name: platform.name,
    zone,
    riders_requested: riders,
    riders_confirmed: randomInt(0, riders),
    tier,
    ppd,
    total_cost: ppd * riders,
    status: randomFrom(['pending', 'active', 'active', 'fulfilled']),
    created_at: new Date().toISOString()
  }
}

function generateSlot(): GigSlot {
  const platform = randomFrom(PLATFORMS)
  const zone = randomFrom(ZONES)
  const mult = ZONE_MULTIPLIERS[zone] ?? 1.0
  const ppd = Math.round(platform.basePPD * mult) + randomInt(0, 5)
  const now = new Date()
  now.setMinutes(now.getMinutes() + randomInt(5, 90))
  return {
    id: crypto.randomUUID(),
    platform: platform.name,
    platformId: platform.id,
    zone,
    ppd,
    time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    ridersLeft: randomInt(1, 20)
  }
}

export function useSimulation() {
  const [liveOrders, setLiveOrders] = useState<SimOrder[]>(() =>
    Array.from({ length: 30 }, generateOrder)
  )
  const [gigSlots, setGigSlots] = useState<GigSlot[]>(() =>
    Array.from({ length: 12 }, generateSlot)
  )
  const tickRef = useRef(0)

  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current++

      // Every 4s: add a new order
      setLiveOrders(prev => {
        const updated = prev.map(o => {
          if (o.status === 'active' && Math.random() < 0.1) {
            return { ...o, riders_confirmed: Math.min(o.riders_confirmed + 1, o.riders_requested) }
          }
          if (o.status === 'pending' && Math.random() < 0.15) {
            return { ...o, status: 'active' as const }
          }
          return o
        })
        if (tickRef.current % 3 === 0) {
          return [generateOrder(), ...updated.slice(0, 79)]
        }
        return updated
      })

      // Every 10s: refresh slots
      if (tickRef.current % 5 === 0) {
        setGigSlots(prev => {
          const refreshed = prev.map(s =>
            Math.random() < 0.2
              ? generateSlot()
              : { ...s, ridersLeft: Math.max(0, s.ridersLeft - (Math.random() < 0.3 ? 1 : 0)) }
          )
          return [...refreshed.filter(s => s.ridersLeft > 0), generateSlot()].slice(0, 12)
        })
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return { liveOrders, gigSlots }
}
