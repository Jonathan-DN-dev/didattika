'use client'

import React, { useState, useEffect } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'
import { ChevronLeft, BookOpen, Users, TrendingUp, Clock, ExternalLink, Copy, Check, X } from 'lucide-react'
import type { Tag, TagExplanation, TagCategory, TagAssociation } from '../../types/tags'

const tagDetailStyles = cva(
  ['bg-white', 'rounded-xl', 'shadow-lg', 'overflow-hidden'],
  {
    variants: {
      size: {
        default: ['w-full', 'max-w-4xl'],
        compact: ['w-full', 'max-w-2xl'],
        expanded: ['w-full', 'max-w-6xl'],
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

const sectionStyles = cva(
  ['p-6', 'border-b', 'border-gray-100'],
  {
    variants: {
      variant: {
        header: ['bg-gradient-to-r', 'from-blue-50', 'to-indigo-50', 'border-b-2', 'border-blue-200'],
        content: ['bg-white'],
        footer: ['bg-gray-50', 'border-t', 'border-gray-200'],
      },
    },
    defaultVariants: {
      variant: 'content',
    },
  }
)

export interface TagDetailProps extends VariantProps<typeof tagDetailStyles> {
  tag: Tag
  explanation?: TagExplanation
  associations?: TagAssociation[]
  relatedTags?: Tag[]
  onClose?: () => void
  onNavigateToTag?: (tagId: string) => void
  onViewDocuments?: (tagId: string) => void
  className?: string
}

export function TagDetail({
  tag,
  explanation,
  associations = [],
  relatedTags = [],
  size,
  onClose,
  onNavigateToTag,
  onViewDocuments,
  className,
}: TagDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'explanation' | 'associations' | 'related'>('overview')
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopyTagName = async () => {
    try {
      await navigator.clipboard.writeText(tag.name)
      setCopied('name')
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Failed to copy tag name:', error)
    }
  }

  const handleCopyDescription = async () => {
    try {
      await navigator.clipboard.writeText(tag.description || '')
      setCopied('description')
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Failed to copy description:', error)
    }
  }

  const getCategoryColor = (category: TagCategory) => {
    const colors = {
      subject: 'bg-blue-100 text-blue-800',
      topic: 'bg-green-100 text-green-800',
      skill: 'bg-purple-100 text-purple-800',
      difficulty: 'bg-orange-100 text-orange-800',
      format: 'bg-gray-100 text-gray-800',
      language: 'bg-pink-100 text-pink-800',
      custom: 'bg-indigo-100 text-indigo-800',
    }
    return colors[category] || colors.custom
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'explanation', label: 'AI Explanation', icon: Users, disabled: !explanation },
    { id: 'associations', label: 'Associations', icon: ExternalLink, count: associations.length },
    { id: 'related', label: 'Related Tags', icon: TrendingUp, count: relatedTags.length },
  ]

  return (
    <div className={twMerge(tagDetailStyles({ size }), className)}>
      {/* Header */}
      <div className={sectionStyles({ variant: 'header' })}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {onClose && (
              <button
                onClick={onClose}
                className="mt-1 p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                aria-label="Close tag detail"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{tag.name}</h1>
                <button
                  onClick={handleCopyTagName}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Copy tag name"
                >
                  {copied === 'name' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(tag.category)}`}>
                  {tag.category}
                </span>
                <span className="text-sm text-gray-500">
                  Confidence: {Math.round(tag.confidence * 100)}%
                </span>
                <span className="text-sm text-gray-500">
                  Used {tag.usageCount} time{tag.usageCount !== 1 ? 's' : ''}
                </span>
              </div>
              {tag.description && (
                <div className="flex items-start space-x-2">
                  <p className="text-gray-700 leading-relaxed">{tag.description}</p>
                  <button
                    onClick={handleCopyDescription}
                    className="mt-1 p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    aria-label="Copy description"
                  >
                    {copied === 'description' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div className="flex items-center space-x-1 mb-1">
              <Clock className="w-4 h-4" />
              <span>Created {formatDate(tag.createdAt)}</span>
            </div>
            {tag.lastUsed && (
              <div>Last used {formatDate(tag.lastUsed)}</div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const isDisabled = tab.disabled

            return (
              <button
                key={tab.id}
                onClick={() => !isDisabled && setActiveTab(tab.id as typeof activeTab)}
                disabled={isDisabled}
                className={twMerge(
                  'flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors',
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : isDisabled
                    ? 'border-transparent text-gray-400 cursor-not-allowed'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className={sectionStyles({ variant: 'content' })}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Usage Count</span>
                    <span className="font-medium">{tag.usageCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Confidence Score</span>
                    <span className="font-medium">{Math.round(tag.confidence * 100)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Category</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getCategoryColor(tag.category)}`}>
                      {tag.category}
                    </span>
                  </div>
                  {tag.synonyms && tag.synonyms.length > 0 && (
                    <div>
                      <span className="text-gray-600 block mb-2">Synonyms</span>
                      <div className="flex flex-wrap gap-1">
                        {tag.synonyms.map((synonym, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                          >
                            {synonym}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Actions</h3>
                <div className="space-y-2">
                  {onViewDocuments && (
                    <button
                      onClick={() => onViewDocuments(tag.id)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>View Documents ({tag.usageCount})</span>
                    </button>
                  )}
                  <button
                    onClick={handleCopyTagName}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    {copied === 'name' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span>Copy Tag Name</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'explanation' && explanation && (
          <div className={sectionStyles({ variant: 'content' })}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">AI-Generated Explanation</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{explanation.content}</p>
                </div>
              </div>

              {explanation.examples && explanation.examples.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Examples</h4>
                  <div className="space-y-2">
                    {explanation.examples.map((example, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-700">{example}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {explanation.relatedConcepts && explanation.relatedConcepts.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Related Concepts</h4>
                  <div className="flex flex-wrap gap-2">
                    {explanation.relatedConcepts.map((concept, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Confidence: {Math.round(explanation.confidence * 100)}%</span>
                  <span>Generated {formatDate(explanation.generatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'associations' && (
          <div className={sectionStyles({ variant: 'content' })}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Document Associations</h3>
              {associations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No document associations found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {associations.map((association) => (
                    <div
                      key={association.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            Document #{association.documentId}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            Confidence: {Math.round(association.confidence * 100)}%
                          </p>
                          {association.context && (
                            <p className="text-sm text-gray-700 italic">"{association.context}"</p>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(association.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'related' && (
          <div className={sectionStyles({ variant: 'content' })}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Related Tags</h3>
              {relatedTags.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No related tags found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {relatedTags.map((relatedTag) => (
                    <div
                      key={relatedTag.id}
                      className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer"
                      onClick={() => onNavigateToTag?.(relatedTag.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{relatedTag.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(relatedTag.category)}`}>
                          {relatedTag.category}
                        </span>
                      </div>
                      {relatedTag.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {relatedTag.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Used {relatedTag.usageCount} times</span>
                        <span>{Math.round(relatedTag.confidence * 100)}% confidence</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
