"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  Tag, 
  TagCategory, 
  TagSearchRequest, 
  TagSearchResult,
  TagInteraction 
} from "types/tags"
import { TagCloud } from "./TagCloud"
import { TagDetail } from "./TagDetail"
import { ConceptMap } from "./ConceptMap"
import { cva, type VariantProps } from "class-variance-authority"
import { twMerge } from "tailwind-merge"

const viewModeStyles = cva(
  ["px-4", "py-2", "rounded-lg", "font-medium", "text-sm", "transition-colors"],
  {
    variants: {
      active: {
        true: ["bg-didattika-blue", "text-white"],
        false: ["bg-gray-100", "text-gray-700", "hover:bg-gray-200"],
      },
    },
  }
)

const filterChipStyles = cva(
  ["inline-flex", "items-center", "gap-1", "px-3", "py-1", "rounded-full", "text-sm", "cursor-pointer", "transition-colors"],
  {
    variants: {
      selected: {
        true: ["bg-didattika-blue", "text-white"],
        false: ["bg-gray-100", "text-gray-700", "hover:bg-gray-200"],
      },
    },
  }
)

type ViewMode = 'cloud' | 'list' | 'map' | 'categories'

interface TagExplorerProps {
  className?: string
  onTagSelect?: (tag: Tag) => void
  onTagInteraction?: (interaction: TagInteraction) => void
  initialTags?: Tag[]
  showFilters?: boolean
  allowBookmarking?: boolean
}

export function TagExplorer({
  className,
  onTagSelect,
  onTagInteraction,
  initialTags = [],
  showFilters = true,
  allowBookmarking = true
}: TagExplorerProps) {
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('cloud')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<TagSearchRequest>({
    sort_by: 'frequency',
    limit: 100
  })
  const [showTagDetail, setShowTagDetail] = useState(false)
  const [bookmarkedTags, setBookmarkedTags] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadTags()
  }, [filters])

  const loadTags = async () => {
    try {
      setLoading(true)
      
      const searchParams = new URLSearchParams({
        query: searchQuery,
        sort_by: filters.sort_by || 'frequency',
        limit: (filters.limit || 100).toString(),
        ...(filters.categories && { categories: filters.categories.join(',') }),
        ...(filters.subject_areas && { subject_areas: filters.subject_areas.join(',') }),
        ...(filters.difficulty_levels && { difficulty_levels: filters.difficulty_levels.join(',') })
      })

      // In production, fetch from API
      // const response = await fetch(`/api/tags/search?${searchParams}`)
      // const data: TagSearchResult = await response.json()
      
      // Mock data for development
      const mockTags = generateMockTags()
      setTags(mockTags)
      
    } catch (error) {
      console.error('Error loading tags:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTags = useMemo(() => {
    let filtered = tags

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(tag =>
        tag.name.toLowerCase().includes(query) ||
        tag.display_name.toLowerCase().includes(query) ||
        tag.description.toLowerCase().includes(query)
      )
    }

    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(tag => filters.categories!.includes(tag.category))
    }

    if (filters.difficulty_levels && filters.difficulty_levels.length > 0) {
      filtered = filtered.filter(tag => filters.difficulty_levels!.includes(tag.difficulty_level))
    }

    if (filters.subject_areas && filters.subject_areas.length > 0) {
      filtered = filtered.filter(tag => filters.subject_areas!.includes(tag.subject_area))
    }

    return filtered
  }, [tags, searchQuery, filters])

  const groupedByCategory = useMemo(() => {
    return filteredTags.reduce((acc, tag) => {
      if (!acc[tag.category]) {
        acc[tag.category] = []
      }
      acc[tag.category].push(tag)
      return acc
    }, {} as Record<TagCategory, Tag[]>)
  }, [filteredTags])

  const handleTagClick = (tag: Tag) => {
    setSelectedTag(tag)
    setShowTagDetail(true)
    
    // Record interaction
    const interaction: TagInteraction = {
      id: `interaction-${Date.now()}`,
      user_id: 'current-user',
      tag_id: tag.id,
      interaction_type: 'view',
      timestamp: new Date()
    }
    
    onTagInteraction?.(interaction)
    onTagSelect?.(tag)
  }

  const handleBookmarkTag = async (tag: Tag) => {
    try {
      const isBookmarked = bookmarkedTags.has(tag.id)
      
      if (isBookmarked) {
        // Remove bookmark
        await fetch(`/api/tags/${tag.id}/bookmark`, { method: 'DELETE' })
        setBookmarkedTags(prev => {
          const updated = new Set(prev)
          updated.delete(tag.id)
          return updated
        })
      } else {
        // Add bookmark
        await fetch(`/api/tags/${tag.id}/bookmark`, { method: 'POST' })
        setBookmarkedTags(prev => new Set(prev).add(tag.id))
      }
      
      // Record interaction
      const interaction: TagInteraction = {
        id: `interaction-${Date.now()}`,
        user_id: 'current-user',
        tag_id: tag.id,
        interaction_type: 'bookmark',
        timestamp: new Date()
      }
      
      onTagInteraction?.(interaction)
      
    } catch (error) {
      console.error('Error bookmarking tag:', error)
    }
  }

  const toggleFilter = (filterType: keyof TagSearchRequest, value: any) => {
    setFilters(prev => {
      const currentValues = prev[filterType] as any[]
      const newValues = currentValues?.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...(currentValues || []), value]
      
      return {
        ...prev,
        [filterType]: newValues.length > 0 ? newValues : undefined
      }
    })
  }

  const categories: TagCategory[] = ['concept', 'skill', 'topic', 'keyword', 'method', 'theory', 'application', 'person', 'date', 'location']
  const difficultyLevels = ['beginner', 'intermediate', 'advanced'] as const
  const subjects = ['matematica', 'fisica', 'chimica', 'storia', 'letteratura', 'geografia', 'generale']

  const getCategoryColor = (category: TagCategory) => {
    const colors = {
      concept: 'bg-blue-100 text-blue-800',
      skill: 'bg-green-100 text-green-800',
      topic: 'bg-yellow-100 text-yellow-800',
      keyword: 'bg-indigo-100 text-indigo-800',
      method: 'bg-pink-100 text-pink-800',
      theory: 'bg-purple-100 text-purple-800',
      application: 'bg-red-100 text-red-800',
      person: 'bg-purple-100 text-purple-800',
      date: 'bg-gray-100 text-gray-800',
      location: 'bg-emerald-100 text-emerald-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryIcon = (category: TagCategory) => {
    const icons = {
      concept: '💡',
      skill: '🎯',
      topic: '📚',
      keyword: '🔑',
      method: '🛠️',
      theory: '🧠',
      application: '⚡',
      person: '👤',
      date: '📅',
      location: '📍'
    }
    return icons[category] || '🏷️'
  }

  return (
    <div className={twMerge("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Esplora Concetti</h2>
          <p className="text-gray-600 mt-1">
            Scopri i concetti chiave dei tuoi documenti e le loro connessioni
          </p>
        </div>
        
        {/* View Mode Toggles */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          {[
            { mode: 'cloud', label: 'Nuvola', icon: '☁️' },
            { mode: 'list', label: 'Lista', icon: '📋' },
            { mode: 'map', label: 'Mappa', icon: '🗺️' },
            { mode: 'categories', label: 'Categorie', icon: '📂' }
          ].map(({ mode, label, icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as ViewMode)}
              className={twMerge(viewModeStyles({ active: viewMode === mode }))}
              title={label}
            >
              <span className="mr-1">{icon}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cerca concetti, abilità, argomenti..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-didattika-blue focus:border-transparent"
            />
            <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filter Chips */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Categorie:</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => toggleFilter('categories', category)}
                    className={twMerge(
                      filterChipStyles({ 
                        selected: filters.categories?.includes(category) 
                      })
                    )}
                  >
                    <span>{getCategoryIcon(category)}</span>
                    <span className="capitalize">{category}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Livello:</label>
              <div className="flex flex-wrap gap-2">
                {difficultyLevels.map(level => (
                  <button
                    key={level}
                    onClick={() => toggleFilter('difficulty_levels', level)}
                    className={twMerge(
                      filterChipStyles({ 
                        selected: filters.difficulty_levels?.includes(level) 
                      })
                    )}
                  >
                    <span>{level === 'beginner' ? '🟢' : level === 'intermediate' ? '🟡' : '🔴'}</span>
                    <span className="capitalize">{level}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Materie:</label>
              <div className="flex flex-wrap gap-2">
                {subjects.map(subject => (
                  <button
                    key={subject}
                    onClick={() => toggleFilter('subject_areas', subject)}
                    className={twMerge(
                      filterChipStyles({ 
                        selected: filters.subject_areas?.includes(subject) 
                      })
                    )}
                  >
                    <span className="capitalize">{subject}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(filters.categories || filters.difficulty_levels || filters.subject_areas || searchQuery) && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setFilters({ sort_by: 'frequency', limit: 100 })
                }}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Cancella tutti i filtri
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredTags.length} concetti trovati
        </p>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Ordina per:</label>
          <select
            value={filters.sort_by}
            onChange={(e) => setFilters(prev => ({ ...prev, sort_by: e.target.value as any }))}
            className="text-sm border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-didattika-blue"
          >
            <option value="frequency">Frequenza</option>
            <option value="relevance">Rilevanza</option>
            <option value="alphabetical">Alfabetico</option>
            <option value="recent">Recenti</option>
          </select>
        </div>
      </div>

      {/* Content Based on View Mode */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-didattika-blue"></div>
          <span className="ml-2 text-gray-600">Caricamento concetti...</span>
        </div>
      ) : filteredTags.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nessun concetto trovato
          </h3>
          <p className="text-gray-600">
            Prova a modificare i filtri di ricerca o carica più documenti
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'cloud' && (
            <TagCloud
              tags={filteredTags}
              onTagClick={handleTagClick}
              onTagBookmark={allowBookmarking ? handleBookmarkTag : undefined}
              bookmarkedTags={bookmarkedTags}
            />
          )}

          {viewMode === 'list' && (
            <div className="space-y-3">
              {filteredTags.map((tag) => (
                <div
                  key={tag.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleTagClick(tag)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{tag.icon || getCategoryIcon(tag.category)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{tag.display_name}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(tag.category)}`}>
                            {tag.category}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            tag.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                            tag.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {tag.difficulty_level}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{tag.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>📊 Frequenza: {tag.frequency}</span>
                          <span>🎯 Confidenza: {(tag.confidence_score * 100).toFixed(0)}%</span>
                          <span>📚 {tag.subject_area}</span>
                        </div>
                      </div>
                    </div>
                    
                    {allowBookmarking && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBookmarkTag(tag)
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          bookmarkedTags.has(tag.id)
                            ? 'text-yellow-500 bg-yellow-50'
                            : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                        }`}
                      >
                        <svg className="w-5 h-5" fill={bookmarkedTags.has(tag.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(groupedByCategory).map(([category, categoryTags]) => (
                <div key={category} className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{getCategoryIcon(category as TagCategory)}</span>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">{category}</h3>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {categoryTags.length}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {categoryTags.slice(0, 5).map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleTagClick(tag)}
                        className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="font-medium text-gray-900 text-sm">{tag.display_name}</div>
                        <div className="text-xs text-gray-500 truncate">{tag.description}</div>
                      </button>
                    ))}
                    
                    {categoryTags.length > 5 && (
                      <button className="text-sm text-didattika-blue hover:text-blue-700 font-medium">
                        Vedi altri {categoryTags.length - 5} concetti...
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'map' && (
            <ConceptMap
              tags={filteredTags}
              onTagClick={handleTagClick}
              onTagBookmark={allowBookmarking ? handleBookmarkTag : undefined}
            />
          )}
        </>
      )}

      {/* Tag Detail Modal */}
      {showTagDetail && selectedTag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <TagDetail
              tag={selectedTag}
              onClose={() => setShowTagDetail(false)}
              onBookmark={allowBookmarking ? () => handleBookmarkTag(selectedTag) : undefined}
              isBookmarked={bookmarkedTags.has(selectedTag.id)}
              onRelatedTagClick={handleTagClick}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Mock data generator for development
function generateMockTags(): Tag[] {
  const mockTags: Tag[] = [
    {
      id: 'tag-1',
      name: 'algebra',
      display_name: 'Algebra',
      description: 'Ramo della matematica che studia le operazioni con simboli e variabili',
      category: 'concept',
      confidence_score: 0.89,
      frequency: 24,
      difficulty_level: 'intermediate',
      subject_area: 'matematica',
      language: 'it',
      created_at: new Date(),
      updated_at: new Date(),
      color: '#3B82F6',
      icon: '🔢'
    },
    {
      id: 'tag-2',
      name: 'rinascimento',
      display_name: 'Rinascimento',
      description: 'Periodo di rinnovamento culturale e artistico in Europa',
      category: 'topic',
      confidence_score: 0.92,
      frequency: 18,
      difficulty_level: 'intermediate',
      subject_area: 'storia',
      language: 'it',
      created_at: new Date(),
      updated_at: new Date(),
      color: '#F59E0B',
      icon: '🎨'
    },
    {
      id: 'tag-3',
      name: 'fotosintesi',
      display_name: 'Fotosintesi',
      description: 'Processo biologico attraverso cui le piante producono energia dalla luce solare',
      category: 'concept',
      confidence_score: 0.87,
      frequency: 15,
      difficulty_level: 'beginner',
      subject_area: 'biologia',
      language: 'it',
      created_at: new Date(),
      updated_at: new Date(),
      color: '#10B981',
      icon: '🌱'
    },
    {
      id: 'tag-4',
      name: 'leonardo-da-vinci',
      display_name: 'Leonardo da Vinci',
      description: 'Artista, inventore e genio universale del Rinascimento italiano',
      category: 'person',
      confidence_score: 0.95,
      frequency: 12,
      difficulty_level: 'beginner',
      subject_area: 'storia',
      language: 'it',
      created_at: new Date(),
      updated_at: new Date(),
      color: '#8B5CF6',
      icon: '👤'
    },
    {
      id: 'tag-5',
      name: 'analisi-critica',
      display_name: 'Analisi Critica',
      description: 'Metodo di valutazione oggettiva e sistematica di testi e argomentazioni',
      category: 'skill',
      confidence_score: 0.78,
      frequency: 21,
      difficulty_level: 'advanced',
      subject_area: 'generale',
      language: 'it',
      created_at: new Date(),
      updated_at: new Date(),
      color: '#EF4444',
      icon: '🔍'
    }
  ]

  return mockTags
}
