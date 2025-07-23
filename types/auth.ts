export interface User {
  id: string
  email: string
  user_type: 'student' | 'teacher'
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  confirmPassword: string
  userType: 'student' | 'teacher'
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}
