"use client"

import { useEffect, useState } from "react"
import { Conversation, PersonaType } from "types/chat"
import { getPersonaConfig } from "lib/ai/persona-configs"
import { cva, type VariantProps } from "class-variance-authority"
import { twMerge } from "tailwind-merge"

const conversationItemStyles = cva(
  ["flex", "items-center", "gap-3", "p-3", "rounded-lg", "cursor-pointer", "transition-colors", "text-left", "w-full"],
  {
    variants: {
      active: {
        true: ["bg-didattika-blue", "text-white"],
        false: ["bg-gray-50", "hover:bg-gray-100", "text-gray-900"],
      },
    },
    defaultVariants: {
      active: false,
    },
  }
)

interface ConversationHistoryProps {
  currentConversationId?: string | null
  onConversationSelect: (conversationId: string) => void
  onConversationDelete: (conversationId: string) => void
  className?: string
}

export function ConversationHistory({
  currentConversationId,
  onConversationSelect,
  onConversationDelete,
  className
}: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/chat/conversations")
      
      if (!response.ok) {
        throw new Error("Failed to load conversations")
      }

      const data = await response.json()
      setConversations(data.conversations || [])
      setError(null)
    } catch (error) {
      console.error("Error loading conversations:", error)
      setError("Errore nel caricamento delle conversazioni")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm("Sei sicuro di voler eliminare questa conversazione?")) {
      return
    }

    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error("Failed to delete conversation")
      }

      setConversations(prev => prev.filter(conv => conv.id !== conversationId))
      onConversationDelete(conversationId)
    } catch (error) {
      console.error("Error deleting conversation:", error)
      alert("Errore nell'eliminazione della conversazione")
    }
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
    } else if (diffInDays === 1) {
      return "Ieri"
    } else if (diffInDays < 7) {
      return d.toLocaleDateString("it-IT", { weekday: "short" })
    } else {
      return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" })
    }
  }

  const getPersonaIcon = (persona: PersonaType) => {
    return getPersonaConfig(persona).icon
  }

  if (loading) {
    return (
      <div className={twMerge("p-4", className)}>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-3 p-3">
                <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={twMerge("p-4", className)}>
        <div className="text-center text-red-600 text-sm">
          {error}
          <button 
            onClick={loadConversations}
            className="block mt-2 text-didattika-blue hover:underline"
          >
            Riprova
          </button>
        </div>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className={twMerge("p-4 text-center text-gray-500 text-sm", className)}>
        <div className="mb-2">💬</div>
        <p>Nessuna conversazione ancora.</p>
        <p>Inizia a chattare per vedere lo storico qui!</p>
      </div>
    )
  }

  return (
    <div className={twMerge("p-2 space-y-2", className)}>
      <div className="text-sm font-medium text-gray-700 px-2 mb-3">
        Conversazioni recenti
      </div>
      
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onConversationSelect(conversation.id)}
          className={twMerge(
            conversationItemStyles({ 
              active: currentConversationId === conversation.id 
            })
          )}
        >
          <div className="text-lg flex-shrink-0">
            {getPersonaIcon(conversation.persona_type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">
              {conversation.title}
            </div>
            <div className="text-xs opacity-75 truncate">
              {conversation.messages && conversation.messages.length > 0
                ? conversation.messages[conversation.messages.length - 1].content.substring(0, 50) + "..."
                : "Conversazione iniziata"
              }
            </div>
            <div className="text-xs opacity-60 mt-1">
              {formatDate(conversation.updated_at)}
            </div>
          </div>

          <button
            onClick={(e) => handleDeleteConversation(conversation.id, e)}
            className="p-1 hover:bg-white/20 rounded transition-colors opacity-60 hover:opacity-100"
            title="Elimina conversazione"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </button>
      ))}
    </div>
  )
}
