import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AuthProvider } from './AuthProvider'
import { LoginForm } from './LoginForm'

// Mock the auth provider
jest.mock('./AuthProvider', () => ({
  useAuth: () => ({
    login: jest.fn(),
    loading: false,
    error: null,
    clearError: jest.fn()
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}))

describe('LoginForm', () => {
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderLoginForm = () => {
    return render(
      <AuthProvider>
        <LoginForm onSuccess={mockOnSuccess} />
      </AuthProvider>
    )
  }

  it('renders login form with email and password fields', () => {
    renderLoginForm()

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    renderLoginForm()

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email format', async () => {
    renderLoginForm()

    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for short password', async () => {
    renderLoginForm()

    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(passwordInput, { target: { value: '123' } })

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
    })
  })

  it('allows valid form submission', async () => {
    renderLoginForm()

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)

    // Form should be valid and submittable
    await waitFor(() => {
      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument()
    })
  })
})
