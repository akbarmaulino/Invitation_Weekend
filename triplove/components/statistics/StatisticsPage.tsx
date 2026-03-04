'use client'

import { useMemo } from 'react'
import Navbar from '@/components/ui/Navbar'
import { useData } from '@/context/DataContext'
import { useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts'

const P = '#03254c', S = '#c4e8ff', BG = '#d0efff', BGM = '#e1f3ff'
const MUTED = '#a0a0b5', WHITE = '#ffffff'
const COLORS = ['#03254c','#1a4d7a','#2e7d9e','#4a90b8','#6db3d4','#8ecce8','#aad8f0','#c4e8ff']

const card: React.CSSProperties = {
  background: WHITE, borderRadius: 20, border: `2px solid ${S}`,
  boxShadow: '0 4px 12px rgba(3,37,76,0.08)', padding: 24,
}

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

export default function StatisticsPage() {
  const { ideas, reviews, loading, loadAllData } = useData()

  useEffect(() => { loadAllData() }, [])

  // ── Computed stats ──────────────────────────────────────────

  const totalStats = useMemo(() => ({
    trips:      new Set(reviews.map(r => r.trip_id).filter(Boolean)).size,
    ideas:      ideas.length,
    reviews:    reviews.length,
    avgRating:  reviews.length ? (reviews.reduce((s,r) => s+(r.rating||0),0)/reviews.length).toFixed(1) : '—',
  }), [ideas, reviews])

  // Trip per month (last 12 months)
  const tripsByMonth = useMemo(() => {
    const map: Record<string, Set<string>> = {}
    reviews.forEach(r => {
      if (!r.trip_id || !r.created_at) return
      const d = new Date(r.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      if (!map[key]) map[key] = new Set()
      map[key].add(r.trip_id)
    })
    const now = new Date()
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      return { name: MONTHS[d.getMonth()], trips: map[key]?.size || 0 }
    })
  }, [reviews])

  // Category breakdown
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {}
    ideas.forEach(i => {
      const cat = i.category_name || 'Lainnya'
      map[cat] = (map[cat] || 0) + 1
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value)
      .slice(0, 8)
  }, [ideas])

  // Top rated ideas
  const topRated = useMemo(() => {
    const map: Record<string, { name: string; total: number; count: number; cat: string }> = {}
    reviews.forEach(r => {
      if (!r.idea_id || !r.rating) return
      const idea = ideas.find(i => i.id === r.idea_id)
      if (!idea) return
      if (!map[r.idea_id]) map[r.idea_id] = { name: idea.idea_name, total: 0, count: 0, cat: idea.category_name||'' }
      map[r.idea_id].total += r.rating
      map[r.idea_id].count += 1
    })
    return Object.values(map)
      .map(v => ({ ...v, avg: v.total/v.count }))
      .filter(v => v.count >= 1)
      .sort((a,b) => b.avg - a.avg)
      .slice(0, 10)
  }, [ideas, reviews])

  // Rating trend (avg per month)
  const ratingTrend = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {}
    reviews.forEach(r => {
      if (!r.rating || !r.created_at) return
      const d = new Date(r.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      if (!map[key]) map[key] = { total: 0, count: 0 }
      map[key].total += r.rating
      map[key].count += 1
    })
    const now = new Date()
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      const v = map[key]
      return { name: MONTHS[d.getMonth()], rating: v ? parseFloat((v.total/v.count).toFixed(2)) : null }
    })
  }, [reviews])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${BG}, ${BGM})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 44, height: 44, border: `4px solid ${S}`, borderTopColor: P, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style dangerouslySetInnerHTML={{__html:'@keyframes spin{to{transform:rotate(360deg)}}'}} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${BG}, ${BGM})` }}>

      {/* Header */}
      <Navbar />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Page title */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <h1 style={{ fontWeight: 900, fontSize: '2em', color: P, margin: '0 0 8px' }}>📊 Statistics</h1>
          <p style={{ color: MUTED, margin: 0 }}>Semua data perjalanan kalian dalam satu tempat</p>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
          {[
            { icon: '🗓️', value: totalStats.trips,   label: 'Total Trip'       },
            { icon: '📍', value: totalStats.ideas,   label: 'Total Ide'        },
            { icon: '📝', value: totalStats.reviews, label: 'Total Review'     },
            { icon: '⭐', value: totalStats.avgRating, label: 'Avg Rating'     },
          ].map(s => (
            <div key={s.label} style={{ ...card, display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: '2em' }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: '1.9em', fontWeight: 900, color: P, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.75em', color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Trip per month */}
        <div style={card}>
          <h2 style={{ fontWeight: 800, color: P, margin: '0 0 20px', fontSize: '1.05em' }}>🗓️ Trip per Bulan (12 bulan terakhir)</h2>
          {totalStats.trips === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={tripsByMonth} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: `1.5px solid ${S}`, fontSize: '0.85em' }} />
                <Bar dataKey="trips" name="Trip" fill={P} radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category + Top rated */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>

          {/* Category pie */}
          <div style={card}>
            <h2 style={{ fontWeight: 800, color: P, margin: '0 0 20px', fontSize: '1.05em' }}>🗂️ Kategori Terbanyak</h2>
            {categoryData.length === 0 ? <EmptyChart /> : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: `1.5px solid ${S}`, fontSize: '0.82em' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                  {categoryData.slice(0,5).map((d,i) => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i%COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: '0.8em', color: P, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                      <span style={{ fontSize: '0.8em', fontWeight: 700, color: MUTED }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Top rated */}
          <div style={card}>
            <h2 style={{ fontWeight: 800, color: P, margin: '0 0 20px', fontSize: '1.05em' }}>🏆 Top Rated Places</h2>
            {topRated.length === 0 ? <EmptyChart /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {topRated.slice(0,7).map((place, i) => (
                  <div key={place.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: i < 3 ? P : BGM,
                      color: i < 3 ? WHITE : MUTED,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.72em', fontWeight: 800,
                    }}>{i+1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85em', color: P, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place.name}</p>
                      <p style={{ margin: 0, fontSize: '0.73em', color: MUTED }}>{place.cat}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.85em', fontWeight: 800, color: '#f59e0b' }}>⭐ {place.avg.toFixed(1)}</div>
                      <div style={{ fontSize: '0.7em', color: MUTED }}>{place.count}x</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rating trend */}
        <div style={card}>
          <h2 style={{ fontWeight: 800, color: P, margin: '0 0 20px', fontSize: '1.05em' }}>📈 Tren Rating (12 bulan terakhir)</h2>
          {totalStats.reviews === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={ratingTrend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={S} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,5]} tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: `1.5px solid ${S}`, fontSize: '0.85em' }} />
                <Line type="monotone" dataKey="rating" name="Avg Rating" stroke={P} strokeWidth={2.5} dot={{ fill: P, r: 4 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

      </main>
    </div>
  )
}

function EmptyChart() {
  return (
    <div style={{ height: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#a0a0b5', gap: 8, border: '2px dashed #c4e8ff', borderRadius: 14 }}>
      <span style={{ fontSize: '1.8em' }}>📭</span>
      <span style={{ fontSize: '0.85em', fontWeight: 600 }}>Belum ada data</span>
    </div>
  )
}