'use client'
// RiderDispatchMap — shown immediately when rider accepts an order
// Ola/Uber style: live map, OTP, ETA, traffic, rider info panel
// Uses Google Maps JS API

import { useEffect, useRef, useState, useCallback } from 'react'
import type { DispatchEvent, Order, Rider } from '@/lib/data/types'

const GOOGLE_MAPS_KEY = 'AIzaSyBehvWFFhi6B5qQDJ89jnJjlJFPAFncns0'

interface RiderDispatchMapProps {
  order: Order
  rider: Rider
  dispatchEvent: DispatchEvent
  onOTPVerified: () => void
  onDelivered: () => void
  onCancel: () => void
}

declare global {
  interface Window {
    google: any
    initGigShiftMap: () => void
  }
}

export function RiderDispatchMap({ order, rider, dispatchEvent, onOTPVerified, onDelivered, onCancel }: RiderDispatchMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const routeRef = useRef<any>(null)
  const [otpInput, setOtpInput] = useState('')
  const [otpError, setOtpError] = useState('')
  const [otpVerified, setOtpVerified] = useState(dispatchEvent.otp_verified)
  const [eta, setEta] = useState(dispatchEvent.estimated_minutes ?? 12)
  const [status, setStatus] = useState<'heading_to_pickup' | 'waiting_otp' | 'en_route' | 'delivered'>('heading_to_pickup')
  const [mapLoaded, setMapLoaded] = useState(false)

  // Load Google Maps script once
  useEffect(() => {
    if (window.google?.maps) { setMapLoaded(true); return }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places,geometry&callback=initGigShiftMap`
    script.async = true
    window.initGigShiftMap = () => setMapLoaded(true)
    document.head.appendChild(script)
    return () => { window.initGigShiftMap = () => {} }
  }, [])

  // Init map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return

    const center = {
      lat: dispatchEvent.pickup_lat ?? 12.9716,
      lng: dispatchEvent.pickup_lng ?? 77.5946
    }

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 15,
      disableDefaultUI: true,
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
        { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#e8e8e8' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] },
      ]
    })

    // Rider marker (green dot)
    markerRef.current = new window.google.maps.Marker({
      position: { lat: rider.latitude ?? center.lat, lng: rider.longitude ?? center.lng },
      map: mapInstance.current,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#059669',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      },
      title: rider.name
    })

    // Pickup marker
    new window.google.maps.Marker({
      position: center,
      map: mapInstance.current,
      icon: {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: '#EF4444',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 1,
        scale: 1.5,
        anchor: new window.google.maps.Point(12, 24)
      },
      title: 'Pickup Point'
    })

    // Draw route
    if (dispatchEvent.dropoff_lat && dispatchEvent.dropoff_lng) {
      const directionsService = new window.google.maps.DirectionsService()
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#059669',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      })
      directionsRenderer.setMap(mapInstance.current)
      routeRef.current = directionsRenderer

      directionsService.route({
        origin: { lat: rider.latitude ?? center.lat, lng: rider.longitude ?? center.lng },
        destination: { lat: dispatchEvent.pickup_lat!, lng: dispatchEvent.pickup_lng! },
        travelMode: window.google.maps.TravelMode.DRIVING
      }, (result: any, status: any) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result)
          const leg = result.routes[0]?.legs[0]
          if (leg?.duration) {
            setEta(Math.ceil(leg.duration.value / 60))
          }
        }
      })
    }
  }, [mapLoaded, rider, dispatchEvent])

  // Simulate rider moving toward pickup every 4s
  useEffect(() => {
    if (!mapLoaded || !markerRef.current) return
    const interval = setInterval(() => {
      setEta(prev => Math.max(0, prev - 1))
    }, 4000)
    return () => clearInterval(interval)
  }, [mapLoaded])

  const handleOTPVerify = useCallback(() => {
    if (otpInput === dispatchEvent.otp) {
      setOtpVerified(true)
      setStatus('en_route')
      setOtpError('')
      onOTPVerified()
    } else {
      setOtpError('Wrong OTP. Try again.')
    }
  }, [otpInput, dispatchEvent.otp, onOTPVerified])

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-white dark:bg-[#0C0C0C]">
      {/* Map takes most of screen */}
      <div className="flex-1 relative">
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F9FAFB] dark:bg-[#111827]">
            <div className="text-sm text-[#6B7280]">Loading map...</div>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />

        {/* Top bar — back + order info */}
        <div className="absolute top-4 left-4 right-4 flex items-center gap-3">
          <button
            onClick={onCancel}
            className="w-10 h-10 rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] flex items-center justify-center shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="flex-1 bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] rounded-xl px-4 py-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#6B7280]">{order.platform_name}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${otpVerified ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-[#FEF3C7] text-[#D97706]'}`}>
                {otpVerified ? 'En Route' : 'Heading to Pickup'}
              </span>
            </div>
            <div className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB] mt-0.5">
              {order.zone}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom panel */}
      <div className="bg-white dark:bg-[#111827] border-t border-[#E5E7EB] dark:border-[#1F2937] px-4 pt-4 pb-6">
        {/* ETA + PPD */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-[#111827] dark:text-[#F9FAFB]">{eta} min</div>
            <div className="text-xs text-[#6B7280]">Estimated arrival</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#059669]">₹{order.ppd}</div>
            <div className="text-xs text-[#6B7280]">Your earning</div>
          </div>
        </div>

        {/* OTP section — only before verification */}
        {!otpVerified && (
          <div className="mb-4">
            <div className="text-xs font-medium text-[#6B7280] mb-2">Enter OTP from customer</div>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={4}
                value={otpInput}
                onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="0000"
                className="flex-1 rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] bg-[#F9FAFB] dark:bg-[#0C0C0C] px-3 py-2.5 text-center text-lg font-mono font-bold text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:border-[#059669]"
              />
              <button
                onClick={handleOTPVerify}
                disabled={otpInput.length !== 4}
                className="px-5 py-2.5 rounded-lg bg-[#059669] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#047857] transition-colors"
              >
                Verify
              </button>
            </div>
            {otpError && <p className="text-xs text-[#EF4444] mt-1.5">{otpError}</p>}
            <p className="text-[10px] text-[#6B7280] mt-1">OTP: {dispatchEvent.otp} (shown for demo)</p>
          </div>
        )}

        {/* Mark delivered — after OTP */}
        {otpVerified && (
          <button
            onClick={onDelivered}
            className="w-full py-3.5 rounded-xl bg-[#059669] text-white font-semibold text-sm hover:bg-[#047857] transition-colors"
          >
            Mark as Delivered
          </button>
        )}

        {/* Traffic info pill */}
        <div className="mt-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
          <span className="text-xs text-[#6B7280]">Moderate traffic on route — +3 min</span>
        </div>
      </div>
    </div>
  )
}
