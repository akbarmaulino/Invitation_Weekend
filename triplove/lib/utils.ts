import { supabase } from './supabase'

const IMAGE_BUCKET = 'trip-ideas-images'
const VIDEO_BUCKET = 'trip-ideas-videos'

// ============================================================
// IMAGE HELPERS
// ============================================================

export function getPublicImageUrl(photoUrl: string | string[] | null | undefined): string {
  let urlToProcess = Array.isArray(photoUrl) ? photoUrl[0] : photoUrl
  if (!urlToProcess) return '/placeholder.jpg'
  if (urlToProcess.startsWith('http')) return urlToProcess
  try {
    const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(urlToProcess)
    return data.publicUrl || '/placeholder.jpg'
  } catch {
    return '/placeholder.jpg'
  }
}

export function getPublicVideoUrl(videoUrl: string | null | undefined): string | null {
  if (!videoUrl) return null
  if (videoUrl.startsWith('http')) return videoUrl
  try {
    const { data } = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(videoUrl)
    return data.publicUrl || null
  } catch {
    return null
  }
}

export async function uploadImage(file: File, userId = 'anon', subfolder = ''): Promise<string | null> {
  if (!file) return null
  const folderPath = subfolder ? `${userId}/${subfolder}` : userId
  const path = `${folderPath}/${Date.now()}_${file.name}`
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file)
  if (error) { console.error('Upload image error:', error); return null }
  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function uploadImages(files: FileList, userId = 'anon', subfolder = 'review'): Promise<string[]> {
  const urls: string[] = []
  for (const file of Array.from(files).slice(0, 5)) {
    const url = await uploadImage(file, userId, subfolder)
    if (url) urls.push(url)
  }
  return urls
}

export async function uploadVideo(file: File, userId = 'anon', subfolder = 'review'): Promise<string | null> {
  if (!file) return null
  const maxSize = 50 * 1024 * 1024
  if (file.size > maxSize) { alert('Video terlalu besar! Maksimal 50MB.'); return null }
  const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v']
  if (!allowedTypes.includes(file.type)) { alert('Format tidak didukung! Gunakan MP4, MOV, atau WEBM.'); return null }
  const path = `${userId}/${subfolder}/${Date.now()}_${file.name}`
  const { error } = await supabase.storage.from(VIDEO_BUCKET).upload(path, file)
  if (error) { console.error('Upload video error:', error); return null }
  const { data } = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

// ============================================================
// FORMAT HELPERS
// ============================================================

export function formatTanggalIndonesia(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatUrl(url: string | null | undefined): string {
  if (!url) return ''
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
}

export function sortAlphabetically<T>(arr: T[], key: keyof T): T[] {
  return [...arr].sort((a, b) =>
    String(a[key] || '').localeCompare(String(b[key] || ''), 'id-ID')
  )
}

// ============================================================
// INVITATION HELPERS
// ============================================================

export function generateInvitationToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function validateInvitationToken(token: string) {
  try {
    const { data: invitation, error } = await supabase
      .from('trip_invitations').select('*').eq('token', token).single()
    if (error || !invitation) return { valid: false, error: 'Invalid invitation link' }
    if (invitation.status === 'expired') return { valid: false, error: 'This invitation has expired' }
    if (new Date() > new Date(invitation.expires_at)) {
      await supabase.from('trip_invitations').update({ status: 'expired' }).eq('id', invitation.id)
      return { valid: false, error: 'This invitation has expired' }
    }
    if (invitation.use_count >= invitation.max_uses) return { valid: false, error: 'Invitation has reached maximum uses' }
    const { data: trip, error: tripError } = await supabase
      .from('trip_history').select('*').eq('id', invitation.trip_id).single()
    if (tripError || !trip) return { valid: false, error: 'Trip not found' }
    return { valid: true, invitation, trip }
  } catch (error) {
    return { valid: false, error: (error as Error).message }
  }
}

export async function incrementInvitationUse(invitationId: string): Promise<boolean> {
  try {
    const { data: inv } = await supabase
      .from('trip_invitations').select('use_count, max_uses').eq('id', invitationId).single()
    if (!inv) return false
    const newUseCount = inv.use_count + 1
    await supabase.from('trip_invitations').update({
      use_count: newUseCount,
      status: newUseCount >= inv.max_uses ? 'used' : 'pending',
      used_at: new Date().toISOString()
    }).eq('id', invitationId)
    return true
  } catch {
    return false
  }
}

export async function createTripInvitation({
  tripId, inviterName, invitedEmail = null, message = null, maxUses = 1, expiryDays = 30
}: {
  tripId: string
  inviterName: string
  invitedEmail?: string | null
  message?: string | null
  maxUses?: number
  expiryDays?: number
}) {
  try {
    let token = generateInvitationToken()
    for (let i = 0; i < 5; i++) {
      const { data } = await supabase.from('trip_invitations').select('id').eq('token', token).single()
      if (!data) break
      token = generateInvitationToken()
    }
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiryDays)
    const { data: invitation, error } = await supabase
      .from('trip_invitations')
      .insert([{ trip_id: tripId, token, invited_email: invitedEmail, inviter_name: inviterName, invitation_message: message, expires_at: expiresAt.toISOString(), max_uses: maxUses, status: 'pending' }])
      .select().single()
    if (error) throw error
    const baseUrl = typeof window !== 'undefined'
      ? (window.location.hostname === 'localhost' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || window.location.origin)
      : process.env.NEXT_PUBLIC_APP_URL
    return { success: true, token, invitationUrl: `${baseUrl}/review?token=${token}`, invitation }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}