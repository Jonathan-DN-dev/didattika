export interface Document {
  id: string
  user_id: string
  teacher_id?: string
  title: string
  file_path: string
  file_type: 'pdf' | 'txt' | 'docx'
  file_size: number
  content_text?: string
  summary?: string
  metadata?: DocumentMetadata
  status: DocumentStatus
  approval_status?: ApprovalStatus
  teacher_notes?: string
  created_at: Date
  updated_at: Date
}

export interface DocumentMetadata {
  original_filename: string
  pages?: number
  word_count?: number
  language?: string
  encoding?: string
  extraction_method?: string
  processing_time?: number
  error_log?: string[]
}

export type DocumentStatus = 'uploading' | 'processing' | 'completed' | 'failed' | 'deleted'
export type ApprovalStatus = 'pending' | 'approved' | 'flagged' | 'rejected'

export interface DocumentUploadRequest {
  file: File
  title?: string
  description?: string
}

export interface DocumentUploadResponse {
  document_id: string
  upload_url?: string
  message: string
  status: DocumentStatus
}

export interface DocumentProcessingStatus {
  document_id: string
  status: DocumentStatus
  progress: number
  message: string
  estimated_completion?: Date
  error?: string
}

export interface DocumentContent {
  id: string
  document_id: string
  content_type: 'full_text' | 'summary' | 'chunk'
  content: string
  chunk_index?: number
  metadata?: {
    page_number?: number
    section?: string
    confidence_score?: number
  }
}

export interface DocumentConversation {
  id: string
  document_id: string
  conversation_id: string
  context_relevance: number
  created_at: Date
}

export interface DocumentSearchResult {
  document: Document
  relevance_score: number
  matching_chunks?: DocumentContent[]
  highlight_text?: string
}

export interface DocumentAnalytics {
  id: string
  document_id: string
  interaction_type: 'view' | 'query' | 'download' | 'share'
  timestamp: Date
  duration?: number
  teacher_viewed?: boolean
  metadata?: {
    query_text?: string
    response_satisfaction?: number
    page_viewed?: number
  }
}

export interface StudentTeacherRelation {
  id: string
  student_id: string
  teacher_id: string
  course_id?: string
  enrollment_date: Date
  status: 'active' | 'inactive' | 'pending'
}

export interface DocumentProcessingConfig {
  max_file_size: number // in bytes
  supported_types: string[]
  chunk_size: number
  overlap_size: number
  processing_timeout: number // in milliseconds
}

// Upload validation types
export interface UploadValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  file_info?: {
    size: number
    type: string
    name: string
  }
}

// Document management types for teachers
export interface TeacherDocumentFilters {
  student_id?: string
  course_id?: string
  file_type?: string[]
  status?: DocumentStatus[]
  approval_status?: ApprovalStatus[]
  date_range?: {
    start: Date
    end: Date
  }
  search_query?: string
}

export interface DocumentListResponse {
  documents: Document[]
  total: number
  page: number
  limit: number
  filters_applied: TeacherDocumentFilters
}

export interface DocumentAnalyticsReport {
  document_count: number
  total_file_size: number
  most_active_students: Array<{
    student_id: string
    student_name: string
    document_count: number
    last_upload: Date
  }>
  file_type_distribution: Record<string, number>
  upload_trends: Array<{
    date: string
    count: number
  }>
  processing_stats: {
    success_rate: number
    average_processing_time: number
    total_processed: number
    failed_count: number
  }
}
