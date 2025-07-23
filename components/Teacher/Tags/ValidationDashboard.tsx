'use client'

import React, { useState, useEffect } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'
import { 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Flag, 
  Search, 
  Filter, 
  Download,
  TrendingUp,
  BarChart3,
  Users,
  Clock,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Shuffle,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react'
import type { 
  TagValidation, 
  TagAnalytics, 
  TagValidationFilters,
  TagValidationRequest,
  BulkTagOperation 
} from '../../../types/teacher-tags'
import type { Tag } from '../../../types/tags'

const dashboardStyles = cva(
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
        header: ['p-6', 'bg-gradient-to-r', 'from-blue-50', 'to-indigo-50', 'border-blue-200'],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const tagItemStyles = cva(
  ['p-4', 'border', 'rounded-lg', 'transition-all', 'duration-200'],
  {
    variants: {
      status: {
        pending: ['border-yellow-200', 'bg-yellow-50', 'hover:border-yellow-300'],
        approved: ['border-green-200', 'bg-green-50', 'hover:border-green-300'],
        rejected: ['border-red-200', 'bg-red-50', 'hover:border-red-300'],
        modified: ['border-blue-200', 'bg-blue-50', 'hover:border-blue-300'],
      },
    },
    defaultVariants: {
      status: 'pending',
    },
  }
)

export interface ValidationDashboardProps extends VariantProps<typeof dashboardStyles> {
  pendingValidations: TagValidation[]
  analytics: TagAnalytics
  onValidateTag: (request: TagValidationRequest) => Promise<void>
  onBulkOperation: (operation: BulkTagOperation) => Promise<void>
  onExportReport: () => Promise<void>
  className?: string
}

export function ValidationDashboard({
  pendingValidations,
  analytics,
  layout,
  onValidateTag,
  onBulkOperation,
  onExportReport,
  className,
}: ValidationDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<TagValidationFilters>({})
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [validatingTag, setValidatingTag] = useState<string | null>(null)
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ name: string; description: string }>({ name: '', description: '' })

  const filteredValidations = pendingValidations.filter(validation => {
    const matchesSearch = searchTerm === '' || 
      validation.validatedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      validation.originalName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = !filters.status || validation.feedbackType === filters.status
    const matchesConfidence = !filters.confidenceRange || 
      (validation.confidence >= filters.confidenceRange[0] && validation.confidence <= filters.confidenceRange[1])

    return matchesSearch && matchesStatus && matchesConfidence
  })

  const handleValidateTag = async (tagId: string, action: 'approve' | 'reject' | 'modify', additionalData?: any) => {
    try {
      setValidatingTag(tagId)
      
      const request: TagValidationRequest = {
        tagId,
        action,
        ...additionalData,
      }

      await onValidateTag(request)
      
      // Remove from selected tags after validation
      setSelectedTags(prev => prev.filter(id => id !== tagId))
    } catch (error) {
      console.error('Error validating tag:', error)
    } finally {
      setValidatingTag(null)
      setEditingTag(null)
    }
  }

  const handleBulkApprove = async () => {
    if (selectedTags.length === 0) return

    try {
      await onBulkOperation({
        operation: 'approve',
        tagIds: selectedTags,
        reason: 'Bulk approval',
      })
      setSelectedTags([])
    } catch (error) {
      console.error('Error in bulk approve:', error)
    }
  }

  const handleBulkReject = async () => {
    if (selectedTags.length === 0) return

    try {
      await onBulkOperation({
        operation: 'reject',
        tagIds: selectedTags,
        reason: 'Bulk rejection',
      })
      setSelectedTags([])
    } catch (error) {
      console.error('Error in bulk reject:', error)
    }
  }

  const startEdit = (validation: TagValidation) => {
    setEditingTag(validation.tagId)
    setEditValues({
      name: validation.validatedName,
      description: validation.validatedDescription || '',
    })
  }

  const saveEdit = async (tagId: string) => {
    try {
      await handleValidateTag(tagId, 'modify', {
        newName: editValues.name,
        newDescription: editValues.description,
        reasonForChange: 'Teacher manual edit',
      })
    } catch (error) {
      console.error('Error saving edit:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'modified':
        return <Edit3 className="w-5 h-5 text-blue-600" />
      case 'flagged':
        return <Flag className="w-5 h-5 text-orange-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className={twMerge(dashboardStyles({ layout }), className)}>
      {/* Header with Analytics Overview */}
      <div className={cardStyles({ variant: 'header' })}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tag Validation Dashboard</h1>
            <p className="text-gray-600 mt-1">Review and manage AI-generated tags from student documents</p>
          </div>
          <button
            onClick={onExportReport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.pendingReview}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.approvedTags}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-orange-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Edit3 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Modified</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.modifiedTags}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(analytics.averageConfidence * 100)}%</p>
              </div>
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
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            {selectedTags.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedTags.length} selected</span>
                <button
                  onClick={handleBulkApprove}
                  className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={handleBulkReject}
                  className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="modified">Modified</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Confidence</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={filters.confidenceRange?.[0] || 0}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    confidenceRange: [parseFloat(e.target.value), prev.confidenceRange?.[1] || 1] 
                  }))}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">{Math.round((filters.confidenceRange?.[0] || 0) * 100)}%</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={filters.sortBy || 'date'}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Date</option>
                  <option value="confidence">Confidence</option>
                  <option value="alphabetical">Alphabetical</option>
                  <option value="usage">Usage Count</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tag Validation List */}
      <div className={cardStyles()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Tags Pending Validation ({filteredValidations.length})
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedTags(filteredValidations.map(v => v.tagId))}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedTags([])}
              className="text-sm text-gray-600 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredValidations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No tags pending validation</p>
              <p className="text-sm">All tags have been reviewed!</p>
            </div>
          ) : (
            filteredValidations.map((validation) => (
              <div
                key={validation.id}
                className={tagItemStyles({ status: validation.feedbackType as any })}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(validation.tagId)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTags(prev => [...prev, validation.tagId])
                        } else {
                          setSelectedTags(prev => prev.filter(id => id !== validation.tagId))
                        }
                      }}
                      className="mt-1"
                    />

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(validation.feedbackType)}
                        {editingTag === validation.tagId ? (
                          <input
                            type="text"
                            value={editValues.name}
                            onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                            className="text-lg font-semibold text-gray-900 bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-500"
                            onBlur={() => saveEdit(validation.tagId)}
                            onKeyPress={(e) => e.key === 'Enter' && saveEdit(validation.tagId)}
                            autoFocus
                          />
                        ) : (
                          <h3 className="text-lg font-semibold text-gray-900">{validation.validatedName}</h3>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(validation.confidence)}`}>
                          {Math.round(validation.confidence * 100)}%
                        </span>
                      </div>

                      {validation.originalName !== validation.validatedName && (
                        <p className="text-sm text-gray-500 mb-2">
                          Originally: <span className="line-through">{validation.originalName}</span>
                        </p>
                      )}

                      {editingTag === validation.tagId ? (
                        <textarea
                          value={editValues.description}
                          onChange={(e) => setEditValues(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full text-gray-700 bg-transparent border border-blue-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500 resize-none"
                          rows={2}
                          onBlur={() => saveEdit(validation.tagId)}
                        />
                      ) : (
                        <p className="text-gray-700">{validation.validatedDescription}</p>
                      )}

                      {validation.feedback && (
                        <p className="text-sm text-gray-600 mt-2 italic">"{validation.feedback}"</p>
                      )}

                      <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                        <span>Tag ID: {validation.tagId}</span>
                        <span>Timestamp: {validation.timestamp.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleValidateTag(validation.tagId, 'approve')}
                      disabled={validatingTag === validation.tagId}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Approve tag"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => startEdit(validation)}
                      disabled={validatingTag === validation.tagId}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Edit tag"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleValidateTag(validation.tagId, 'reject', { 
                        feedback: 'Rejected by teacher' 
                      })}
                      disabled={validatingTag === validation.tagId}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Reject tag"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>

                    <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
