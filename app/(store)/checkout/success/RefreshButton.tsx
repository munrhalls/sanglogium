'use client'
import { useRouter } from 'next/navigation'

export function RefreshButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.refresh()}
      className="mt-4 rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
    >
      I&apos;ve waited — refresh
    </button>
  )
}
