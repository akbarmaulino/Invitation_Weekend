'use client'

import { useMemo } from 'react'
import { formatTanggalIndonesia } from '@/lib/utils'
import type { TripHistory, IdeaReview } from '@/types/types'

interface Props {
  trip: TripHistory
  reviews: IdeaReview[]
  inviteStatus: string
  onViewDetail: () => void
  onDelete: () => void
  onGenerateInvite: () => void
}

export default function TripCard({ trip, reviews, inviteStatus, onViewDetail, onDelete, onGenerateInvite }: Props) {
  const tripReviews = useMemo(() =>
    reviews.filter(r => r.trip_id === trip.id ||
      (trip.selection_json || []).some(s => s.idea_id && s.idea_id === r.idea_id)),
    [reviews, trip]
  )

  const activities   = trip.selection_json || []
  const reviewCount  = tripReviews.length
  const totalItems   = activities.length
  const reviewPct    = totalItems > 0 ? Math.round((reviewCount / totalItems) * 100) : 0
  const avgRating    = tripReviews.length
    ? (tripReviews.reduce((s, r) => s + (r.rating || 0), 0) / tripReviews.length).toFixed(1)
    : null

  const status = reviewCount === 0 ? 'none'
    : reviewCount >= totalItems ? 'complete'
    : 'partial'

  const statusConfig = {
    complete: { label: '✅ Semua Diulas',     bg: '#4caf50', color: 'white'      },
    partial:  { label: `📝 ${reviewCount}/${totalItems} Diulas`, bg: '#ff9800', color: 'white' },
    none:     { label: '⭕ Belum Ada Ulasan', bg: '#9e9e9e', color: 'white'      },
  }[status]

  const inviteBtnLabel = {
    creating: '⏳ Membuat...',
    copied:   '✅ Link Tersalin!',
    error:    '❌ Gagal',
    '':       '💌 Invite Review',
  }[inviteStatus] || '💌 Invite Review'

  return (
    <div
      className="card"
      style={{
        borderLeft: `5px solid ${status === 'complete' ? '#4caf50' : status === 'partial' ? '#ff9800' : '#9e9e9e'}`,
        animation: 'fadeInLeft 0.4s ease-out',
        cursor: 'default',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <div>
          <h3 style={{ color: 'var(--color-primary)', margin: '0 0 4px', fontSize: '1.15em', fontWeight: 800 }}>
            {trip.trip_day}, {formatTanggalIndonesia(trip.trip_date)}
          </h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="badge" style={{ background: statusConfig.bg, color: statusConfig.color }}>
              {statusConfig.label}
            </span>
            {avgRating && (
              <span style={{ fontSize: '0.85em', color: '#f57f17', fontWeight: 700 }}>⭐ {avgRating}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={onViewDetail} className="btn-primary" style={{ padding: '7px 14px', fontSize: '0.82em', borderRadius: 10 }}>
            🔍 Detail & Edit
          </button>
          <button
            onClick={onGenerateInvite}
            disabled={inviteStatus === 'creating'}
            className="btn-secondary"
            style={{ padding: '7px 14px', fontSize: '0.82em', borderRadius: 10,
              background: inviteStatus === 'copied' ? '#e8f5e9' : undefined,
              color: inviteStatus === 'copied' ? '#2e7d32' : undefined,
            }}
          >
            {inviteBtnLabel}
          </button>
          <button
            onClick={onDelete}
            style={{ padding: '7px 12px', fontSize: '0.82em', borderRadius: 10, border: 'none', background: '#ffebee', color: '#c62828', cursor: 'pointer', fontWeight: 600 }}
          >🗑️</button>
        </div>
      </div>

      {/* Activities preview */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {activities.slice(0, 6).map((act, i) => (
          <span key={i} className="activity-tag">{act.name}</span>
        ))}
        {activities.length > 6 && (
          <span className="activity-tag" style={{ background: 'var(--color-primary)', color: 'white', border: 'none' }}>
            +{activities.length - 6} lainnya
          </span>
        )}
      </div>

      {/* Progress bar */}
      {totalItems > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78em', color: 'var(--color-muted)', marginBottom: 5 }}>
            <span>Progress Review</span>
            <span>{reviewPct}% ({reviewCount}/{totalItems})</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${reviewPct}%` }} />
          </div>
        </div>
      )}

      {/* Secret message */}
      {trip.secret_message && (
        <div style={{ marginTop: 12, padding: '8px 14px', background: 'linear-gradient(135deg, #fff9e6, #fff4d6)', borderLeft: '4px solid #ffc107', borderRadius: 8, fontSize: '0.85em', fontStyle: 'italic', color: 'var(--color-primary)' }}>
          💌 {trip.secret_message}
        </div>
      )}
    </div>
  )
}