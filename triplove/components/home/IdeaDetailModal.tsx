'use client'
import { useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { getPublicImageUrl, getPublicVideoUrl, formatTanggalIndonesia, formatUrl, uploadImages, uploadVideo } from '@/lib/utils'
import type { TripIdea, IdeaReview, IdeaRating } from '@/types/types'

const P='#03254c', PL='#e1f3ff', PB='#c4e8ff', TEXT='#03254c', MUTED='#9ca3af'
const inp: React.CSSProperties = { width:'100%', padding:'10px 14px', border:'2px solid #c4e8ff', borderRadius:12, fontSize:'0.93em', color:TEXT, background:'white', outline:'none', boxSizing:'border-box' }

interface Props {
  idea: TripIdea; reviews: IdeaReview[]; rating?: IdeaRating
  tripDates: Record<string, { trip_date: string; trip_day: string }>
  onClose: () => void; onEditInfo: (id: string) => void; onReviewSaved: () => void
}

export default function IdeaDetailModal({ idea, reviews, rating, tripDates, onClose, onEditInfo, onReviewSaved }: Props) {
  const [showForm, setShowForm]     = useState(false)
  const [rvRating, setRvRating]     = useState(0)
  const [rvText, setRvText]         = useState('')
  const [rvName, setRvName]         = useState(() => typeof window !== 'undefined' ? localStorage.getItem('lastReviewerName')||'' : '')
  const [photos, setPhotos]         = useState<FileList|null>(null)
  const [video, setVideo]           = useState<File|null>(null)
  const [status, setStatus]         = useState('')
  const [saving, setSaving]         = useState(false)
  const sorted = [...reviews].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const handleSave = async () => {
    if (rvRating === 0) return setStatus('⚠️ Beri minimal 1 bintang!')
    if (!rvName.trim()) return setStatus('⚠️ Masukkan nama kamu!')
    setSaving(true); setStatus('⏳ Menyimpan...')
    let photoUrls: string[] = []
    if (photos?.length) photoUrls = await uploadImages(photos, 'anon', 'review')
    let videoUrl: string|null = null
    if (video) { setStatus('🎬 Upload video...'); videoUrl = await uploadVideo(video, 'anon', 'review'); if (!videoUrl) { setStatus('❌ Gagal upload video'); setSaving(false); return } }
    const payload = { idea_id: idea.id, trip_id: null, user_id: 'anon', reviewer_name: rvName.trim(), rating: rvRating, review_text: rvText||null, photo_url: photoUrls.length ? photoUrls : null, video_url: videoUrl }
    const { data: ex } = await supabase.from('idea_reviews').select('id').eq('idea_id', idea.id).eq('reviewer_name', rvName.trim()).maybeSingle()
    const { error } = ex ? await supabase.from('idea_reviews').update(payload).eq('id', ex.id) : await supabase.from('idea_reviews').insert([payload])
    if (error) { setStatus('❌ Gagal: '+error.message); setSaving(false); return }
    localStorage.setItem('lastReviewerName', rvName.trim())
    setStatus('✅ Review tersimpan!'); setSaving(false); setShowForm(false); setRvRating(0); setRvText(''); onReviewSaved()
  }

  const locs = idea.locations?.length ? idea.locations : (idea.address||idea.maps_url) ? [{ name:'Lokasi Utama', address:idea.address, maps_url:idea.maps_url, phone:idea.phone, opening_hours:idea.opening_hours, price_range:idea.price_range, website:idea.website, notes:idea.notes }] : []

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, background:'rgba(30,27,75,0.4)', display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'20px 16px', overflowY:'auto' }} onClick={e => { if (e.target===e.currentTarget) onClose() }}>
      <div style={{ background:'white', borderRadius:24, border:'2px solid #c4e8ff', boxShadow:'0 16px 48px rgba(168,85,247,0.2)', width:'100%', maxWidth:640, margin:'auto' }}>

        {/* Hero */}
        <div style={{ position:'relative', height:200, background:'#c4e8ff', borderRadius:'22px 22px 0 0', overflow:'hidden' }}>
          <Image src={getPublicImageUrl(idea.photo_url)} alt={idea.idea_name} fill style={{ objectFit:'cover' }} unoptimized />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(30,27,75,0.5), transparent)' }} />
          <button onClick={onClose} style={{ position:'absolute', top:12, right:12, background:'rgba(255,255,255,0.9)', border:'none', borderRadius:999, padding:'4px 12px', fontWeight:700, cursor:'pointer', color:TEXT, fontSize:'0.88em' }}>✕ Tutup</button>
          <div style={{ position:'absolute', bottom:14, left:18, right:18 }}>
            <h2 style={{ color:'white', fontWeight:800, fontSize:'1.3em', margin:'0 0 2px', textShadow:'0 1px 4px rgba(0,0,0,0.3)' }}>{idea.idea_name}</h2>
            <p style={{ color:'rgba(255,255,255,0.85)', fontSize:'0.82em', margin:0 }}>{idea.category_name} · {idea.subtype_name}</p>
          </div>
        </div>

        <div style={{ padding:24, display:'flex', flexDirection:'column', gap:20 }}>

          {/* Rating summary */}
          {rating && rating.count > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', borderRadius:14, background:PL, border:'1.5px solid #a8d8f0' }}>
              <span style={{ fontSize:'1.5em' }}>⭐</span>
              <div>
                <span style={{ fontWeight:800, color:P, fontSize:'1.1em' }}>{rating.average}</span>
                <span style={{ color:MUTED, fontSize:'0.82em', marginLeft:6 }}>dari {rating.count} review</span>
              </div>
            </div>
          )}

          {/* Locations */}
          {locs.length === 0 ? (
            <div style={{ textAlign:'center', padding:'20px', border:'2px dashed #a8d8f0', borderRadius:14 }}>
              <p style={{ color:MUTED, fontSize:'0.9em', margin:'0 0 10px' }}>💡 Info lokasi belum ditambahkan</p>
              <button onClick={() => onEditInfo(idea.id)} style={{ padding:'7px 18px', borderRadius:999, background:PL, color:P, border:'2px solid #a8d8f0', fontWeight:700, cursor:'pointer', fontSize:'0.85em' }}>✏️ Tambah Lokasi</button>
            </div>
          ) : (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <h3 style={{ color:P, fontWeight:700, margin:0, fontSize:'0.95em' }}>📍 Lokasi ({locs.length})</h3>
                <button onClick={() => onEditInfo(idea.id)} style={{ background:PL, border:'1.5px solid #a8d8f0', borderRadius:999, padding:'5px 12px', color:P, fontWeight:700, fontSize:'0.8em', cursor:'pointer' }}>✏️ Kelola</button>
              </div>
              {locs.map((loc,i) => (
                <details key={i} open={i===0} style={{ borderRadius:12, border:'1.5px solid #c4e8ff', marginBottom:8, overflow:'hidden' }}>
                  <summary style={{ padding:'10px 14px', cursor:'pointer', fontWeight:700, fontSize:'0.88em', color:P, background:PL, userSelect:'none' }}>{loc.name||'Lokasi '+(i+1)}</summary>
                  <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:5, fontSize:'0.85em', color:TEXT }}>
                    {loc.address && <p style={{ margin:0 }}>📍 {loc.address}</p>}
                    {loc.phone && <p style={{ margin:0 }}>📞 <a href={'tel:'+loc.phone} style={{ color:'#03254c' }}>{loc.phone}</a></p>}
                    {loc.opening_hours && <p style={{ margin:0 }}>🕐 {loc.opening_hours}</p>}
                    {loc.price_range && <p style={{ margin:0 }}>💰 {loc.price_range}</p>}
                    {loc.website && <p style={{ margin:0 }}>🌐 <a href={loc.website} target='_blank' rel='noreferrer' style={{ color:'#03254c' }}>{formatUrl(loc.website)}</a></p>}
                    {loc.notes && <p style={{ margin:0 }}>📝 {loc.notes}</p>}
                    {loc.maps_url && <a href={loc.maps_url} target='_blank' rel='noreferrer' style={{ display:'inline-block', marginTop:6, padding:'6px 16px', borderRadius:999, background:'linear-gradient(135deg,#03254c,#1a4d7a)', color:'white', fontWeight:700, fontSize:'0.83em', textDecoration:'none' }}>🗺️ Buka Google Maps</a>}
                  </div>
                </details>
              ))}
            </div>
          )}

          {/* Reviews */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <h3 style={{ color:P, fontWeight:700, margin:0, fontSize:'0.95em' }}>📝 Reviews</h3>
              <button onClick={() => setShowForm(p=>!p)} style={{ padding:'7px 16px', borderRadius:999, background:showForm?'#fff1f2':PL, color:showForm?'#f43f5e':P, border:'2px solid '+(showForm?'#fda4af':'#a8d8f0'), fontWeight:700, cursor:'pointer', fontSize:'0.83em' }}>
                {showForm ? '✕ Tutup' : '+ Tulis Review'}
              </button>
            </div>

            {showForm && (
              <div style={{ marginBottom:18, padding:18, borderRadius:16, background:PL, border:'2px solid #a8d8f0', display:'flex', flexDirection:'column', gap:12 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div><label style={{ fontSize:'0.78em', fontWeight:700, color:MUTED, display:'block', marginBottom:5 }}>Nama</label><input value={rvName} onChange={e=>setRvName(e.target.value)} style={inp} /></div>
                  <div><label style={{ fontSize:'0.78em', fontWeight:700, color:MUTED, display:'block', marginBottom:5 }}>Rating</label><div style={{ display:'flex', gap:4, paddingTop:4 }}>{[1,2,3,4,5].map(s=><span key={s} onClick={()=>setRvRating(s)} style={{ fontSize:'1.6em', cursor:'pointer', color:s<=rvRating?'#f59e0b':'#e5e7eb' }}>★</span>)}</div></div>
                </div>
                <div><label style={{ fontSize:'0.78em', fontWeight:700, color:MUTED, display:'block', marginBottom:5 }}>Ulasan</label><textarea value={rvText} onChange={e=>setRvText(e.target.value)} placeholder='Gimana pengalamannya?' rows={2} style={{ ...inp, resize:'vertical' }} /></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div><label style={{ fontSize:'0.78em', fontWeight:700, color:MUTED, display:'block', marginBottom:5 }}>📷 Foto</label><input type='file' accept='image/*' multiple onChange={e=>setPhotos(e.target.files)} style={{ fontSize:'0.82em' }} /></div>
                  <div><label style={{ fontSize:'0.78em', fontWeight:700, color:MUTED, display:'block', marginBottom:5 }}>🎬 Video</label><input type='file' accept='video/*' onChange={e=>setVideo(e.target.files?.[0]||null)} style={{ fontSize:'0.82em' }} /></div>
                </div>
                {status && <p style={{ margin:0, fontSize:'0.85em', fontWeight:600, color:status.startsWith('❌')?'#f43f5e':P }}>{status}</p>}
                <button onClick={handleSave} disabled={saving} style={{ padding:'12px', borderRadius:999, background:saving?'#a8d8f0':'linear-gradient(135deg,#03254c,#1a4d7a)', color:'white', border:'none', fontWeight:800, cursor:saving?'not-allowed':'pointer', boxShadow:saving?'none':'0 4px 14px rgba(168,85,247,0.35)' }}>{saving?'⏳ Menyimpan...':'💾 Simpan Review'}</button>
              </div>
            )}

            {sorted.length === 0 ? (
              <div style={{ textAlign:'center', padding:'30px', color:MUTED, fontSize:'0.9em', border:'2px dashed #c4e8ff', borderRadius:14 }}>Belum ada review. Jadilah yang pertama! 🌟</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {sorted.map(rv => {
                  const vurl = getPublicVideoUrl(rv.video_url)
                  const pics = Array.isArray(rv.photo_url) ? rv.photo_url : rv.photo_url ? [rv.photo_url] : []
                  const td = rv.trip_id ? tripDates[rv.trip_id] : undefined
                  return (
                    <div key={rv.id} style={{ padding:14, borderRadius:14, border:'1.5px solid #c4e8ff', background:PL }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:6, marginBottom:8 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          {rv.reviewer_name && <span style={{ padding:'3px 12px', borderRadius:999, background:'white', border:'1.5px solid #a8d8f0', fontSize:'0.8em', fontWeight:700, color:P }}>👤 {rv.reviewer_name}</span>}
                          <span style={{ color:'#f59e0b', fontSize:'0.95em' }}>{'★'.repeat(rv.rating||0)}</span>
                        </div>
                        {td && <span style={{ color:MUTED, fontSize:'0.78em' }}>📅 {formatTanggalIndonesia(td.trip_date)}</span>}
                      </div>
                      {rv.review_text && <p style={{ margin:'0 0 8px', fontSize:'0.88em', color:TEXT, fontStyle:'italic', lineHeight:1.5 }}>"{rv.review_text}"</p>}
                      {pics.length > 0 && <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:8 }}>{pics.map((url,i) => <div key={i} style={{ position:'relative', width:80, height:80, borderRadius:10, overflow:'hidden', border:'2px solid #c4e8ff' }}><Image src={getPublicImageUrl(url)} alt='foto' fill style={{ objectFit:'cover' }} unoptimized /></div>)}</div>}
                      {vurl && <video src={vurl} controls style={{ width:'100%', maxWidth:320, borderRadius:12, marginTop:8 }} />}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}