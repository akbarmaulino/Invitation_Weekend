'use client'
import { useMemo } from 'react'
import IdeaCard from './IdeaCard'
import type { TripIdea, IdeaCategory, City, IdeaRating } from '@/types/types'

interface Props {
  ideas: TripIdea[]; categories: IdeaCategory[]; cities: City[]
  ideaRatings: Record<string, IdeaRating>; selectedIds: Set<string>
  searchQuery: string; tripDate: string
  onToggle: (id: string) => void; onViewDetail: (id: string) => void
}

export default function ActivityArea({ ideas, categories, cities, ideaRatings, selectedIds, searchQuery, tripDate, onToggle, onViewDetail }: Props) {
  if (!tripDate) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', borderRadius: 20, background: 'linear-gradient(135deg, #fff7ed, #c4e8ff)', border: '2px dashed #fca5a5' }}>
      <p style={{ fontSize: '2.5em', margin: '0 0 12px' }}>🗓️</p>
      <p style={{ fontWeight: 700, color: '#03254c', margin: '0 0 6px' }}>Pilih tanggal trip dulu yuk!</p>
      <p style={{ color: '#9ca3af', fontSize: '0.88em', margin: 0 }}>Isi tanggal di atas untuk mulai pilih aktivitas</p>
    </div>
  )

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return ideas
    const q = searchQuery.toLowerCase()
    return ideas.filter(i => i.idea_name?.toLowerCase().includes(q) || i.category_name?.toLowerCase().includes(q) || i.subtype_name?.toLowerCase().includes(q))
  }, [ideas, searchQuery])

  if (filtered.length === 0) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', borderRadius: 20, background: '#e1f3ff', border: '2px dashed #a8d8f0' }}>
      <p style={{ fontSize: '2em', margin: '0 0 8px' }}>🔍</p>
      <p style={{ color: '#03254c', fontWeight: 700, margin: 0 }}>Tidak ada hasil</p>
    </div>
  )

  const grouped = useMemo(() => {
    const cityMap: Record<string, { city: any; cats: Record<string, { cat: string; subtypes: Record<string, TripIdea[]> }> }> = {}
    filtered.forEach(idea => {
      const cityId = idea.city_id || '__none__'
      const city = cities.find(c => c.id === cityId) || null
      const catName = idea.category_name || 'Lainnya'
      const subtype = idea.subtype_name || 'Umum'
      if (!cityMap[cityId]) cityMap[cityId] = { city, cats: {} }
      if (!cityMap[cityId].cats[catName]) cityMap[cityId].cats[catName] = { cat: catName, subtypes: {} }
      if (!cityMap[cityId].cats[catName].subtypes[subtype]) cityMap[cityId].cats[catName].subtypes[subtype] = []
      cityMap[cityId].cats[catName].subtypes[subtype].push(idea)
    })
    return Object.values(cityMap).sort((a, b) => { if (!a.city) return 1; if (!b.city) return -1; return (a.city.display_order||0) - (b.city.display_order||0) })
  }, [filtered, cities])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {grouped.map(({ city, cats }) => (
        <div key={city?.id || '__none__'}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 2, background: 'linear-gradient(to right, #a8d8f0, transparent)' }} />
            <span style={{ fontWeight: 800, color: '#03254c', fontSize: '1em', padding: '4px 16px', background: '#e1f3ff', borderRadius: 999, border: '1.5px solid #a8d8f0' }}>📍 {city?.name || 'Tanpa Kota'}</span>
            <div style={{ flex: 1, height: 2, background: 'linear-gradient(to left, #a8d8f0, transparent)' }} />
          </div>
          {Object.values(cats).map(({ cat, subtypes }) => {
            const catSelected = Object.values(subtypes).flat().filter(i => selectedIds.has(i.id)).length
            return (
              <details key={cat} open style={{ marginBottom: 12 }}>
                <summary style={{ padding: '10px 16px', cursor: 'pointer', userSelect: 'none', borderRadius: 14, background: 'white', border: '2px solid #c4e8ff', fontWeight: 700, color: '#03254c', fontSize: '0.9em', display: 'flex', alignItems: 'center', gap: 8, listStyle: 'none', marginBottom: 2 }}>
                  <span style={{ flex: 1 }}>{cat}</span>
                  {catSelected > 0 && <span style={{ background: 'linear-gradient(135deg, #03254c, #1a4d7a)', color: 'white', borderRadius: 999, padding: '2px 10px', fontSize: '0.78em', fontWeight: 800 }}>{catSelected}</span>}
                </summary>
                <div style={{ paddingLeft: 8, paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Object.entries(subtypes).map(([sub, subIdeas]) => {
                    const subSelected = subIdeas.filter(i => selectedIds.has(i.id)).length
                    return (
                      <div key={sub}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <span style={{ fontSize: '0.78em', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 }}>{sub}</span>
                          {subSelected > 0 && <span style={{ background: '#c4e8ff', color: '#03254c', borderRadius: 999, padding: '1px 8px', fontSize: '0.72em', fontWeight: 800 }}>{subSelected} dipilih</span>}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                          {subIdeas.map(idea => <IdeaCard key={idea.id} idea={idea} isSelected={selectedIds.has(idea.id)} rating={ideaRatings[idea.id]} onToggle={onToggle} onViewDetail={onViewDetail} />)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </details>
            )
          })}
        </div>
      ))}
    </div>
  )
}