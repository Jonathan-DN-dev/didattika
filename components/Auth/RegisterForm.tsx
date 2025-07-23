'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { RegisterCredentials } from 'types/auth'
import { useAuth } from './AuthProvider'

interface RegisterFormProps {
  onSuccess?: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register: registerUser, loading, error, clearError } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm<RegisterCredentials>({
    defaultValues: {
      userType: 'student'
    }
  })

  const password = watch('password')

  const onSubmit = async (data: RegisterCredentials) => {
    try {
      setIsSubmitting(true)
      clearError()
      await registerUser(data)
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
                value: 8,
                message: 'Password must be at least 8 characters'
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
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

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2 font-overpass">
            Confirm Password
          </label>
          <input
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match'
            })}
            type="password"
            id="confirmPassword"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-overpass"
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 font-overpass">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="userType" className="block text-sm font-medium text-slate-700 mb-2 font-overpass">
            I am a
          </label>
          <select
            {...register('userType', { required: 'Please select your role' })}
            id="userType"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-overpass"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
          {errors.userType && (
            <p className="mt-1 text-sm text-red-600 font-overpass">{errors.userType.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="w-full login-btn disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
    </div>
  )
}
