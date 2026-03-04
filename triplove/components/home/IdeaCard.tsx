'use client'
import Image from 'next/image'
import { useState } from 'react'
import { c, shadow, radius } from '@/lib/theme'
import { getPublicImageUrl } from '@/lib/utils'
import type { TripIdea, IdeaRating } from '@/types/types'

interface Props {
  idea: TripIdea
  isSelected: boolean
  rating?: IdeaRating
  onToggle: (id: string) => void
  onViewDetail: (id: string) => void
}

export default function IdeaCard({ idea, isSelected, rating, onToggle, onViewDetail }: Props) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      data-ideaid={idea.id}
      onClick={() => onToggle(idea.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        cursor: 'pointer',
        borderRadius: radius.xl,
        border: `2.5px solid ${isSelected ? '#03254c' : hovered ? '#a8d8f0' : '#c4e8ff'}`,
        background: isSelected ? '#e1f3ff' : c.white,
        boxShadow: isSelected ? '0 4px 16px rgba(168,85,247,0.2)' : hovered ? shadow.sm : 'none',
        transform: hovered && !isSelected ? 'translateY(-2px)' : isSelected ? 'translateY(-3px)' : 'none',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* Selected badge */}
      {isSelected && (
        <div style={{
          position: 'absolute', top: 8, left: 8, zIndex: 10,
          width: 26, height: 26, borderRadius: '50%',
          background: 'linear-gradient(135deg, #03254c, #1a4d7a)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75em', fontWeight: 800,
          boxShadow: '0 2px 8px rgba(168,85,247,0.4)',
        }}>✓</div>
      )}

      {/* Detail button */}
      <button
        onClick={e => { e.stopPropagation(); onViewDetail(idea.id) }}
        style={{
          position: 'absolute', top: 8, right: 8, zIndex: 10,
          background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)',
          border: 'none', borderRadius: radius.full,
          width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.85em', cursor: 'pointer',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        }}
      >👁️</button>

      {/* Image */}
      <div style={{ position: 'relative', height: 110, background: '#c4e8ff' }}>
        <Image
          src={getPublicImageUrl(idea.photo_url)}
          alt={idea.idea_name}
          fill
          style={{ objectFit: 'cover' }}
          unoptimized
        />
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px 12px' }}>
        <p style={{
          fontWeight: 700, color: c.text, fontSize: '0.85em', lineHeight: 1.3,
          margin: '0 0 3px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{idea.idea_name}</p>

        <p style={{ color: c.textLight, fontSize: '0.73em', margin: '0 0 6px' }}>
          {idea.subtype_name}
        </p>

        {rating && rating.count > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ color: '#f59e0b', fontSize: '0.78em' }}>{'★'.repeat(Math.round(parseFloat(rating.average)))}</span>
            <span style={{ color: c.textLight, fontSize: '0.72em' }}>{rating.average}</span>
          </div>
        ) : (
          <span style={{ fontSize: '0.72em', color: c.textLight }}>Belum ada review</span>
        )}
      </div>
    </div>
  )
}