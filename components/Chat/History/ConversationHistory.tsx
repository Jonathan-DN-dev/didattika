'use client'

import React, { useState, useEffect } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'
import { 
  Search, 
  Filter, 
  Clock, 
  MessageSquare, 
  Star, 
  StarOff,
  MoreVertical,
  Play,
  Edit3,
  Download,
  Trash2,
  Archive,
  Tag as TagIcon,
  Calendar,
  User,
  FileText,
  ChevronDown,
  Grid,
  List,
  SortAsc,
  SortDesc,
  RefreshCw
} from 'lucide-react'
import type { 
  ConversationMetadata, 
  ConversationHistoryFilters,
  ConversationListItem,
  ConversationAction,
  ConversationBulkOperation
} from '../../../types/conversation-history'

const historyStyles = cva(
  ['w-full', 'space-y-6'],
  {
    variants: {
      layout: {
        compact: ['space-y-4'],
        default: ['space-y-6'],
        expanded: ['space-y-8'],
      },
    },
    defaultVariants: {
      layout: 'default',
    },
  }
)

const cardStyles = cva(
  ['bg-white', 'rounded-xl', 'shadow-sm', 'border', 'border-gray-200'],
  {
    variants: {
      variant: {
        default: ['p-6'],
        compact: ['p-4'],
        header: ['p-6', 'bg-gradient-to-r', 'from-purple-50', 'to-pink-50', 'border-purple-200'],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const conversationItemStyles = cva(
  ['p-4', 'border', 'rounded-lg', 'transition-all', 'duration-200', 'hover:shadow-md'],
  {
    variants: {
      status: {
        active: ['border-green-200', 'bg-green-50', 'hover:border-green-300'],
        archived: ['border-gray-200', 'bg-gray-50', 'hover:border-gray-300'],
        completed: ['border-blue-200', 'bg-blue-50', 'hover:border-blue-300'],
      },
      selected: {
        true: ['ring-2', 'ring-purple-500', 'border-purple-300'],
        false: [],
      },
    },
    defaultVariants: {
      status: 'active',
      selected: false,
    },
  }
)

export interface ConversationHistoryProps extends VariantProps<typeof historyStyles> {
  conversations: ConversationListItem[]
  isLoading?: boolean
  onConversationAction: (conversationId: string, action: ConversationAction) => Promise<void>
  onBulkOperation: (operation: ConversationBulkOperation) => Promise<void>
  onLoadMore?: () => Promise<void>
  hasMore?: boolean
  className?: string
}

export function ConversationHistory({
  conversations,
  isLoading = false,
  layout,
  onConversationAction,
  onBulkOperation,
  onLoadMore,
  hasMore = false,
  className,
}: ConversationHistoryProps) {
  const [filters, setFilters] = useState<ConversationHistoryFilters>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedConversations, setSelectedConversations] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'lastAccessed' | 'messageCount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchTerm === '' || 
      conv.metadata.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.metadata.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.preview.firstLine.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPersona = !filters.persona || conv.metadata.personaType === filters.persona
    const matchesStatus = !filters.status || conv.metadata.status === filters.status
    const matchesStarred = filters.isStarred === undefined || conv.metadata.isStarred === filters.isStarred
    const matchesCategory = !filters.category || conv.metadata.category === filters.category

    return matchesSearch && matchesPersona && matchesStatus && matchesStarred && matchesCategory
  })

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    let aValue: any, bValue: any

    switch (sortBy) {
      case 'title':
        aValue = a.metadata.title.toLowerCase()
        bValue = b.metadata.title.toLowerCase()
        break
      case 'lastAccessed':
        aValue = a.metadata.lastAccessed.getTime()
        bValue = b.metadata.lastAccessed.getTime()
        break
      case 'messageCount':
        aValue = a.metadata.messageCount
        bValue = b.metadata.messageCount
        break
      case 'date':
      default:
        aValue = a.metadata.createdAt.getTime()
        bValue = b.metadata.createdAt.getTime()
        break
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const handleSelectAll = () => {
    if (selectedConversations.length === sortedConversations.length) {
      setSelectedConversations([])
    } else {
      setSelectedConversations(sortedConversations.map(conv => conv.metadata.id))
    }
  }

  const handleBulkArchive = async () => {
    if (selectedConversations.length === 0) return

    try {
      await onBulkOperation({
        action: 'archive',
        conversationIds: selectedConversations,
      })
      setSelectedConversations([])
    } catch (error) {
      console.error('Error archiving conversations:', error)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedConversations.length === 0) return

    const confirmed = window.confirm(`Are you sure you want to delete ${selectedConversations.length} conversations? This action cannot be undone.`)
    if (!confirmed) return

    try {
      await onBulkOperation({
        action: 'delete',
        conversationIds: selectedConversations,
      })
      setSelectedConversations([])
    } catch (error) {
      console.error('Error deleting conversations:', error)
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
        -Math.floor(diffInHours),
        'hour'
      )
    } else if (diffInHours < 168) { // 7 days
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
        -Math.floor(diffInHours / 24),
        'day'
      )
    } else {
      return date.toLocaleDateString()
    }
  }

  const getPersonaIcon = (personaType: string) => {
    // Simple icon mapping based on persona type
    switch (personaType) {
      case 'math_tutor':
        return '📊'
      case 'science_teacher':
        return '🔬'
      case 'writing_coach':
        return '✍️'
      case 'history_guide':
        return '📚'
      default:
        return '🤖'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={twMerge(historyStyles({ layout }), className)}>
      {/* Header */}
      <div className={cardStyles({ variant: 'header' })}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Conversation History</h1>
            <p className="text-gray-600 mt-1">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={cardStyles()}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                <option value="date">Date</option>
                <option value="title">Title</option>
                <option value="lastAccessed">Last Accessed</option>
                <option value="messageCount">Message Count</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>

            {selectedConversations.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedConversations.length} selected</span>
                <button
                  onClick={handleBulkArchive}
                  className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  <Archive className="w-4 h-4" />
                  <span>Archive</span>
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Persona</label>
                <select
                  value={filters.persona || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, persona: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Personas</option>
                  <option value="math_tutor">Math Tutor</option>
                  <option value="science_teacher">Science Teacher</option>
                  <option value="writing_coach">Writing Coach</option>
                  <option value="history_guide">History Guide</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="Language Arts">Language Arts</option>
                  <option value="History">History</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Starred</label>
                <select
                  value={filters.isStarred === undefined ? '' : filters.isStarred.toString()}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    isStarred: e.target.value === '' ? undefined : e.target.value === 'true' 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Conversations</option>
                  <option value="true">Starred Only</option>
                  <option value="false">Not Starred</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Conversation List */}
      <div className={cardStyles()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {sortedConversations.length} Conversation{sortedConversations.length !== 1 ? 's' : ''}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSelectAll}
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              {selectedConversations.length === sortedConversations.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading conversations...</p>
          </div>
        ) : sortedConversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No conversations found</p>
            <p className="text-sm">Start a new conversation to see it here!</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            {sortedConversations.map((conversation) => (
              <div
                key={conversation.metadata.id}
                className={conversationItemStyles({ 
                  status: conversation.metadata.status as any,
                  selected: selectedConversations.includes(conversation.metadata.id)
                })}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedConversations.includes(conversation.metadata.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedConversations(prev => [...prev, conversation.metadata.id])
                        } else {
                          setSelectedConversations(prev => prev.filter(id => id !== conversation.metadata.id))
                        }
                      }}
                      className="mt-1"
                    />

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{getPersonaIcon(conversation.metadata.personaType)}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{conversation.metadata.title}</h3>
                        {conversation.metadata.isStarred && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conversation.metadata.status)}`}>
                          {conversation.metadata.status}
                        </span>
                      </div>

                      {conversation.metadata.description && (
                        <p className="text-gray-600 mb-2">{conversation.metadata.description}</p>
                      )}

                      <div className="flex flex-wrap gap-2 mb-3">
                        {conversation.metadata.topics.map((topic, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            {topic}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{conversation.metadata.messageCount} messages</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(conversation.metadata.lastAccessed)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Created {formatDate(conversation.metadata.createdAt)}</span>
                        </span>
                        {conversation.metadata.documentIds.length > 0 && (
                          <span className="flex items-center space-x-1">
                            <FileText className="w-4 h-4" />
                            <span>{conversation.metadata.documentIds.length} docs</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    {conversation.actions.canResume && (
                      <button
                        onClick={() => onConversationAction(conversation.metadata.id, 'resume')}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="Resume conversation"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => onConversationAction(
                        conversation.metadata.id, 
                        conversation.metadata.isStarred ? 'unstar' : 'star'
                      )}
                      className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                      title={conversation.metadata.isStarred ? 'Remove star' : 'Add star'}
                    >
                      {conversation.metadata.isStarred ? (
                        <StarOff className="w-4 h-4" />
                      ) : (
                        <Star className="w-4 h-4" />
                      )}
                    </button>

                    {conversation.actions.canEdit && (
                      <button
                        onClick={() => onConversationAction(conversation.metadata.id, 'edit')}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit conversation"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}

                    {conversation.actions.canExport && (
                      <button
                        onClick={() => onConversationAction(conversation.metadata.id, 'export')}
                        className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                        title="Export conversation"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}

                    <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedConversations.map((conversation) => (
              <div key={conversation.metadata.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg">{getPersonaIcon(conversation.metadata.personaType)}</span>
                  <input
                    type="checkbox"
                    checked={selectedConversations.includes(conversation.metadata.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedConversations(prev => [...prev, conversation.metadata.id])
                      } else {
                        setSelectedConversations(prev => prev.filter(id => id !== conversation.metadata.id))
                      }
                    }}
                  />
                </div>

                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{conversation.metadata.title}</h3>
                
                <div className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {conversation.metadata.description || conversation.preview.firstLine}
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                  <span>{conversation.metadata.messageCount} messages</span>
                  <span>{formatDate(conversation.metadata.lastAccessed)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conversation.metadata.status)}`}>
                    {conversation.metadata.status}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onConversationAction(conversation.metadata.id, 'resume')}
                      className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onConversationAction(conversation.metadata.id, 'export')}
                      className="p-1 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="text-center mt-6">
            <button
              onClick={onLoadMore}
              disabled={isLoading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
