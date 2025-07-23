"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { Message, Conversation, PersonaType, ChatContextType, ChatAPIRequest, ChatAPIResponse } from "types/chat"

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openChat = useCallback(() => {
    setIsChatOpen(true)
    setError(null)
  }, [])

  const closeChat = useCallback(() => {
    setIsChatOpen(false)
    setError(null)
  }, [])

  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev)
    setError(null)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const selectPersona = useCallback((persona: PersonaType) => {
    setSelectedPersona(persona)
    setError(null)
    
    // Create welcome message for the selected persona
    if (!currentConversation) {
      const welcomeMessages = {
        tutor: "Ciao! Sono il tuo tutor personale. Sono qui per aiutarti a comprendere meglio i concetti e rispondere alle tue domande. Come posso aiutarti oggi?",
        docente: "Buongiorno! Sono il tuo assistente didattico. Posso aiutarti con la programmazione delle lezioni, materiali didattici e strategie di insegnamento. Su cosa vuoi lavorare?",
        coach: "Ciao! Sono il tuo coach di apprendimento. Sono specializzato nel supporto motivazionale e nell'aiutarti a sviluppare metodi di studio efficaci. Raccontami le tue sfide!"
      }

      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: welcomeMessages[persona],
        timestamp: new Date(),
        agent: persona,
      }

      const newConversation: Conversation = {
        id: `conv-${Date.now()}`,
        user_id: "current-user", // In production, get from auth context
        persona_type: persona,
        title: `Conversazione con ${persona === "tutor" ? "Tutor" : persona === "docente" ? "Docente" : "Coach"}`,
        created_at: new Date(),
        updated_at: new Date(),
        messages: [welcomeMessage]
      }

      setCurrentConversation(newConversation)
    }
  }, [currentConversation])

  const switchPersona = useCallback((persona: PersonaType) => {
    setSelectedPersona(persona)
    setError(null)
    
    if (currentConversation) {
      // Add persona switch notification
      const switchMessage: Message = {
        id: `switch-${Date.now()}`,
        role: "system",
        content: `Hai cambiato assistente. Ora stai parlando con ${persona === "tutor" ? "Tutor AI" : persona === "docente" ? "Docente AI" : "Coach AI"}.`,
        timestamp: new Date(),
      }

      const updatedConversation = {
        ...currentConversation,
        persona_type: persona,
        messages: [...(currentConversation.messages || []), switchMessage],
        updated_at: new Date()
      }

      setCurrentConversation(updatedConversation)
    }
  }, [currentConversation])

  const sendMessage = useCallback(async (content: string) => {
    if (!selectedPersona || !content.trim()) return
    
    setIsLoading(true)
    setError(null)

    try {
      // Create user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      }

      // Update conversation with user message
      let updatedConversation = currentConversation
      if (updatedConversation) {
        updatedConversation = {
          ...updatedConversation,
          messages: [...(updatedConversation.messages || []), userMessage],
          updated_at: new Date()
        }
        setCurrentConversation(updatedConversation)
      }

      // Prepare API request
      const apiRequest: ChatAPIRequest = {
        message: content.trim(),
        persona: selectedPersona,
        conversationId: updatedConversation?.id,
        conversationHistory: updatedConversation?.messages?.slice(-5) || []
      }

      // Call chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiRequest),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data: ChatAPIResponse = await response.json()

      // Create assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message,
        timestamp: new Date(data.timestamp),
        agent: data.persona,
      }

      // Update conversation with assistant message
      if (updatedConversation) {
        const finalConversation = {
          ...updatedConversation,
          messages: [...(updatedConversation.messages || []), assistantMessage],
          updated_at: new Date()
        }
        setCurrentConversation(finalConversation)
        
        // Update conversations list
        setConversations(prev => {
          const existingIndex = prev.findIndex(conv => conv.id === finalConversation.id)
          if (existingIndex >= 0) {
            const updated = [...prev]
            updated[existingIndex] = finalConversation
            return updated
          } else {
            return [finalConversation, ...prev]
          }
        })
      }

    } catch (error) {
      console.error("Error sending message:", error)
      setError(error instanceof Error ? error.message : "Errore durante l'invio del messaggio")
      
      // Add error message to conversation
      if (currentConversation) {
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Mi dispiace, si è verificato un errore. Riprova tra poco.",
          timestamp: new Date(),
          agent: selectedPersona,
          metadata: { error: true }
        }

        const updatedConversation = {
          ...currentConversation,
          messages: [...(currentConversation.messages || []), errorMessage],
          updated_at: new Date()
        }
        setCurrentConversation(updatedConversation)
      }
    } finally {
      setIsLoading(false)
    }
  }, [selectedPersona, currentConversation])

  const startNewConversation = useCallback(async (persona?: PersonaType) => {
    setCurrentConversation(null)
    setSelectedPersona(null)
    setError(null)
    
    if (persona) {
      selectPersona(persona)
    }
  }, [selectPersona])

  const loadConversation = useCallback(async (conversationId: string) => {
    // In production, this would load from database
    const conversation = conversations.find(conv => conv.id === conversationId)
    if (conversation) {
      setCurrentConversation(conversation)
      setSelectedPersona(conversation.persona_type)
      setError(null)
    }
  }, [conversations])

  const deleteConversation = useCallback(async (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId))
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null)
      setSelectedPersona(null)
    }
    setError(null)
  }, [currentConversation])

  const value: ChatContextType = {
    isChatOpen,
    currentConversation,
    conversations,
    selectedPersona,
    isLoading,
    error,
    openChat,
    closeChat,
    toggleChat,
    selectPersona,
    switchPersona,
    sendMessage,
    startNewConversation,
    loadConversation,
    deleteConversation,
    clearError,
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
