import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AuthProvider } from './AuthProvider'
import { RegisterForm } from './RegisterForm'

// Mock the auth provider
jest.mock('./AuthProvider', () => ({
  useAuth: () => ({
    register: jest.fn(),
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

describe('RegisterForm', () => {
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderRegisterForm = () => {
    return render(
      <AuthProvider>
        <RegisterForm onSuccess={mockOnSuccess} />
      </AuthProvider>
    )
  }

  it('renders registration form with all required fields', () => {
    renderRegisterForm()

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/i am a/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    renderRegisterForm()

    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for weak password', async () => {
    renderRegisterForm()

    const passwordInput = screen.getByLabelText(/^password$/i)
    fireEvent.change(passwordInput, { target: { value: 'weak' } })

    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password must contain at least one uppercase letter/i)).toBeInTheDocument()
    })
  })

  it('shows validation error when passwords do not match', async () => {
    renderRegisterForm()

    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

    fireEvent.change(passwordInput, { target: { value: 'Password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123' } })

    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  it('allows valid form submission', async () => {
    renderRegisterForm()

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const userTypeSelect = screen.getByLabelText(/i am a/i)

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } })
    fireEvent.change(userTypeSelect, { target: { value: 'student' } })

    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)

    // Form should be valid and submittable
    await waitFor(() => {
      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument()
    })
  })
})
