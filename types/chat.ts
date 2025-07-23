export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  agent?: PersonaType
  metadata?: {
    isTyping?: boolean
    error?: boolean
    retryCount?: number
  }
}

export type PersonaType = "tutor" | "docente" | "coach"

export interface Conversation {
  id: string
  user_id: string
  persona_type: PersonaType
  title: string
  context?: string
  created_at: Date
  updated_at: Date
  messages?: Message[]
}

export interface ChatContextType {
  isChatOpen: boolean
  currentConversation: Conversation | null
  conversations: Conversation[]
  selectedPersona: PersonaType | null
  isLoading: boolean
  error: string | null
  openChat: () => void
  closeChat: () => void
  toggleChat: () => void
  selectPersona: (persona: PersonaType) => void
  switchPersona: (persona: PersonaType) => void
  sendMessage: (content: string) => Promise<void>
  startNewConversation: (persona?: PersonaType) => Promise<void>
  loadConversation: (conversationId: string) => Promise<void>
  deleteConversation: (conversationId: string) => Promise<void>
  clearError: () => void
}

export interface PersonaConfig {
  id: PersonaType
  name: string
  displayName: string
  description: string
  icon: string
  color: string
  prompt: string
  characteristics: string[]
}

export interface ChatAPIRequest {
  message: string
  persona?: PersonaType
  conversationId?: string
  conversationHistory?: Message[]
}

export interface ChatAPIResponse {
  message: string
  persona: PersonaType
  conversationId?: string
  timestamp: string
  error?: string
}
