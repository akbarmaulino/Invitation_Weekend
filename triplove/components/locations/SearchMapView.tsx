'use client'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const T = { sky: '#c4e8ff', navy: '#03254c', white: '#ffffff' }

interface Result {
  place_id: string | number
  name: string
  display_name: string
  lat: string
  lon: string
}

function FlyTo({ hoveredId, results }: { hoveredId: string | number | null; results: Result[] }) {
  const map = useMap()
  useEffect(() => {
    if (!hoveredId) return
    const r = results.find(r => r.place_id === hoveredId)
    const la = parseFloat(r?.lat || '')
    const lo = parseFloat(r?.lon || '')
    if (isFinite(la) && isFinite(lo)) {
      map.flyTo([la, lo], 16, { duration: 0.8 })
    }
  }, [hoveredId])
  return null
}

export default function SearchMapView({ results, hoveredId, onHover, onSelect }: {
  results: Result[]
  hoveredId: string | number | null
  onHover: (id: string | number | null) => void
  onSelect: (r: any) => void
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const L = require('leaflet')
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    })
  }, [])

  if (!mounted || !results[0]?.lat) return (
    <div style={{ height: 300, background: '#e1f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b8cae', fontSize: '0.85em' }}>
      🗺️ Memuat peta...
    </div>
  )

  const center: [number, number] = [parseFloat(results[0].lat), parseFloat(results[0].lon)]

  return (
    <MapContainer center={center} zoom={14} style={{ height: '100%', minHeight: 220, width: '100%' }} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo hoveredId={hoveredId} results={results} />
      {results.map((r) => {
        if (!r.lat || !r.lon) return null
        const la = parseFloat(r.lat)
        const lo = parseFloat(r.lon)
        if (!isFinite(la) || !isFinite(lo)) return null
        const pos: [number, number] = [la, lo]
        return (
          <Marker
            key={r.place_id}
            position={pos}
            eventHandlers={{
              mouseover: () => onHover(r.place_id),
              mouseout: () => onHover(null),
              click: () => onSelect(r),
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'inherit', minWidth: 140 }}>
                <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '0.88em', color: T.navy }}>{r.name}</p>
                <p style={{ margin: '0 0 8px', fontSize: '0.75em', color: '#6b8cae' }}>{r.display_name}</p>
                <button
                  onClick={() => onSelect(r)}
                  style={{ padding: '5px 12px', borderRadius: 999, background: T.navy, color: T.white, border: 'none', cursor: 'pointer', fontSize: '0.78em', fontWeight: 700, width: '100%' }}
                >+ Tambah</button>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}