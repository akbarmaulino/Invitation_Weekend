'use client'

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { City, IdeaCategory, TripIdea, IdeaReview, IdeaRating } from '@/types/types'

interface DataContextType {
  ideas: TripIdea[]
  categories: IdeaCategory[]
  cities: City[]
  reviews: IdeaReview[]
  ideaRatings: Record<string, IdeaRating>
  loading: boolean
  loadAllData: () => Promise<void>
  loadReviews: () => Promise<void>
}

const DataContext = createContext<DataContextType>({
  ideas: [], categories: [], cities: [], reviews: [],
  ideaRatings: {}, loading: false,
  loadAllData: async () => {}, loadReviews: async () => {},
})

function computeRatings(list: IdeaReview[]): Record<string, IdeaRating> {
  const map: Record<string, { total: number; count: number }> = {}
  list.forEach(r => {
    if (!r.idea_id) return
    if (!map[r.idea_id]) map[r.idea_id] = { total: 0, count: 0 }
    map[r.idea_id].total += r.rating || 0
    map[r.idea_id].count += 1
  })
  const out: Record<string, IdeaRating> = {}
  for (const id in map) {
    out[id] = { average: (map[id].total / map[id].count).toFixed(1), count: map[id].count }
  }
  return out
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [ideas, setIdeas]             = useState<TripIdea[]>([])
  const [categories, setCategories]   = useState<IdeaCategory[]>([])
  const [cities, setCities]           = useState<City[]>([])
  const [reviews, setReviews]         = useState<IdeaReview[]>([])
  const [ideaRatings, setIdeaRatings] = useState<Record<string, IdeaRating>>({})
  const [loading, setLoading]         = useState(false)
  const loadingRef                    = useRef(false)

  const loadAllData = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    try {
      const [citiesRes, catsRes, ideasRes, reviewsRes] = await Promise.all([
        supabase.from('cities').select('*').order('display_order', { ascending: true }),
        supabase.from('idea_categories').select('*'),
        supabase.from('trip_ideas_v2').select('*, idea_categories(category, subtype, icon, photo_url)').order('created_at', { ascending: false }),
        supabase.from('idea_reviews').select('*'),
      ])

      setCities((citiesRes.data as City[]) || [])
      setCategories((catsRes.data as IdeaCategory[]) || [])

      const mapped: TripIdea[] = ((ideasRes.data as any[]) || []).map(i => ({
        ...i,
        category_name: i.idea_categories?.category,
        subtype_name:  i.idea_categories?.subtype,
        icon:          i.idea_categories?.icon,
        photo_url_category: i.idea_categories?.photo_url,
      }))
      const unique = new Map<string, TripIdea>()
      mapped.forEach(i => {
        const key = i.idea_name ? `${i.type_key}_${i.idea_name.toLowerCase().trim()}` : i.id
        if (!unique.has(key)) unique.set(key, i)
      })
      setIdeas(Array.from(unique.values()))

      const r = (reviewsRes.data as IdeaReview[]) || []
      setReviews(r)
      setIdeaRatings(computeRatings(r))
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [])

  const loadReviews = useCallback(async () => {
    const { data } = await supabase.from('idea_reviews').select('*')
    const r = (data as IdeaReview[]) || []
    setReviews(r)
    setIdeaRatings(computeRatings(r))
  }, [])

  return (
    <DataContext.Provider value={{ ideas, categories, cities, reviews, ideaRatings, loading, loadAllData, loadReviews }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)