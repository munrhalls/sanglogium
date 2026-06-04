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
      type="button"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="btn-secondary px-6 py-2.5"
    >
      {isRefreshing ? 'Refreshing…' : 'Refresh'}
    </button>
  )
}
