import type { 
  ConversationSession, 
  ConversationContext, 
  SessionRestoreData,
  ConversationMetadata 
} from '../../types/conversation-history'
import type { Conversation, Message } from '../../types/chat'

export class SessionManager {
  private sessions: Map<string, ConversationSession> = new Map()
  private contexts: Map<string, ConversationContext> = new Map()
  private autosaveInterval: NodeJS.Timeout | null = null

  constructor() {
    this.initializeAutosave()
  }

  /**
   * Start a new conversation session
   */
  async startSession(
    conversationId: string,
    userId: string,
    personaType: string,
    documentContext?: string[]
  ): Promise<ConversationSession> {
    const session: ConversationSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      sessionStart: new Date(),
      contextSnapshot: {
        currentPersona: personaType,
        documentContext: documentContext || [],
        lastUserIntent: '',
        conversationSummary: '',
        keyTopics: [],
        lastResponse: '',
        contextWindow: [],
        userPreferences: {
          responseLength: 'medium',
          explanationLevel: 'intermediate',
          preferredLanguage: 'English',
        },
      },
      resumptionCount: 0,
      activeTime: 0,
      userAgent: this.getUserAgent(),
      deviceType: this.detectDeviceType(),
      isActive: true,
    }

    this.sessions.set(session.id, session)
    this.contexts.set(conversationId, session.contextSnapshot)

    return session
  }

  /**
   * Resume an existing conversation session
   */
  async resumeSession(conversationId: string): Promise<SessionRestoreData | null> {
    try {
      // Get conversation data (in real implementation, fetch from database)
      const conversation = await this.getConversationById(conversationId)
      if (!conversation) {
        throw new Error('Conversation not found')
      }

      // Get existing context or create new one
      let context = this.contexts.get(conversationId)
      if (!context) {
        context = await this.reconstructContext(conversation)
        this.contexts.set(conversationId, context)
      }

      // Create new session for resumption
      const existingSessions = await this.getSessionsByConversationId(conversationId)
      const session: ConversationSession = {
        id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        conversationId,
        sessionStart: new Date(),
        contextSnapshot: { ...context },
        resumptionCount: existingSessions.length,
        activeTime: 0,
        userAgent: this.getUserAgent(),
        deviceType: this.detectDeviceType(),
        isActive: true,
      }

      this.sessions.set(session.id, session)

      // Calculate resume point (last meaningful exchange)
      const resumeFromMessageId = this.findOptimalResumePoint(conversation.messages)

      return {
        conversation,
        context,
        resumeFromMessageId,
        sessionInfo: {
          previousSessions: existingSessions.length,
          lastActiveTime: existingSessions[existingSessions.length - 1]?.sessionEnd || new Date(),
          estimatedContinuationTime: this.estimateContinuationTime(conversation),
        },
      }
    } catch (error) {
      console.error('Error resuming session:', error)
      return null
    }
  }

  /**
   * Update session context with new information
   */
  updateContext(
    conversationId: string,
    updates: Partial<ConversationContext>
  ): void {
    const currentContext = this.contexts.get(conversationId)
    if (currentContext) {
      const updatedContext = { ...currentContext, ...updates }
      this.contexts.set(conversationId, updatedContext)
      
      // Update session snapshot
      const activeSession = this.getActiveSession(conversationId)
      if (activeSession) {
        activeSession.contextSnapshot = updatedContext
      }
    }
  }

  /**
   * Add message to conversation context
   */
  addMessageToContext(
    conversationId: string,
    message: Message
  ): void {
    const context = this.contexts.get(conversationId)
    if (context) {
      // Add to context window (keep last 10 messages for context)
      context.contextWindow.push(message)
      if (context.contextWindow.length > 10) {
        context.contextWindow.shift()
      }

      // Update last response if it's from AI
      if (message.role === 'assistant') {
        context.lastResponse = message.content
      }

      // Update last user intent if it's from user
      if (message.role === 'user') {
        context.lastUserIntent = message.content
      }

      // Extract topics from content
      this.updateTopicsFromMessage(context, message)
    }
  }

  /**
   * End current session
   */
  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.sessionEnd = new Date()
      session.isActive = false
      session.activeTime = this.calculateActiveTime(session)

      // Save session to persistent storage
      await this.saveSession(session)
      
      // Remove from active sessions
      this.sessions.delete(sessionId)
    }
  }

  /**
   * Get active session for conversation
   */
  getActiveSession(conversationId: string): ConversationSession | null {
    for (const session of this.sessions.values()) {
      if (session.conversationId === conversationId && session.isActive) {
        return session
      }
    }
    return null
  }

  /**
   * Get current context for conversation
   */
  getContext(conversationId: string): ConversationContext | null {
    return this.contexts.get(conversationId) || null
  }

  /**
   * Auto-save conversation state
   */
  async autosave(conversationId: string): Promise<void> {
    const context = this.contexts.get(conversationId)
    const activeSession = this.getActiveSession(conversationId)
    
    if (context && activeSession) {
      try {
        // Update session active time
        activeSession.activeTime = this.calculateActiveTime(activeSession)
        
        // Save to persistent storage
        await this.saveConversationState(conversationId, context, activeSession)
      } catch (error) {
        console.error('Autosave failed:', error)
      }
    }
  }

  /**
   * Create conversation snapshot for backup
   */
  createSnapshot(conversationId: string): {
    context: ConversationContext
    session: ConversationSession
    timestamp: Date
  } | null {
    const context = this.contexts.get(conversationId)
    const session = this.getActiveSession(conversationId)

    if (context && session) {
      return {
        context: { ...context },
        session: { ...session },
        timestamp: new Date(),
      }
    }

    return null
  }

  /**
   * Restore from snapshot
   */
  restoreFromSnapshot(
    conversationId: string,
    snapshot: {
      context: ConversationContext
      session: ConversationSession
      timestamp: Date
    }
  ): void {
    this.contexts.set(conversationId, snapshot.context)
    this.sessions.set(snapshot.session.id, {
      ...snapshot.session,
      isActive: true,
    })
  }

  // Private helper methods

  private initializeAutosave(): void {
    // Auto-save every 30 seconds
    this.autosaveInterval = setInterval(() => {
      for (const conversationId of this.contexts.keys()) {
        this.autosave(conversationId)
      }
    }, 30000)
  }

  private getUserAgent(): string {
    return typeof window !== 'undefined' ? window.navigator.userAgent : 'Server'
  }

  private detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    if (typeof window === 'undefined') return 'desktop'
    
    const userAgent = window.navigator.userAgent
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet'
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile'
    }
    return 'desktop'
  }

  private async getConversationById(conversationId: string): Promise<Conversation | null> {
    // Mock implementation - in real app, fetch from database/API
    return {
      id: conversationId,
      title: 'Sample Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      persona: 'math_tutor',
      userId: 'user-001',
    }
  }

  private async getSessionsByConversationId(conversationId: string): Promise<ConversationSession[]> {
    // Mock implementation - in real app, fetch from database
    return []
  }

  private async reconstructContext(conversation: Conversation): Promise<ConversationContext> {
    // Analyze conversation to rebuild context
    const messages = conversation.messages || []
    const lastMessages = messages.slice(-5) // Last 5 messages for context

    return {
      currentPersona: conversation.persona || 'general',
      documentContext: [],
      lastUserIntent: this.extractLastUserIntent(messages),
      conversationSummary: this.generateConversationSummary(messages),
      keyTopics: this.extractTopics(messages),
      lastResponse: this.findLastAssistantMessage(messages),
      contextWindow: lastMessages,
      userPreferences: {
        responseLength: 'medium',
        explanationLevel: 'intermediate',
        preferredLanguage: 'English',
      },
    }
  }

  private findOptimalResumePoint(messages: Message[]): string | undefined {
    // Find the last meaningful exchange (user question + AI response)
    for (let i = messages.length - 1; i >= 1; i--) {
      if (messages[i].role === 'assistant' && messages[i - 1].role === 'user') {
        return messages[i].id
      }
    }
    return messages[messages.length - 1]?.id
  }

  private estimateContinuationTime(conversation: Conversation): number {
    // Simple heuristic based on conversation length and complexity
    const messageCount = conversation.messages?.length || 0
    return Math.max(5, Math.min(30, messageCount * 2)) // 5-30 minutes
  }

  private updateTopicsFromMessage(context: ConversationContext, message: Message): void {
    // Simple topic extraction (in real implementation, use NLP)
    const content = message.content.toLowerCase()
    const commonTopics = [
      'mathematics', 'algebra', 'geometry', 'calculus',
      'science', 'biology', 'chemistry', 'physics',
      'history', 'geography', 'literature', 'writing',
      'programming', 'computer science', 'technology'
    ]

    commonTopics.forEach(topic => {
      if (content.includes(topic) && !context.keyTopics.includes(topic)) {
        context.keyTopics.push(topic)
      }
    })

    // Keep only the most recent 10 topics
    if (context.keyTopics.length > 10) {
      context.keyTopics = context.keyTopics.slice(-10)
    }
  }

  private calculateActiveTime(session: ConversationSession): number {
    const now = new Date()
    const start = session.sessionStart
    return Math.floor((now.getTime() - start.getTime()) / 1000)
  }

  private async saveSession(session: ConversationSession): Promise<void> {
    // Mock implementation - in real app, save to database
    console.log('Saving session:', session.id)
  }

  private async saveConversationState(
    conversationId: string,
    context: ConversationContext,
    session: ConversationSession
  ): Promise<void> {
    // Mock implementation - in real app, save to database
    console.log('Auto-saving conversation state:', conversationId)
  }

  private extractLastUserIntent(messages: Message[]): string {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        return messages[i].content.slice(0, 100) // First 100 chars
      }
    }
    return ''
  }

  private generateConversationSummary(messages: Message[]): string {
    // Simple summary generation
    if (messages.length === 0) return ''
    
    const userMessages = messages.filter(m => m.role === 'user').slice(0, 3)
    const topics = userMessages.map(m => m.content.slice(0, 50)).join('; ')
    
    return `Discussion about: ${topics}`
  }

  private extractTopics(messages: Message[]): string[] {
    // Extract topics from conversation
    const allContent = messages.map(m => m.content).join(' ').toLowerCase()
    const topics: string[] = []
    
    // Simple keyword matching
    const topicKeywords = {
      'Mathematics': ['math', 'algebra', 'geometry', 'calculus', 'equation'],
      'Science': ['science', 'biology', 'chemistry', 'physics', 'experiment'],
      'Writing': ['write', 'essay', 'paragraph', 'grammar', 'composition'],
      'History': ['history', 'historical', 'war', 'civilization', 'timeline'],
    }

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => allContent.includes(keyword))) {
        topics.push(topic)
      }
    })

    return topics
  }

  private findLastAssistantMessage(messages: Message[]): string {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') {
        return messages[i].content.slice(0, 200) // First 200 chars
      }
    }
    return ''
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.autosaveInterval) {
      clearInterval(this.autosaveInterval)
      this.autosaveInterval = null
    }
    this.sessions.clear()
    this.contexts.clear()
  }
}

// Export singleton instance
export const sessionManager = new SessionManager()
