import { Suspense } from 'react'
import UnoGame from '@/components/games/UnoGame'

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UnoGame />
    </Suspense>
  )
}