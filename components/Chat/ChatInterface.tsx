"use client"

import { useState, useRef, useEffect } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { twMerge } from "tailwind-merge"
import { useChat } from "./ChatProvider"
import { PersonaSelector } from "./Personas/PersonaSelector"
import { PersonaIndicator } from "./Personas/PersonaIndicator"
import { Message } from "types/chat"

const chatStyles = cva(
  ["fixed", "bottom-20", "right-6", "w-96", "h-[500px]", "bg-white", "rounded-xl", "shadow-2xl", "border", "border-gray-200", "flex", "flex-col", "overflow-hidden", "transition-all", "duration-300", "z-50"],
  {
    variants: {
      isOpen: {
        true: ["scale-100", "opacity-100"],
        false: ["scale-0", "opacity-0", "pointer-events-none"],
      },
    },
    defaultVariants: {
      isOpen: false,
    },
  }
)

const messageStyles = cva(
  ["p-3", "rounded-lg", "max-w-[80%]", "break-words"],
  {
    variants: {
      role: {
        user: ["bg-didattika-blue", "text-white", "ml-auto"],
        assistant: ["bg-gray-100", "text-gray-900"],
        system: ["bg-didattika-yellow", "text-didattika-blue", "text-center", "text-sm", "mx-auto", "max-w-full"],
      },
      hasError: {
        true: ["bg-red-100", "text-red-800", "border", "border-red-200"],
        false: [],
      },
    },
  }
)

interface ChatInterfaceProps extends VariantProps<typeof chatStyles> {
  className?: string
  onClose: () => void
}

export function ChatInterface({ className, isOpen, onClose }: ChatInterfaceProps) {
  const {
    currentConversation,
    selectedPersona,
    isLoading,
    error,
    selectPersona,
    switchPersona,
    sendMessage,
    startNewConversation,
    clearError
  } = useChat()

  const [input, setInput] = useState("")
  const [showPersonaSelector, setShowPersonaSelector] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const messages = currentConversation?.messages || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  const handlePersonaSelect = (persona: "tutor" | "docente" | "coach") => {
    selectPersona(persona)
    setShowPersonaSelector(false)
  }

  const handlePersonaSwitch = () => {
    setShowPersonaSelector(true)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ["application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if (!allowedTypes.includes(file.type)) {
      alert("Formato file non supportato. Usa PDF, TXT o DOCX.")
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert("File troppo grande. Il limite è 5MB.")
      return
    }

    // TODO: Implement file upload to server
    const fileMessage = `📎 File caricato: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
    sendMessage(fileMessage)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const messageContent = input.trim()
    setInput("")
    
    try {
      await sendMessage(messageContent)
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleStartNewConversation = () => {
    startNewConversation()
    setShowPersonaSelector(false)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("it-IT", { 
      hour: "2-digit", 
      minute: "2-digit" 
    })
  }

  return (
    <div className={twMerge(chatStyles({ isOpen }), className)}>
      {/* Header */}
      <div className="bg-didattika-blue text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.40023 4.0747C6.61482 3.5306 7.38484 3.5306 7.59944 4.0747L8.20671 5.61436C8.59977 6.61106 9.38871 7.40003 10.3854 7.79309L11.9251 8.40036C12.4692 8.61496 12.4692 9.38496 11.9251 9.59956L10.3854 10.2068C9.38871 10.5999 8.59977 11.3888 8.20671 12.3856L7.59944 13.9252C7.38484 14.4693 6.61482 14.4693 6.40023 13.9252L5.793 12.3856C5.39991 11.3888 4.61094 10.5999 3.61424 10.2068L2.07458 9.59956C1.53048 9.38496 1.53048 8.61496 2.07458 8.40036L3.61424 7.79309C4.61094 7.40003 5.39991 6.61106 5.793 5.61436L6.40023 4.0747Z" stroke="currentColor"/>
            <path d="M12.1086 1.81965C12.1891 1.61562 12.4779 1.61562 12.5584 1.81965L12.786 2.39702C12.9335 2.77078 13.2294 3.06665 13.6031 3.21406L14.1805 3.44177C14.3845 3.52224 14.3845 3.811 14.1805 3.89148L13.6031 4.11919C13.2294 4.2666 12.9335 4.56246 12.786 4.93622L12.5584 5.5136C12.4779 5.71763 12.1891 5.71763 12.1086 5.5136L11.881 4.93622C11.7335 4.56246 11.4376 4.2666 11.0639 4.11919L10.4865 3.89148C10.2825 3.811 10.2825 3.52224 10.4865 3.44177L11.0639 3.21406C11.4376 3.06665 11.7335 2.77078 11.881 2.39702L12.1086 1.81965Z" stroke="currentColor" strokeWidth="0.8"/>
          </svg>
          <span className="font-semibold truncate">
            {selectedPersona ? 
              (selectedPersona === "tutor" ? "Tutor AI" : 
               selectedPersona === "docente" ? "Docente AI" : "Coach AI") 
              : "DIDATTIKA AI"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {selectedPersona && (
            <button
              onClick={handleStartNewConversation}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Nuova conversazione"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 1.33337V14.6667M1.33333 8H14.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border-b border-red-200 text-red-800 text-sm">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Persona Selection */}
      {(!selectedPersona || showPersonaSelector) && (
        <div className="p-4 border-b border-gray-200 max-h-80 overflow-y-auto">
          <PersonaSelector 
            onPersonaSelect={handlePersonaSelect}
            selectedPersona={selectedPersona}
            showDescriptions={true}
          />
          {showPersonaSelector && selectedPersona && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowPersonaSelector(false)}
                className="w-full text-sm text-gray-600 hover:text-gray-800"
              >
                Annulla cambio assistente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Current Persona Indicator */}
      {selectedPersona && !showPersonaSelector && (
        <div className="p-3 border-b border-gray-200">
          <PersonaIndicator 
            persona={selectedPersona}
            size="sm"
            onSwitch={handlePersonaSwitch}
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && selectedPersona && (
          <div className="text-center text-gray-500 text-sm py-8">
            <div className="mb-2">
              {selectedPersona === "tutor" ? "🎓" : selectedPersona === "docente" ? "👨‍🏫" : "💪"}
            </div>
            <p>Inizia una conversazione con il tuo {selectedPersona === "tutor" ? "tutor" : selectedPersona === "docente" ? "docente" : "coach"}!</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col">
            <div className={twMerge(
              messageStyles({ 
                role: message.role,
                hasError: message.metadata?.error || false
              })
            )}>
              {message.content}
            </div>
            <div className={`text-xs text-gray-500 mt-1 ${message.role === "user" ? "text-right" : message.role === "system" ? "text-center" : "text-left"}`}>
              {formatTime(message.timestamp)}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-didattika-blue"></div>
            <span className="text-sm">
              {selectedPersona === "tutor" ? "Il tutor sta scrivendo..." : 
               selectedPersona === "docente" ? "Il docente sta scrivendo..." : 
               "Il coach sta scrivendo..."}
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {selectedPersona && !showPersonaSelector && (
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Scrivi un messaggio..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-didattika-blue focus:border-transparent outline-none disabled:opacity-50"
                disabled={isLoading}
                maxLength={1000}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-didattika-blue transition-colors disabled:opacity-50"
                title="Carica file"
                disabled={isLoading}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.333 13.3334L9.99967 10L6.66634 13.3334" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 10V17.5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16.9917 15.3249C17.8044 14.8818 18.4465 14.1806 18.8165 13.3321C19.1866 12.4835 19.2635 11.5359 19.0351 10.6388C18.8068 9.7417 18.2862 8.94616 17.5555 8.37778C16.8248 7.80939 15.9257 7.50052 15 7.49991H13.95C13.6977 6.52427 13.2276 5.61852 12.5749 4.85073C11.9222 4.08295 11.104 3.47311 10.1817 3.06708C9.25943 2.66104 8.25709 2.46937 7.25006 2.50647C6.24304 2.54358 5.25752 2.80849 4.36761 3.28129C3.4777 3.75409 2.70656 4.42249 2.11215 5.23622C1.51774 6.04996 1.11554 6.98785 0.935783 7.9794C0.756025 8.97095 0.803706 9.99035 1.07472 10.961C1.34573 11.9316 1.83809 12.8281 2.51667 13.5832" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-didattika-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.333 1.66663L9.16634 10.8333" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.333 1.66663L12.4997 18.3333L9.16634 10.8333L1.66634 7.49996L18.333 1.66663Z" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
          
          {/* Character count */}
          {input.length > 800 && (
            <div className="text-xs text-gray-500 mt-1 text-right">
              {input.length}/1000 caratteri
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}
    </div>
  )
}
