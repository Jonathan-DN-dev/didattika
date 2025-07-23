'use client'

import { isSupabaseConfigured } from 'lib/supabase'

export function DevModeNotice() {
  if (isSupabaseConfigured) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 font-overpass">
              Development Mode
            </h3>
            <div className="mt-1 text-sm text-yellow-700 font-overpass">
              <p>Authentication is running in development mode. Any email/password will work.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
