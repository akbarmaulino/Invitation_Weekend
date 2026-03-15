import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query') || ''
  const ll = searchParams.get('ll') || ''
  const radius = searchParams.get('radius') || '5000'

  let userLat = -6.2088, userLon = 106.8456

  if (ll) {
    const [la, lo] = ll.split(',')
    userLat = parseFloat(la)
    userLon = parseFloat(lo)
  }

  function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2)**2
    return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  }

  try {
    const radiusKm = parseFloat(radius) / 1000
    const degOffset = radiusKm / 111

    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '20',
      addressdetails: '1',
      extratags: '1',
      namedetails: '1',
      'accept-language': 'id',
      viewbox: `${userLon - degOffset},${userLat + degOffset},${userLon + degOffset},${userLat - degOffset}`,
      bounded: '1',
    })

    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: {
        'User-Agent': 'triplove-app/1.0',
        'Accept': 'application/json',
      }
    })

    let data = await res.json()

    // Kalau bounded tidak ada hasil, coba tanpa bounded (fallback)
    if (!data.length) {
      params.set('bounded', '0')
      params.delete('viewbox')
      const res2 = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: {
          'User-Agent': 'triplove-app/1.0',
          'Accept': 'application/json',
        }
      })
      data = await res2.json()
    }

    const results = data
      .map((item: any) => ({
        place_id: item.place_id,
        name: item.namedetails?.name || item.display_name.split(',')[0],
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon,
        class: item.class || '',
        type: item.type || '',
        distanceM: calcDistance(userLat, userLon, parseFloat(item.lat), parseFloat(item.lon))
      }))
      .sort((a: any, b: any) => a.distanceM - b.distanceM)
      .slice(0, 8)

    return NextResponse.json({ results })
  } catch (err) {
    console.error('Nominatim error:', err)
    return NextResponse.json({ error: 'Failed to fetch places' }, { status: 500 })
  }
}