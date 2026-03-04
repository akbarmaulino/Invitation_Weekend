'use client'
import Image from 'next/image'
import { useState } from 'react'
import { getPublicImageUrl } from '@/lib/utils'
import type { TripIdea, IdeaRating } from '@/types/types'

const T = {
  navy: '#03254c', navyMid: '#1a4d7a',
  sky: '#c4e8ff', skyMid: '#a8d8f0',
  white: '#ffffff', muted: '#6b8cae',
}

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
        borderRadius: 16,
        border: `2.5px solid ${isSelected ? T.navy : hovered ? T.skyMid : T.sky}`,
        overflow: 'hidden',
        height: 170,
        boxShadow: isSelected
          ? '0 6px 20px rgba(3,37,76,.28)'
          : hovered ? '0 4px 14px rgba(3,37,76,.14)' : '0 2px 6px rgba(3,37,76,.07)',
        transform: isSelected ? 'translateY(-4px) scale(1.02)' : hovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.18s cubic-bezier(.34,1.56,.64,1)',
      }}
    >
      {/* Full-bleed photo */}
      <div style={{ position: 'absolute', inset: 0, background: T.sky }}>
        <Image
          src={getPublicImageUrl(idea.photo_url)}
          alt={idea.idea_name}
          fill
          style={{ objectFit: 'cover', transition: 'transform .3s ease', transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
          unoptimized
        />
      </div>

      {/* Dark gradient overlay — stronger at bottom */}
      <div style={{
        position: 'absolute', inset: 0,
        background: isSelected
          ? 'linear-gradient(to top, rgba(3,37,76,.88) 0%, rgba(3,37,76,.3) 55%, rgba(3,37,76,.15) 100%)'
          : 'linear-gradient(to top, rgba(3,37,76,.75) 0%, rgba(3,37,76,.15) 55%, transparent 100%)',
        transition: 'background .18s',
      }} />

      {/* Selected checkmark (top left) */}
      {isSelected && (
        <div style={{
          position: 'absolute', top: 8, left: 8, zIndex: 10,
          width: 22, height: 22, borderRadius: '50%',
          background: T.white,
          color: T.navy, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.7em', fontWeight: 900,
          boxShadow: '0 2px 8px rgba(0,0,0,.25)',
        }}>✓</div>
      )}

      {/* Detail button (top right) */}
      <button
        onClick={e => { e.stopPropagation(); onViewDetail(idea.id) }}
        style={{
          position: 'absolute', top: 7, right: 7, zIndex: 10,
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)',
          border: 'none', borderRadius: 999,
          width: 24, height: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.72em', cursor: 'pointer',
          boxShadow: '0 1px 4px rgba(0,0,0,.15)',
          opacity: hovered || isSelected ? 1 : 0.7,
          transition: 'opacity .15s',
        }}
      >👁️</button>

      {/* Text info — bottom overlay */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '10px 11px 10px',
        zIndex: 5,
      }}>
        <p style={{
          fontWeight: 700, color: T.white, fontSize: '0.82em', lineHeight: 1.3,
          margin: '0 0 4px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          textShadow: '0 1px 3px rgba(0,0,0,.3)',
        }}>{idea.idea_name}</p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
          <span style={{ fontSize: '0.68em', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
            {idea.subtype_name}
          </span>
          {rating && rating.count > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ color: '#fbbf24', fontSize: '0.7em' }}>★</span>
              <span style={{ color: 'rgba(255,255,255,.85)', fontSize: '0.68em', fontWeight: 600 }}>{rating.average}</span>
            </div>
          ) : (
            <span style={{ fontSize: '0.62em', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>no review</span>
          )}
        </div>
      </div>
    </div>
  )
}