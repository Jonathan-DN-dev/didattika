import type { Conversation, Message } from './chat'

export interface ConversationMetadata {
  id: string
  userId: string
  title: string
  description?: string
  personaType: string
  status: 'active' | 'archived' | 'completed'
  documentIds: string[]
  messageCount: number
  lastMessage?: string
  createdAt: Date
  updatedAt: Date
  lastAccessed: Date
  estimatedReadTime: number
  wordCount: number
  topics: string[]
  isStarred: boolean
  category?: string
}

export interface ConversationSession {
  id: string
  conversationId: string
  sessionStart: Date
  sessionEnd?: Date
  contextSnapshot: ConversationContext
  resumptionCount: number
  activeTime: number // in seconds
  userAgent: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  isActive: boolean
}

export interface ConversationContext {
  currentPersona: string
  documentContext: string[]
  lastUserIntent: string
  conversationSummary: string
  keyTopics: string[]
  lastResponse: string
  contextWindow: Message[]
  userPreferences: {
    responseLength: 'short' | 'medium' | 'long'
    explanationLevel: 'basic' | 'intermediate' | 'advanced'
    preferredLanguage: string
  }
}

export interface ConversationTag {
  id: string
  conversationId: string
  tagName: string
  tagType: 'user' | 'ai' | 'system'
  userCreated: boolean
  color?: string
  createdAt: Date
}

export interface ConversationSearchQuery {
  query?: string
  personaType?: string
  dateRange?: {
    start: Date
    end: Date
  }
  tags?: string[]
  category?: string
  status?: string
  hasDocuments?: boolean
  minMessageCount?: number
  sortBy?: 'date' | 'title' | 'relevance' | 'activity'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface ConversationSearchResult {
  conversations: ConversationMetadata[]
  total: number
  hasMore: boolean
  searchSuggestions: string[]
  facets: {
    personas: { name: string; count: number }[]
    tags: { name: string; count: number }[]
    categories: { name: string; count: number }[]
    timeRanges: { range: string; count: number }[]
  }
}

export interface ConversationPreview {
  metadata: ConversationMetadata
  firstMessage: Message
  lastMessage: Message
  keyExchanges: Message[]
  summary: string
  highlights: string[]
}

export interface ConversationExportOptions {
  format: 'pdf' | 'txt' | 'json' | 'markdown'
  includeMetadata: boolean
  includeTimestamps: boolean
  includePersonaInfo: boolean
  filterBy?: {
    messageType?: string[]
    dateRange?: { start: Date; end: Date }
    keywords?: string[]
  }
  styling?: {
    theme: 'light' | 'dark'
    fontSize: 'small' | 'medium' | 'large'
    includeImages: boolean
  }
}

export interface ConversationExportResult {
  success: boolean
  downloadUrl?: string
  fileName?: string
  fileSize?: number
  format: string
  error?: string
}

export interface ConversationBranch {
  id: string
  parentConversationId: string
  branchPoint: string // message ID where branch started
  title: string
  description?: string
  createdAt: Date
  messageCount: number
  isActive: boolean
}

export interface ConversationMergeRequest {
  primaryConversationId: string
  secondaryConversationIds: string[]
  mergeStrategy: 'chronological' | 'topic_based' | 'manual'
  newTitle?: string
  preserveMetadata: boolean
  createBackup: boolean
}

export interface ConversationAnalytics {
  totalConversations: number
  totalMessages: number
  averageConversationLength: number
  mostUsedPersonas: { persona: string; count: number }[]
  conversationsByMonth: { month: string; count: number }[]
  topTopics: { topic: string; frequency: number }[]
  averageSessionTime: number
  resumptionRate: number
  exportCount: number
  searchQueries: string[]
}

export interface ConversationHistoryFilters {
  search?: string
  persona?: string
  category?: string
  tags?: string[]
  dateRange?: [Date, Date]
  status?: 'active' | 'archived' | 'completed'
  hasDocuments?: boolean
  isStarred?: boolean
  sortBy?: 'date' | 'title' | 'lastAccessed' | 'messageCount'
  sortOrder?: 'asc' | 'desc'
}

export interface ConversationListItem {
  metadata: ConversationMetadata
  preview: {
    firstLine: string
    lastLine: string
    keyTopics: string[]
  }
  stats: {
    duration: string
    messageCount: number
    lastAccessed: string
  }
  actions: {
    canResume: boolean
    canEdit: boolean
    canDelete: boolean
    canExport: boolean
    canShare: boolean
  }
}

export interface SessionRestoreData {
  conversation: Conversation
  context: ConversationContext
  resumeFromMessageId?: string
  sessionInfo: {
    previousSessions: number
    lastActiveTime: Date
    estimatedContinuationTime: number
  }
}

export interface ConversationDuplicate {
  id: string
  originalId: string
  duplicatedAt: Date
  modifications: string[]
  purpose: 'backup' | 'experiment' | 'sharing' | 'template'
}

// Utility types for conversation management
export type ConversationAction = 
  | 'view'
  | 'resume' 
  | 'edit'
  | 'delete'
  | 'archive'
  | 'unarchive'
  | 'star'
  | 'unstar'
  | 'export'
  | 'share'
  | 'duplicate'
  | 'merge'
  | 'branch'

export type ConversationBulkAction = 
  | 'delete'
  | 'archive'
  | 'unarchive'
  | 'tag'
  | 'export'
  | 'categorize'

export interface ConversationBulkOperation {
  action: ConversationBulkAction
  conversationIds: string[]
  parameters?: {
    tags?: string[]
    category?: string
    exportFormat?: string
  }
}

// Mock data generators for development
export const generateMockConversationMetadata = (overrides?: Partial<ConversationMetadata>): ConversationMetadata => ({
  id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  userId: 'user-001',
  title: 'Math Help Session',
  description: 'Getting help with algebra problems',
  personaType: 'math_tutor',
  status: 'active',
  documentIds: ['doc-1', 'doc-2'],
  messageCount: 15,
  lastMessage: 'Thanks for the help with quadratic equations!',
  createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(),
  lastAccessed: new Date(),
  estimatedReadTime: 8,
  wordCount: 1250,
  topics: ['Algebra', 'Quadratic Equations', 'Problem Solving'],
  isStarred: false,
  category: 'Mathematics',
  ...overrides,
})

export const generateMockConversationSession = (overrides?: Partial<ConversationSession>): ConversationSession => ({
  id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  conversationId: 'conv-001',
  sessionStart: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  sessionEnd: new Date(),
  contextSnapshot: {
    currentPersona: 'math_tutor',
    documentContext: ['algebra_worksheet.pdf'],
    lastUserIntent: 'solve quadratic equation',
    conversationSummary: 'Student learning about quadratic equations with step-by-step guidance',
    keyTopics: ['Algebra', 'Quadratic Equations'],
    lastResponse: 'Great job! You\'ve successfully solved the equation.',
    contextWindow: [],
    userPreferences: {
      responseLength: 'medium',
      explanationLevel: 'intermediate',
      preferredLanguage: 'English',
    },
  },
  resumptionCount: 2,
  activeTime: 3600, // 1 hour
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  deviceType: 'desktop',
  isActive: false,
  ...overrides,
})

export const generateMockConversationAnalytics = (): ConversationAnalytics => ({
  totalConversations: 45,
  totalMessages: 678,
  averageConversationLength: 15.1,
  mostUsedPersonas: [
    { persona: 'math_tutor', count: 18 },
    { persona: 'science_teacher', count: 12 },
    { persona: 'writing_coach', count: 8 },
    { persona: 'history_guide', count: 7 },
  ],
  conversationsByMonth: [
    { month: '2024-01', count: 8 },
    { month: '2024-02', count: 12 },
    { month: '2024-03', count: 15 },
    { month: '2024-04', count: 10 },
  ],
  topTopics: [
    { topic: 'Algebra', frequency: 25 },
    { topic: 'Essay Writing', frequency: 18 },
    { topic: 'Chemistry', frequency: 15 },
    { topic: 'History', frequency: 12 },
  ],
  averageSessionTime: 1800, // 30 minutes
  resumptionRate: 0.35, // 35% of conversations are resumed
  exportCount: 23,
  searchQueries: [
    'algebra help',
    'essay writing',
    'chemistry equations',
    'history timeline',
  ],
})
