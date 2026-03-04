// app/review/page.tsx
import { Suspense } from 'react'
import ReviewInvitationPage from '@/components/review/ReviewInvitationPage'

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReviewInvitationPage />
    </Suspense>
  )
}