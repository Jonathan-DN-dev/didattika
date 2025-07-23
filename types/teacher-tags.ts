import type { Tag } from './tags'

export interface TagValidation {
  id: string
  tagId: string
  teacherId: string
  originalName: string
  validatedName: string
  originalDescription?: string
  validatedDescription?: string
  feedbackType: 'approved' | 'rejected' | 'modified' | 'flagged'
  feedback?: string
  confidence: number
  timestamp: Date
  reasonForChange?: string
}

export interface TeacherTagPreferences {
  id: string
  teacherId: string
  subjectArea: string
  tagStandards: TagStandard[]
  autoApprovalRules: AutoApprovalRule[]
  requiredCategories: string[]
  forbiddenWords: string[]
  preferredTerminology: { [key: string]: string }
  confidenceThreshold: number
  createdAt: Date
  updatedAt: Date
}

export interface TagStandard {
  category: string
  requiredFields: string[]
  validationRules: ValidationRule[]
  examples: string[]
}

export interface ValidationRule {
  type: 'length' | 'format' | 'content' | 'curriculum'
  criteria: string
  errorMessage: string
}

export interface AutoApprovalRule {
  condition: 'confidence_above' | 'category_match' | 'keyword_present'
  value: number | string
  action: 'approve' | 'flag_for_review'
}

export interface BulkTagOperation {
  operation: 'approve' | 'reject' | 'modify' | 'delete' | 'merge'
  tagIds: string[]
  newValues?: Partial<Tag>
  mergeTargetId?: string
  reason?: string
}

export interface TagAnalytics {
  totalTags: number
  approvedTags: number
  rejectedTags: number
  modifiedTags: number
  pendingReview: number
  averageConfidence: number
  categoryDistribution: { [category: string]: number }
  usageByStudent: { [studentId: string]: number }
  topUsedTags: Tag[]
  recentActivity: TagValidation[]
  improvementSuggestions: string[]
}

export interface TagHierarchy {
  id: string
  parentTagId?: string
  childTagIds: string[]
  hierarchyType: 'subject' | 'difficulty' | 'skill' | 'topic'
  level: number
  orderIndex: number
  teacherId: string
  subjectArea: string
  createdAt: Date
}

export interface CustomTag extends Omit<Tag, 'id' | 'createdAt' | 'lastUsed'> {
  teacherId: string
  subjectArea: string
  curriculumAlignment: string[]
  learningObjectives: string[]
  assessmentCriteria: string[]
  gradeLevel: string
  isTemplate: boolean
}

export interface TagTemplate {
  id: string
  name: string
  description: string
  category: string
  subjectArea: string
  gradeLevel: string
  tags: Omit<CustomTag, 'teacherId'>[]
  teacherId: string
  isPublic: boolean
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

export interface TagValidationRequest {
  tagId: string
  action: 'approve' | 'reject' | 'modify'
  feedback?: string
  newName?: string
  newDescription?: string
  newCategory?: string
  reasonForChange?: string
}

export interface TagReport {
  id: string
  teacherId: string
  reportType: 'usage' | 'effectiveness' | 'curriculum_alignment' | 'student_progress'
  dateRange: {
    start: Date
    end: Date
  }
  filters: {
    subjectArea?: string
    gradeLevel?: string
    studentIds?: string[]
    tagCategories?: string[]
  }
  data: TagAnalytics
  insights: string[]
  recommendations: string[]
  generatedAt: Date
}

export interface AITagFeedback {
  id: string
  tagId: string
  teacherId: string
  originalPrediction: {
    name: string
    description: string
    category: string
    confidence: number
  }
  teacherCorrection: {
    name: string
    description: string
    category: string
    feedback: string
  }
  feedbackType: 'correction' | 'enhancement' | 'rejection'
  subjectArea: string
  contextualFactors: {
    documentType: string
    studentLevel: string
    curriculumContext: string
  }
  improvementImpact: number
  submittedAt: Date
}

export interface TeacherTagDashboardData {
  pendingValidations: TagValidation[]
  recentActivity: TagValidation[]
  analytics: TagAnalytics
  preferredTemplates: TagTemplate[]
  systemRecommendations: string[]
  aiPerformanceMetrics: {
    accuracyTrend: number[]
    confidenceImprovement: number
    subjectSpecificAccuracy: { [subject: string]: number }
  }
}

export interface TagValidationFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'modified'
  category?: string
  subjectArea?: string
  confidenceRange?: [number, number]
  dateRange?: [Date, Date]
  studentId?: string
  sortBy?: 'confidence' | 'date' | 'usage' | 'alphabetical'
  sortOrder?: 'asc' | 'desc'
}

export interface TagMergeRequest {
  primaryTagId: string
  secondaryTagIds: string[]
  newName?: string
  newDescription?: string
  preserveHierarchy: boolean
  updateReferences: boolean
}

// Mock data generators for development
export const generateMockTagValidation = (overrides?: Partial<TagValidation>): TagValidation => ({
  id: `validation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  tagId: `tag-${Math.random().toString(36).substr(2, 9)}`,
  teacherId: 'teacher-001',
  originalName: 'Mathematics',
  validatedName: 'Basic Mathematics',
  originalDescription: 'Mathematical concepts',
  validatedDescription: 'Fundamental mathematical concepts and operations',
  feedbackType: 'modified',
  feedback: 'Made the description more specific and educational',
  confidence: 0.85,
  timestamp: new Date(),
  reasonForChange: 'Better alignment with curriculum standards',
  ...overrides,
})

export const generateMockTagAnalytics = (overrides?: Partial<TagAnalytics>): TagAnalytics => ({
  totalTags: 156,
  approvedTags: 98,
  rejectedTags: 12,
  modifiedTags: 34,
  pendingReview: 12,
  averageConfidence: 0.78,
  categoryDistribution: {
    subject: 45,
    topic: 38,
    skill: 32,
    difficulty: 28,
    format: 13,
  },
  usageByStudent: {
    'student-001': 23,
    'student-002': 18,
    'student-003': 31,
    'student-004': 15,
  },
  topUsedTags: [],
  recentActivity: [],
  improvementSuggestions: [
    'Consider creating more specific math terminology tags',
    'Review rejected tags for common patterns',
    'Establish auto-approval rules for high-confidence tags',
  ],
  ...overrides,
})
