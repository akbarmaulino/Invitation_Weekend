// app/home/page.tsx atau app/page.tsx
'use client'
import { ErrorBoundary } from 'react-error-boundary'
import HomePage from '@/components/home/HomePage'

export default function Page() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong. Refresh halaman.</div>}>
      <HomePage />
    </ErrorBoundary>
  )
}