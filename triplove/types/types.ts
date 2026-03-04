// types/types.ts — shared types untuk semua komponen TripLove

export interface City {
  id: string
  name: string
  display_order: number
}

export interface IdeaCategory {
  id: number
  category: string
  subtype: string
  type_key: string
  icon: string
  photo_url: string | null
}

export interface TripIdea {
  id: string
  idea_name: string
  type_key?: string        // ← tambah ?
  day_of_week?: string | null
  photo_url?: string | null
  city_id?: string | null
  address?: string | null
  maps_url?: string | null
  phone?: string | null
  opening_hours?: string | null
  price_range?: string | null
  website?: string | null
  notes?: string | null
  locations?: IdeaLocation[] | null
  created_at?: string
  // Computed from join
  category_name?: string
  city_name?: string
  subtype_name?: string
  icon?: string
  photo_url_category?: string | null
}



export interface IdeaLocation {
  name: string
  address: string | null
  maps_url: string | null
  phone: string | null
  opening_hours: string | null
  price_range: string | null
  website: string | null
  notes: string | null
}

export interface IdeaReview {
  id: number
  idea_id: string
  trip_id: string | null
  user_id: string
  review_text: string | null
  rating: number
  photo_url: string[] | null
  video_url: string | null
  reviewer_name: string | null
  created_at: string
}

export interface IdeaRating {
  average: string
  count: number
}

export interface TripHistory {
  id: string
  user_id: string
  trip_date: string
  trip_day: string
  selection_json: TripSelection[]
  secret_message: string | null
  created_at?: string
}

export interface TripSelection {
  idea_id: string | null
  name: string
  category: string
  subtype: string
}

export interface TripInvitation {
  id: string
  trip_id: string
  token: string
  invited_email: string | null
  inviter_name: string
  invitation_message: string | null
  expires_at: string
  max_uses: number
  use_count: number
  status: 'pending' | 'used' | 'expired'
  used_at: string | null
  created_at: string
}

// localStorage selection format (used in index/summary)
export interface LocalSelection {
  ideaId: string
  name: string
  cat: string
  subtype: string
}