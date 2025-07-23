import { NextRequest, NextResponse } from 'next/server'
import type { 
  SessionRestoreData,
  ConversationSession,
  ConversationContext
} from '../../../../../types/conversation-history'
import type { Conversation, Message } from '../../../../../types/chat'
import { sessionManager } from '../../../../../lib/sessions/session-manager'

interface RouteParams {
  params: {
    id: string
  }
}

// Mock function to get conversation by ID
const getConversationById = async (conversationId: string): Promise<Conversation | null> => {
  // In a real implementation, this would query the database
  const mockMessages: Message[] = [
    {
      id: 'msg-1',
      role: 'user',
      content: 'Hello! I need help with quadratic equations.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: 'msg-2',
      role: 'assistant',
      content: 'Hello! I\'d be happy to help you with quadratic equations. A quadratic equation is a polynomial equation of degree 2, typically written in the form ax² + bx + c = 0. What specific aspect would you like to work on?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000), // 2 hours ago + 30 seconds
    },
    {
      id: 'msg-3',
      role: 'user',
      content: 'I\'m struggling with solving x² - 5x + 6 = 0. Can you show me step by step?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 60000), // 2 hours ago + 1 minute
    },
    {
      id: 'msg-4',
      role: 'assistant',
      content: 'Absolutely! Let\'s solve x² - 5x + 6 = 0 step by step using the factoring method:\n\n1. We need to find two numbers that multiply to 6 and add to -5\n2. Those numbers are -2 and -3 (since -2 × -3 = 6 and -2 + -3 = -5)\n3. So we can factor: (x - 2)(x - 3) = 0\n4. Setting each factor to zero: x - 2 = 0 or x - 3 = 0\n5. Therefore: x = 2 or x = 3\n\nWould you like to try another example?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 120000), // 2 hours ago + 2 minutes
    },
  ]

  const mockConversation: Conversation = {
    id: conversationId,
    title: 'Quadratic Equations Help',
    messages: mockMessages,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    persona: 'math_tutor',
    userId: 'user-001',
  }

  return mockConversation
}

// Mock function to get previous sessions
const getPreviousSessions = async (conversationId: string): Promise<ConversationSession[]> => {
  // In a real implementation, this would query the database
  return [
    {
      id: 'session-1',
      conversationId,
      sessionStart: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      sessionEnd: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      contextSnapshot: {
        currentPersona: 'math_tutor',
        documentContext: [],
        lastUserIntent: 'learn quadratic equations',
        conversationSummary: 'Introduction to quadratic equations',
        keyTopics: ['Quadratic Equations', 'Algebra', 'Factoring'],
        lastResponse: 'Let me help you with quadratic equations...',
        contextWindow: [],
        userPreferences: {
          responseLength: 'medium',
          explanationLevel: 'intermediate',
          preferredLanguage: 'English',
        },
      },
      resumptionCount: 0,
      activeTime: 1800, // 30 minutes
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      deviceType: 'desktop',
      isActive: false,
    },
  ]
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const conversationId = params.id
    const body = await request.json()
    const { userId = 'user-001', deviceInfo } = body

    // Get the conversation
    const conversation = await getConversationById(conversationId)
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this conversation
    if (conversation.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Resume the session using session manager
    const restoreData = await sessionManager.resumeSession(conversationId)
    
    if (!restoreData) {
      return NextResponse.json(
        { error: 'Failed to resume session' },
        { status: 500 }
      )
    }

    // Get additional session info
    const previousSessions = await getPreviousSessions(conversationId)
    
    // Calculate continuation context
    const lastSession = previousSessions[previousSessions.length - 1]
    const timeSinceLastSession = lastSession 
      ? (new Date().getTime() - (lastSession.sessionEnd?.getTime() || 0)) / (1000 * 60) // minutes
      : 0

    // Generate session summary for user
    const sessionSummary = generateSessionSummary(conversation, restoreData.context, timeSinceLastSession)

    // Create response with comprehensive restore data
    const response = {
      success: true,
      conversation: restoreData.conversation,
      context: restoreData.context,
      resumeFromMessageId: restoreData.resumeFromMessageId,
      sessionInfo: {
        ...restoreData.sessionInfo,
        sessionSummary,
        timeSinceLastSession: Math.round(timeSinceLastSession),
        canContinue: true,
        suggestedActions: generateSuggestedActions(restoreData.context),
        conversationProgress: calculateConversationProgress(conversation),
      },
      resumeOptions: {
        continueFromLastMessage: true,
        startNewTopic: true,
        reviewPreviousContent: true,
        changePersona: conversation.persona !== 'general',
      },
      metadata: {
        totalMessages: conversation.messages?.length || 0,
        lastUpdated: conversation.updatedAt,
        estimatedContinuationTime: restoreData.sessionInfo.estimatedContinuationTime,
        conversationTopics: restoreData.context.keyTopics,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error resuming conversation:', error)
    return NextResponse.json(
      { error: 'Failed to resume conversation' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const conversationId = params.id
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'user-001'

    // Get conversation details for resume preview
    const conversation = await getConversationById(conversationId)
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Check access
    if (conversation.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get previous sessions for context
    const previousSessions = await getPreviousSessions(conversationId)
    const lastSession = previousSessions[previousSessions.length - 1]

    // Calculate resume information
    const lastMessage = conversation.messages?.[conversation.messages.length - 1]
    const timeSinceLastActivity = lastMessage?.timestamp 
      ? (new Date().getTime() - lastMessage.timestamp.getTime()) / (1000 * 60 * 60) // hours
      : 24

    const resumeInfo = {
      canResume: true,
      conversationId,
      title: conversation.title,
      lastActivity: lastMessage?.timestamp || conversation.updatedAt,
      timeSinceLastActivity: Math.round(timeSinceLastActivity),
      messageCount: conversation.messages?.length || 0,
      persona: conversation.persona,
      lastMessage: lastMessage?.content.slice(0, 100) + (lastMessage?.content.length > 100 ? '...' : ''),
      previousSessions: previousSessions.length,
      estimatedResumeTime: Math.max(5, Math.min(30, (conversation.messages?.length || 0) * 0.5)),
      suggestedContext: lastSession ? generateContextSuggestion(lastSession.contextSnapshot) : null,
    }

    return NextResponse.json({
      success: true,
      resumeInfo,
      conversation: {
        id: conversation.id,
        title: conversation.title,
        persona: conversation.persona,
        messageCount: conversation.messages?.length || 0,
        lastUpdated: conversation.updatedAt,
      },
    })
  } catch (error) {
    console.error('Error getting resume info:', error)
    return NextResponse.json(
      { error: 'Failed to get resume information' },
      { status: 500 }
    )
  }
}

// Helper functions

function generateSessionSummary(
  conversation: Conversation,
  context: ConversationContext,
  timeSinceLastSession: number
): string {
  const messages = conversation.messages || []
  const messageCount = messages.length
  
  if (timeSinceLastSession < 60) { // Less than 1 hour
    return `Welcome back! You were discussing ${context.keyTopics.join(', ')} with your ${conversation.persona}. You left off after ${messageCount} messages.`
  } else if (timeSinceLastSession < 1440) { // Less than 24 hours
    const hours = Math.round(timeSinceLastSession / 60)
    return `Welcome back! It's been ${hours} hour${hours !== 1 ? 's' : ''} since your last session about ${context.keyTopics.join(', ')}. Ready to continue?`
  } else {
    const days = Math.round(timeSinceLastSession / 1440)
    return `Welcome back! It's been ${days} day${days !== 1 ? 's' : ''} since your last session. Your ${conversation.persona} is ready to help you continue learning about ${context.keyTopics.join(', ')}.`
  }
}

function generateSuggestedActions(context: ConversationContext): string[] {
  const actions = ['Continue where we left off']
  
  if (context.keyTopics.length > 0) {
    actions.push(`Review ${context.keyTopics[context.keyTopics.length - 1]}`)
  }
  
  if (context.lastUserIntent) {
    actions.push('Ask a follow-up question')
  }
  
  actions.push('Start a new topic')
  
  return actions
}

function calculateConversationProgress(conversation: Conversation): {
  phase: string
  description: string
  completionLevel: number
} {
  const messageCount = conversation.messages?.length || 0
  
  if (messageCount < 5) {
    return {
      phase: 'Getting Started',
      description: 'Initial conversation phase',
      completionLevel: 20,
    }
  } else if (messageCount < 15) {
    return {
      phase: 'Active Learning',
      description: 'Building understanding',
      completionLevel: 60,
    }
  } else if (messageCount < 30) {
    return {
      phase: 'Deep Exploration',
      description: 'Exploring advanced concepts',
      completionLevel: 80,
    }
  } else {
    return {
      phase: 'Mastery Discussion',
      description: 'Advanced topic mastery',
      completionLevel: 95,
    }
  }
}

function generateContextSuggestion(contextSnapshot: ConversationContext): string {
  const topics = contextSnapshot.keyTopics
  const lastIntent = contextSnapshot.lastUserIntent
  
  if (topics.length > 0 && lastIntent) {
    return `You were working on ${topics.join(' and ')}. Your last question was about: "${lastIntent.slice(0, 50)}..."`
  } else if (topics.length > 0) {
    return `You were learning about ${topics.join(' and ')}.`
  } else {
    return 'You were having a productive learning conversation.'
  }
}
