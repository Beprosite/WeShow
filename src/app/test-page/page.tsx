'use client'

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'

export default function TestPage() {
  const [hasToken, setHasToken] = useState<boolean>(false)

  useEffect(() => {
    const token = Cookies.get('token')
    setHasToken(!!token)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-4 text-center">
          Test Page
        </h1>
        <div className="text-gray-300 text-center">
          {hasToken ? (
            <p className="text-green-400">Token found! Login successful!</p>
          ) : (
            <p className="text-red-400">No token found. Login may have failed.</p>
          )}
        </div>
      </div>
    </div>
  )
} 