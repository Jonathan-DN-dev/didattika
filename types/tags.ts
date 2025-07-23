export interface Tag {
  id: string
  name: string
  display_name: string
  description: string
  ai_explanation?: string
  category: TagCategory
  confidence_score: number
  frequency: number
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  subject_area: string
  language: string
  created_at: Date
  updated_at: Date
  parent_tag_id?: string
  children_tags?: Tag[]
  color?: string
  icon?: string
}

export type TagCategory = 
  | 'concept'       // Core academic concepts
  | 'skill'         // Learning skills and abilities
  | 'topic'         // Specific subject topics
  | 'keyword'       // Important keywords
  | 'method'        // Methods and approaches
  | 'theory'        // Theoretical frameworks
  | 'application'   // Practical applications
  | 'person'        // Historical figures, authors
  | 'date'          // Important dates and periods
  | 'location'      // Places and geographical references

export interface DocumentTag {
  id: string
  document_id: string
  tag_id: string
  relevance_score: number
  position_references: number[]  // Character positions where tag was found
  context_snippet: string
  auto_generated: boolean
  verified_by_teacher?: boolean
  created_at: Date
  tag?: Tag
}

export interface TagRelationship {
  id: string
  parent_tag_id: string
  child_tag_id: string
  relationship_type: 'prerequisite' | 'related' | 'opposite' | 'example' | 'category'
  strength: number  // 0-1 indicating relationship strength
  created_at: Date
}

export interface TagInteraction {
  id: string
  user_id: string
  tag_id: string
  interaction_type: 'view' | 'bookmark' | 'study' | 'search' | 'explain'
  timestamp: Date
  study_time?: number
  satisfaction_rating?: number
  metadata?: {
    source_document?: string
    query_context?: string
    learning_objective?: string
  }
}

export interface TagAnalytics {
  tag_id: string
  total_interactions: number
  unique_users: number
  average_study_time: number
  effectiveness_score: number
  most_common_contexts: string[]
  related_tags: Array<{
    tag_id: string
    tag_name: string
    co_occurrence_count: number
  }>
}

export interface ConceptMap {
  id: string
  user_id?: string
  name: string
  description: string
  tags: Array<{
    tag: Tag
    position: { x: number; y: number }
    connections: Array<{
      target_tag_id: string
      relationship_type: string
      strength: number
    }>
  }>
  created_at: Date
  updated_at: Date
  is_public: boolean
}

export interface TagSearchRequest {
  query?: string
  categories?: TagCategory[]
  subject_areas?: string[]
  difficulty_levels?: ('beginner' | 'intermediate' | 'advanced')[]
  min_frequency?: number
  language?: string
  sort_by?: 'relevance' | 'frequency' | 'alphabetical' | 'recent'
  limit?: number
  offset?: number
}

export interface TagSearchResult {
  tags: Tag[]
  total: number
  aggregations: {
    categories: Record<TagCategory, number>
    subject_areas: Record<string, number>
    difficulty_levels: Record<string, number>
  }
}

export interface TagGenerationRequest {
  document_id: string
  content: string
  language?: string
  subject_area?: string
  max_tags?: number
  min_confidence?: number
}

export interface TagGenerationResult {
  document_id: string
  generated_tags: Array<{
    tag: Omit<Tag, 'id' | 'created_at' | 'updated_at'>
    relevance_score: number
    position_references: number[]
    context_snippet: string
    confidence: number
  }>
  processing_time: number
  language_detected: string
  subject_area_detected: string
}

export interface TagExplanationRequest {
  tag_id: string
  context?: string
  user_level?: 'beginner' | 'intermediate' | 'advanced'
  learning_objective?: string
}

export interface TagExplanation {
  tag_id: string
  definition: string
  detailed_explanation: string
  examples: string[]
  key_points: string[]
  prerequisites: Tag[]
  related_concepts: Tag[]
  study_tips: string[]
  further_reading: Array<{
    title: string
    description: string
    source?: string
  }>
  difficulty_explanation: string
}

export interface StudyPath {
  id: string
  name: string
  description: string
  tags: Array<{
    tag: Tag
    order: number
    estimated_study_time: number
    prerequisites_completed: boolean
  }>
  total_estimated_time: number
  difficulty_progression: 'linear' | 'branching' | 'adaptive'
  created_at: Date
}

export interface TagPreferences {
  user_id: string
  favorite_tags: string[]
  hidden_tags: string[]
  preferred_subjects: string[]
  difficulty_preference: 'beginner' | 'intermediate' | 'advanced'
  language_preference: string
  updated_at: Date
}

export interface TagVisualizationData {
  nodes: Array<{
    id: string
    label: string
    category: TagCategory
    size: number
    color: string
    frequency: number
  }>
  edges: Array<{
    source: string
    target: string
    weight: number
    type: string
  }>
  clusters: Array<{
    id: string
    name: string
    tags: string[]
    center: { x: number; y: number }
  }>
}

export interface TagBookmark {
  id: string
  user_id: string
  tag_id: string
  notes?: string
  created_at: Date
  tag?: Tag
}

export interface TagStatistics {
  total_tags: number
  tags_by_category: Record<TagCategory, number>
  tags_by_subject: Record<string, number>
  tags_by_difficulty: Record<string, number>
  most_popular_tags: Array<{
    tag: Tag
    interaction_count: number
  }>
  trending_tags: Array<{
    tag: Tag
    growth_rate: number
  }>
  user_engagement: {
    average_tags_per_user: number
    most_active_users: Array<{
      user_id: string
      tag_interactions: number
    }>
  }
}
