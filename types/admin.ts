export interface PlatformMetrics {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  totalConversations: number
  totalMessages: number
  averageSessionLength: number
  completionRate: number
  satisfactionScore: number
  retentionRate: number
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  uptime: number
  responseTime: number
  errorRate: number
  apiLatency: number
  databaseConnections: number
  memoryUsage: number
  cpuUsage: number
  diskUsage: number
  lastChecked: Date
}

export interface APIUsageMetrics {
  totalRequests: number
  requestsToday: number
  averageResponseTime: number
  errorCount: number
  costThisMonth: number
  tokensUsed: number
  topEndpoints: Array<{
    endpoint: string
    requests: number
    cost: number
  }>
  usage24h: Array<{
    hour: string
    requests: number
    cost: number
  }>
}

export interface UserEngagementData {
  dailyActiveUsers: Array<{
    date: string
    count: number
  }>
  sessionDuration: Array<{
    range: string
    count: number
  }>
  featureUsage: Array<{
    feature: string
    usage: number
    growth: number
  }>
  userRetention: {
    day1: number
    day7: number
    day30: number
  }
  deviceTypes: Array<{
    type: string
    percentage: number
  }>
}

export interface LearningAnalytics {
  completionRates: {
    overall: number
    bySubject: Array<{
      subject: string
      rate: number
    }>
  }
  averageStudyTime: number
  topPerformingContent: Array<{
    title: string
    completions: number
    rating: number
  }>
  learningProgression: Array<{
    week: string
    averageProgress: number
  }>
  difficultyAnalysis: Array<{
    level: string
    completionRate: number
    averageTime: number
  }>
}

export interface ErrorLog {
  id: string
  timestamp: Date
  level: 'error' | 'warning' | 'info'
  message: string
  stack?: string
  userId?: string
  endpoint?: string
  userAgent?: string
  resolved: boolean
  count: number
}

export interface AlertConfig {
  id: string
  name: string
  metric: string
  threshold: number
  condition: 'above' | 'below' | 'equals'
  enabled: boolean
  recipients: string[]
  lastTriggered?: Date
}

export interface AdminReport {
  id: string
  name: string
  type: 'weekly' | 'monthly' | 'custom'
  description: string
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    dayOfWeek?: number
    time: string
  }
  recipients: string[]
  lastGenerated?: Date
  nextGeneration?: Date
  isActive: boolean
}

export interface UserActivity {
  id: string
  userId: string
  activityType: 'login' | 'conversation' | 'document_upload' | 'export' | 'search'
  sessionDuration?: number
  featureUsed: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface AdminInsight {
  id: string
  type: 'performance' | 'engagement' | 'cost' | 'feature'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  actionRequired: boolean
  suggestedActions: string[]
  data: Record<string, any>
  generatedAt: Date
}

export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string
    fill?: boolean
  }>
}

export interface DashboardWidget {
  id: string
  type: 'metric' | 'chart' | 'table' | 'status'
  title: string
  position: { x: number; y: number; w: number; h: number }
  config: Record<string, any>
  dataSource: string
  refreshInterval?: number
  isVisible: boolean
}

export interface AdminDashboardData {
  metrics: PlatformMetrics
  systemHealth: SystemHealth
  apiUsage: APIUsageMetrics
  userEngagement: UserEngagementData
  learningAnalytics: LearningAnalytics
  recentErrors: ErrorLog[]
  activeAlerts: AlertConfig[]
  insights: AdminInsight[]
  lastUpdated: Date
}

export interface CostAnalysis {
  totalMonthlyCost: number
  costByService: Array<{
    service: string
    cost: number
    percentage: number
  }>
  costTrend: Array<{
    date: string
    cost: number
  }>
  budgetStatus: {
    budget: number
    spent: number
    remaining: number
    onTrack: boolean
  }
  optimization: Array<{
    opportunity: string
    potentialSavings: number
    effort: 'low' | 'medium' | 'high'
  }>
}

export interface UserSegment {
  id: string
  name: string
  criteria: {
    registrationDate?: { start: Date; end: Date }
    activityLevel?: 'low' | 'medium' | 'high'
    userType?: 'student' | 'teacher' | 'admin'
    features?: string[]
  }
  userCount: number
  avgEngagement: number
  conversionRate: number
}

export interface ABTest {
  id: string
  name: string
  description: string
  status: 'draft' | 'running' | 'completed' | 'paused'
  variants: Array<{
    name: string
    percentage: number
    participants: number
    conversionRate: number
  }>
  startDate: Date
  endDate?: Date
  hypothesis: string
  results?: {
    winner?: string
    significance: number
    summary: string
  }
}

export interface PredictiveInsight {
  id: string
  type: 'churn_prediction' | 'engagement_forecast' | 'feature_adoption'
  prediction: string
  confidence: number
  timeframe: string
  factors: Array<{
    factor: string
    impact: number
  }>
  recommendation: string
  data: Record<string, any>
}

// Mock data generators for development
export const generateMockPlatformMetrics = (): PlatformMetrics => ({
  totalUsers: 1247,
  activeUsers: 892,
  newUsersToday: 23,
  totalConversations: 5634,
  totalMessages: 45782,
  averageSessionLength: 18.5, // minutes
  completionRate: 0.73,
  satisfactionScore: 4.2,
  retentionRate: 0.68,
})

export const generateMockSystemHealth = (): SystemHealth => ({
  status: 'healthy',
  uptime: 99.8,
  responseTime: 245, // ms
  errorRate: 0.02,
  apiLatency: 180, // ms
  databaseConnections: 25,
  memoryUsage: 0.72,
  cpuUsage: 0.45,
  diskUsage: 0.65,
  lastChecked: new Date(),
})

export const generateMockAPIUsage = (): APIUsageMetrics => ({
  totalRequests: 123456,
  requestsToday: 1234,
  averageResponseTime: 180,
  errorCount: 23,
  costThisMonth: 342.50,
  tokensUsed: 2450000,
  topEndpoints: [
    { endpoint: '/api/chat', requests: 45000, cost: 123.45 },
    { endpoint: '/api/documents', requests: 23000, cost: 67.89 },
    { endpoint: '/api/personas', requests: 15000, cost: 34.56 },
  ],
  usage24h: Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    requests: Math.floor(Math.random() * 100) + 50,
    cost: Math.random() * 10 + 5,
  })),
})

export const generateMockUserEngagement = (): UserEngagementData => ({
  dailyActiveUsers: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    count: Math.floor(Math.random() * 200) + 600,
  })),
  sessionDuration: [
    { range: '0-5 min', count: 123 },
    { range: '5-15 min', count: 456 },
    { range: '15-30 min', count: 789 },
    { range: '30+ min', count: 234 },
  ],
  featureUsage: [
    { feature: 'AI Chat', usage: 95, growth: 12 },
    { feature: 'Document Upload', usage: 78, growth: 8 },
    { feature: 'Tag System', usage: 65, growth: 15 },
    { feature: 'Export', usage: 42, growth: 5 },
  ],
  userRetention: {
    day1: 0.85,
    day7: 0.62,
    day30: 0.45,
  },
  deviceTypes: [
    { type: 'Desktop', percentage: 65 },
    { type: 'Mobile', percentage: 28 },
    { type: 'Tablet', percentage: 7 },
  ],
})

export const generateMockLearningAnalytics = (): LearningAnalytics => ({
  completionRates: {
    overall: 0.73,
    bySubject: [
      { subject: 'Mathematics', rate: 0.78 },
      { subject: 'Science', rate: 0.71 },
      { subject: 'Language Arts', rate: 0.75 },
      { subject: 'History', rate: 0.68 },
    ],
  },
  averageStudyTime: 22.5, // minutes
  topPerformingContent: [
    { title: 'Algebra Basics', completions: 245, rating: 4.5 },
    { title: 'Essay Writing', completions: 198, rating: 4.3 },
    { title: 'Chemistry Lab', completions: 167, rating: 4.2 },
  ],
  learningProgression: Array.from({ length: 12 }, (_, i) => ({
    week: `Week ${i + 1}`,
    averageProgress: Math.random() * 20 + 60,
  })),
  difficultyAnalysis: [
    { level: 'Beginner', completionRate: 0.85, averageTime: 15 },
    { level: 'Intermediate', completionRate: 0.72, averageTime: 25 },
    { level: 'Advanced', completionRate: 0.58, averageTime: 35 },
  ],
})

export const generateMockErrorLogs = (): ErrorLog[] => [
  {
    id: 'error-1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    level: 'error',
    message: 'API rate limit exceeded',
    endpoint: '/api/chat',
    userId: 'user-123',
    userAgent: 'Mozilla/5.0...',
    resolved: false,
    count: 5,
  },
  {
    id: 'error-2',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    level: 'warning',
    message: 'Database connection timeout',
    resolved: true,
    count: 2,
  },
]

export const generateMockInsights = (): AdminInsight[] => [
  {
    id: 'insight-1',
    type: 'engagement',
    title: 'User Engagement Declining',
    description: 'Daily active users have decreased by 8% over the past week',
    priority: 'medium',
    actionRequired: true,
    suggestedActions: [
      'Review recent feature changes',
      'Survey users for feedback',
      'Implement re-engagement campaign',
    ],
    data: { decline: 0.08, period: '7 days' },
    generatedAt: new Date(),
  },
  {
    id: 'insight-2',
    type: 'performance',
    title: 'API Response Time Increasing',
    description: 'Average API response time has increased by 15% this week',
    priority: 'high',
    actionRequired: true,
    suggestedActions: [
      'Optimize database queries',
      'Review server capacity',
      'Implement caching',
    ],
    data: { increase: 0.15, currentLatency: 245 },
    generatedAt: new Date(),
  },
]
