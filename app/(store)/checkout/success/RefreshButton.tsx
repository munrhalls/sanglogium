'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function RefreshButton() {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    router.refresh()
    setIsRefreshing(false)
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="mt-4 rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
    >
      {isRefreshing ? 'Refreshing…' : 'Refresh'}
    </button>
  )
}
