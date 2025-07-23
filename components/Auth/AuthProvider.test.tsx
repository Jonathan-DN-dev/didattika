import { render, screen } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthProvider'

// Mock Supabase
jest.mock('lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn()
    }
  }
}))

// Test component to access auth context
function TestComponent() {
  const { user, loading, error } = useAuth()

  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('provides auth context to children', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('loading')).toBeInTheDocument()
    expect(screen.getByTestId('user')).toBeInTheDocument()
    expect(screen.getByTestId('error')).toBeInTheDocument()
  })

  it('throws error when useAuth is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error
    console.error = jest.fn()

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')

    console.error = originalError
  })

  it('initializes with loading state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('loading')
    expect(screen.getByTestId('user')).toHaveTextContent('no-user')
    expect(screen.getByTestId('error')).toHaveTextContent('no-error')
  })
})
