'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { LoginCredentials } from 'types/auth'
import { useAuth } from './AuthProvider'

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, loading, error, clearError } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<LoginCredentials>()

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setIsSubmitting(true)
      clearError()
      await login(data)
      onSuccess?.()
    } catch (err) {
      if (err instanceof Error) {
        setError('root', { message: err.message })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {(error || errors.root) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600 font-overpass">
              {error || errors.root?.message}
            </p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2 font-overpass">
            Email
          </label>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            type="email"
            id="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-overpass"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 font-overpass">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2 font-overpass">
            Password
          </label>
          <input
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
            type="password"
            id="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-overpass"
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 font-overpass">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="w-full login-btn disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
