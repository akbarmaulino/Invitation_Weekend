'use client'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const T = { sky: '#c4e8ff', skyLight: '#e1f3ff', muted: '#6b8cae' }

export default function MapPreview({ lat, lon, name }: { lat: string; lon: string; name: string }) {
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

  if (!mounted) return (
    <div style={{ height: 220, borderRadius: 14, background: T.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, fontSize: '0.85em' }}>
      🗺️ Memuat peta...
    </div>
  )

  const position: [number, number] = [parseFloat(lat), parseFloat(lon)]

  return (
    <div style={{ height: 220, borderRadius: 14, overflow: 'hidden', border: `2px solid ${T.sky}` }}>
      <MapContainer center={position} zoom={16} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>{name}</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}