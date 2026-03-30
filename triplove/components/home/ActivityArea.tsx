'use client'
import { useMemo } from 'react'
import IdeaCard from './IdeaCard'
import type { TripIdea, IdeaCategory, City, IdeaRating } from '@/types/types'

const T = {
  navy: '#03254c', navyMid: '#1a4d7a',
  sky: '#c4e8ff', skyLight: '#e1f3ff', skyMid: '#a8d8f0',
  bg: '#d0efff', white: '#ffffff', muted: '#6b8cae',
}

interface Props {
  ideas: TripIdea[]; categories: IdeaCategory[]; cities: City[]
  ideaRatings: Record<string, IdeaRating>; selectedIds: Set<string>
  searchQuery: string; tripDate: string
  onToggle: (id: string) => void; onViewDetail: (id: string) => void
}

export default function ActivityArea({ ideas, categories, cities, ideaRatings, selectedIds, searchQuery, tripDate, onToggle, onViewDetail }: Props) {

  // ✅ Semua hooks di atas — tidak ada early return sebelum ini
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return ideas
    const q = searchQuery.toLowerCase()
    return ideas.filter(i =>
      i.idea_name?.toLowerCase().includes(q) ||
      i.category_name?.toLowerCase().includes(q) ||
      i.subtype_name?.toLowerCase().includes(q)
    )
  }, [ideas, searchQuery])

  const grouped = useMemo(() => {
    const cityMap: Record<string, { city: any; cats: Record<string, { cat: string; subtypes: Record<string, TripIdea[]> }> }> = {}
    filtered.forEach(idea => {
      const cityId  = idea.city_id || '__none__'
      const city    = cities.find(c => c.id === cityId) || null
      const catName = idea.category_name || 'Lainnya'
      const subtype = idea.subtype_name  || 'Umum'
      if (!cityMap[cityId]) cityMap[cityId] = { city, cats: {} }
      if (!cityMap[cityId].cats[catName]) cityMap[cityId].cats[catName] = { cat: catName, subtypes: {} }
      if (!cityMap[cityId].cats[catName].subtypes[subtype]) cityMap[cityId].cats[catName].subtypes[subtype] = []
      cityMap[cityId].cats[catName].subtypes[subtype].push(idea)
    })
    return Object.values(cityMap).sort((a, b) => {
      if (!a.city) return 1
      if (!b.city) return -1
      return (a.city.display_order || 0) - (b.city.display_order || 0)
    })
  }, [filtered, cities])

  // ✅ Early returns SETELAH semua hooks
  if (!tripDate) return (
    <div style={{ textAlign: 'center', padding: '56px 24px', borderRadius: 20, background: T.white, border: `2px dashed ${T.skyMid}` }}>
      <p style={{ fontSize: '2.5em', margin: '0 0 12px' }}>🗓️</p>
      <p style={{ fontWeight: 700, color: T.navy, margin: '0 0 5px', fontSize: '0.95em' }}>Pilih tanggal trip dulu yuk!</p>
      <p style={{ color: T.muted, fontSize: '0.82em', margin: 0 }}>Isi tanggal di atas untuk mulai pilih aktivitas</p>
    </div>
  )

  if (filtered.length === 0) return (
    <div style={{ textAlign: 'center', padding: '56px 24px', borderRadius: 20, background: T.white, border: `2px dashed ${T.skyMid}` }}>
      <p style={{ fontSize: '2em', margin: '0 0 8px' }}>🔍</p>
      <p style={{ color: T.navy, fontWeight: 700, margin: 0, fontSize: '0.93em' }}>Tidak ada hasil</p>
      <p style={{ color: T.muted, fontSize: '0.8em', margin: '5px 0 0' }}>Coba kata kunci lain</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <style>{`
        .hscroll::-webkit-scrollbar { height: 4px; }
        .hscroll::-webkit-scrollbar-track { background: transparent; }
        .hscroll::-webkit-scrollbar-thumb { background: ${T.skyMid}; border-radius: 99px; }
        .cat-header:hover { background: ${T.skyLight} !important; }
        details[open] > summary .cat-arrow { transform: rotate(90deg); }
        .cat-arrow { transition: transform .18s; display: inline-block; }
      `}</style>

      {grouped.map(({ city, cats }) => (
        <div key={city?.id || '__none__'}>

          {/* City pill header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0 6px' }}>
            <div style={{ flex: 1, height: 1.5, background: `linear-gradient(to right, ${T.skyMid}, transparent)` }} />
            <span style={{
              fontWeight: 800, color: T.navy, fontSize: '0.82em',
              padding: '5px 16px', background: T.white,
              borderRadius: 999, border: `1.5px solid ${T.skyMid}`,
              boxShadow: '0 1px 8px rgba(3,37,76,.08)',
              letterSpacing: 0.2,
            }}>
              📍 {city?.name || 'Tanpa Kota'}
            </span>
            <div style={{ flex: 1, height: 1.5, background: `linear-gradient(to left, ${T.skyMid}, transparent)` }} />
          </div>

          {/* Category blocks */}
          {Object.values(cats).map(({ cat, subtypes }) => {
            const totalSelected = Object.values(subtypes).flat().filter(i => selectedIds.has(i.id)).length
            const totalIdeas    = Object.values(subtypes).flat().length

            return (
              <details key={cat} open style={{ marginBottom: 6 }}>
                <summary className="cat-header" style={{
                  padding: '10px 14px',
                  cursor: 'pointer', userSelect: 'none',
                  borderRadius: 14,
                  background: T.white,
                  border: `1.5px solid ${T.sky}`,
                  fontWeight: 700, color: T.navy, fontSize: '0.87em',
                  display: 'flex', alignItems: 'center', gap: 8,
                  listStyle: 'none',
                  transition: 'background .15s',
                  marginBottom: 0,
                }}>
                  <span className="cat-arrow" style={{ color: T.muted, fontSize: '0.75em' }}>▶</span>
                  <span style={{ flex: 1 }}>{cat}</span>
                  <span style={{ color: T.muted, fontSize: '0.72em', fontWeight: 500 }}>{totalIdeas} tempat</span>
                  {totalSelected > 0 && (
                    <span style={{
                      background: `linear-gradient(135deg, ${T.navy}, ${T.navyMid})`,
                      color: T.white, borderRadius: 999,
                      padding: '2px 10px', fontSize: '0.72em', fontWeight: 800,
                    }}>{totalSelected} dipilih</span>
                  )}
                </summary>

                {/* Subtypes as horizontal scroll rows */}
                <div style={{
                  background: T.skyLight,
                  borderRadius: '0 0 14px 14px',
                  border: `1.5px solid ${T.sky}`,
                  borderTop: 'none',
                  padding: '10px 0 4px',
                }}>
                  {Object.entries(subtypes).map(([sub, subIdeas]) => {
                    const subSelected = subIdeas.filter(i => selectedIds.has(i.id)).length
                    return (
                      <div key={sub} style={{ marginBottom: 10 }}>
                        {/* Subtype label row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 14px', marginBottom: 8 }}>
                          <div style={{ width: 3, height: 12, borderRadius: 99, background: T.skyMid, flexShrink: 0 }} />
                          <span style={{ fontSize: '0.7em', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.8 }}>{sub}</span>
                          {subSelected > 0 && (
                            <span style={{ background: T.sky, color: T.navy, borderRadius: 999, padding: '1px 8px', fontSize: '0.68em', fontWeight: 800, border: `1px solid ${T.skyMid}` }}>
                              {subSelected} dipilih
                            </span>
                          )}
                        </div>

                        {/* Horizontal scroll of cards */}
                        <div className="hscroll" style={{
                          display: 'flex', gap: 10,
                          overflowX: 'auto',
                          paddingLeft: 14, paddingRight: 14,
                          paddingBottom: 6,
                          scrollSnapType: 'x mandatory',
                        }}>
                          {subIdeas.map(idea => (
                            <div key={idea.id} style={{ scrollSnapAlign: 'start', flexShrink: 0, width: 150 }}>
                              <IdeaCard
                                idea={idea}
                                isSelected={selectedIds.has(idea.id)}
                                rating={ideaRatings[idea.id]}
                                onToggle={onToggle}
                                onViewDetail={onViewDetail}
                              />
                            </div>
                          ))}
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