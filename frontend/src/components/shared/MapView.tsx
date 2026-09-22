import { useEffect, useRef, useMemo } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  ZoomControl,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import { Navigation } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MapMarker {
  id: string
  latitude: number
  longitude: number
  title?: string
  subtitle?: string
  isWorker?: boolean
  stopNumber?: number
  actionUrl?: string
  actionLabel?: string
}

export interface MapViewProps {
  latitude: number
  longitude: number
  label?: string
  markers?: MapMarker[]
  routeCoordinates?: [number, number][]
  autoFitBounds?: boolean
  showCenterMarker?: boolean
  showCoordinatesBanner?: boolean
  className?: string
  zoom?: number
  interactive?: boolean
  onLocationChange?: (lat: number, lng: number) => void
}

const CARTO_API_KEY = (import.meta as any).env?.VITE_CARTO_API_KEY || 'cb1_3l6g_2_8e048f2eaf9287ce2076c39f'

// Helper to generate realistic street waypoints between start and end
export function generateTransitRoute(
  start: [number, number],
  end: [number, number]
): [number, number][] {
  const [startLat, startLng] = start
  const [endLat, endLng] = end
  const dLat = endLat - startLat
  const dLng = endLng - startLng

  return [
    start,
    [startLat + dLat * 0.4, startLng + dLng * 0.15],
    [startLat + dLat * 0.52, startLng + dLng * 0.6],
    [startLat + dLat * 0.82, startLng + dLng * 0.75],
    end,
  ]
}

// Custom Leaflet SVG DivIcons matching design tokens & prototype
const createCenterPinIcon = () =>
  L.divIcon({
    className: 'pro-marker-target-container',
    html: `
      <div class="pro-marker-target">
        <svg viewBox="0 0 30 38" width="30" height="38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="centerPinG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#F2B705" />
              <stop offset="100%" stop-color="#D97706" />
            </linearGradient>
          </defs>
          <path d="M15 37C15 37 28 23.5 28 14C28 6.8203 22.1797 1 15 1C7.8203 1 2 6.8203 2 14C2 23.5 15 37 15 37Z" fill="url(#centerPinG)" stroke="#ffffff" stroke-width="2"/>
          <circle cx="15" cy="14" r="5" fill="#0f172a" />
        </svg>
      </div>
    `,
    iconSize: [30, 38],
    iconAnchor: [15, 37],
    popupAnchor: [0, -36],
  })

const createNumberedStopIcon = (num: number, title?: string) =>
  L.divIcon({
    className: 'pro-marker-stop-container',
    html: `
      <div class="pro-marker-stop" title="${title || `Stop #${num}`}" style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:#0f172a;color:#ffffff;font-weight:900;font-size:12px;border:2.5px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.3);">
        ${num}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  })

const createWorkerIcon = (title?: string) =>
  L.divIcon({
    className: 'pro-marker-worker-container',
    html: `
      <div class="pro-marker-worker" title="${title || 'Cooperative Worker'}">
        <span class="pro-worker-ring"></span>
        <div class="pro-worker-core">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })

// Invalidate and recalculate Leaflet map bounds on container load/resize
function MapResizer() {
  const map = useMap()

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 150)

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize()
    })

    const container = map.getContainer()
    if (container) {
      resizeObserver.observe(container)
    }

    return () => {
      clearTimeout(timer)
      resizeObserver.disconnect()
    }
  }, [map])

  return null
}

// Helper component to smoothly re-center map without resetting user's manual zoom
function ChangeMapView({ center }: { center: [number, number] }) {
  const map = useMap()
  const prevCenterRef = useRef<[number, number]>(center)

  useEffect(() => {
    const [prevLat, prevLng] = prevCenterRef.current
    const [newLat, newLng] = center
    if (Math.abs(prevLat - newLat) > 0.0001 || Math.abs(prevLng - newLng) > 0.0001) {
      map.panTo(center, { animate: true })
      prevCenterRef.current = center
    }
  }, [center, map])

  return null
}

// Helper component to auto-fit map view bounds
function MapBoundsFitter({ points }: { points: [number, number][] }) {
  const map = useMap()
  const prevPointsRef = useRef<string>('')

  useEffect(() => {
    if (points.length < 2) return
    const key = points.map((p) => `${p[0].toFixed(4)},${p[1].toFixed(4)}`).join(';')
    if (key === prevPointsRef.current) return
    prevPointsRef.current = key

    try {
      const bounds = L.latLngBounds(points.map(([lat, lng]) => L.latLng(lat, lng)))
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16, animate: true })
    } catch {
      // ignore
    }
  }, [points, map])

  return null
}

// Click on map to relocate pin when interactive
function MapClickHandler({ onLocationChange }: { onLocationChange?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onLocationChange) {
        onLocationChange(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

export function MapView({
  latitude,
  longitude,
  label,
  markers = [],
  routeCoordinates,
  autoFitBounds = false,
  showCenterMarker = true,
  showCoordinatesBanner = true,
  className,
  zoom = 15,
  interactive = false,
  onLocationChange,
}: MapViewProps) {
  const center: [number, number] = [latitude, longitude]

  // Collect points for auto bounds fit if requested
  const boundsPoints = useMemo(() => {
    if (!autoFitBounds) return []
    const pts: [number, number][] = []
    if (routeCoordinates && routeCoordinates.length > 0) {
      pts.push(...routeCoordinates)
    } else {
      if (showCenterMarker) pts.push(center)
      for (const m of markers) {
        pts.push([m.latitude, m.longitude])
      }
    }
    return pts
  }, [autoFitBounds, routeCoordinates, showCenterMarker, center, markers])

  const markerEventHandlers = useMemo(
    () => ({
      dragend(e: any) {
        if (onLocationChange) {
          const latLng = e.target.getLatLng()
          onLocationChange(latLng.lat, latLng.lng)
        }
      },
    }),
    [onLocationChange]
  )

  return (
    <div className={cn('relative rounded-xl border border-border overflow-hidden bg-slate-100 min-h-[220px]', className)}>
      {/* Top Floating Coordinates Banner */}
      {showCoordinatesBanner && (
        <div className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border shadow-xs text-xs font-mono tabular-nums text-foreground pointer-events-none">
          <Navigation className="w-3.5 h-3.5 text-primary" />
          <span>{latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E</span>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        zoomControl={false}
        attributionControl={false}
        className="w-full h-full min-h-[inherit] z-0"
      >
        <MapResizer />
        <ChangeMapView center={center} />
        {boundsPoints.length >= 2 && <MapBoundsFitter points={boundsPoints} />}
        {interactive && onLocationChange && (
          <MapClickHandler onLocationChange={onLocationChange} />
        )}
        <ZoomControl position="bottomright" />

        {/* CartoDB Voyager */}
        <TileLayer
          url={`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`}
          subdomains="abcd"
          maxZoom={20}
        />

        {/* Driving Route Polyline */}
        {routeCoordinates && routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: '#0f172a',
              weight: 4.5,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}

        {/* Center Target Marker */}
        {showCenterMarker && (
          <Marker
            position={center}
            icon={createCenterPinIcon()}
            draggable={Boolean(interactive && onLocationChange)}
            eventHandlers={markerEventHandlers}
          >
            {label && (
              <Popup>
                <div className="pro-popup-card">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold tracking-wider text-amber-700 dark:text-amber-400 uppercase">Service Location</span>
                  </div>
                  <div className="text-xs font-bold text-foreground">{label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Customer Delivery Doorstep</div>
                </div>
              </Popup>
            )}
          </Marker>
        )}

        {/* Custom / Multiple Markers */}
        {markers.map((m) => {
          const icon = m.stopNumber
            ? createNumberedStopIcon(m.stopNumber, m.title)
            : m.isWorker
            ? createWorkerIcon(m.title)
            : createCenterPinIcon()

          return (
            <Marker
              key={m.id}
              position={[m.latitude, m.longitude]}
              icon={icon}
            >
              <Popup>
                <div className="pro-popup-card">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      {m.stopNumber ? `Stop #${m.stopNumber}` : m.isWorker ? 'Cooperative Worker' : 'Service Location'}
                    </span>
                    {m.isWorker && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">Active</span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-foreground mb-0.5">{m.title || 'Location'}</div>
                  {m.subtitle && (
                    <div className="text-[11px] text-muted-foreground">{m.subtitle}</div>
                  )}
                  {m.actionUrl && (
                    <div className="mt-2 pt-1.5 border-t border-border">
                      <a
                        href={m.actionUrl}
                        className="text-xs font-bold text-primary hover:underline block"
                      >
                        {m.actionLabel || 'Open Job →'}
                      </a>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
