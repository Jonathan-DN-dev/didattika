'use client'

import React, { useState, useEffect } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Download, 
  Upload,
  Search,
  Filter,
  MoreVertical,
  Tag as TagIcon,
  Folder,
  BookOpen,
  Users,
  Settings,
  ChevronRight,
  ChevronDown,
  Save,
  X,
  Check,
  AlertCircle,
  Grid,
  List
} from 'lucide-react'
import type { 
  CustomTag, 
  TagTemplate, 
  TagHierarchy, 
  BulkTagOperation,
  TeacherTagPreferences 
} from '../../../types/teacher-tags'
import type { Tag, TagCategory } from '../../../types/tags'

const managerStyles = cva(
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
  ['bg-white', 'rounded-xl', 'shadow-sm', 'border', 'border-gray-200', 'p-6'],
  {
    variants: {
      variant: {
        default: [],
        compact: ['p-4'],
        header: ['bg-gradient-to-r', 'from-indigo-50', 'to-purple-50', 'border-indigo-200'],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface TagManagerProps extends VariantProps<typeof managerStyles> {
  customTags: CustomTag[]
  templates: TagTemplate[]
  hierarchies: TagHierarchy[]
  preferences: TeacherTagPreferences
  onCreateTag: (tag: Omit<CustomTag, 'teacherId'>) => Promise<void>
  onUpdateTag: (tagId: string, updates: Partial<CustomTag>) => Promise<void>
  onDeleteTag: (tagId: string) => Promise<void>
  onCreateTemplate: (template: Omit<TagTemplate, 'id' | 'teacherId' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onBulkOperation: (operation: BulkTagOperation) => Promise<void>
  onImportTags: (file: File) => Promise<void>
  onExportTags: (tagIds: string[]) => Promise<void>
  className?: string
}

export function TagManager({
  customTags,
  templates,
  hierarchies,
  preferences,
  layout,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
  onCreateTemplate,
  onBulkOperation,
  onImportTags,
  onExportTags,
  className,
}: TagManagerProps) {
  const [activeTab, setActiveTab] = useState<'tags' | 'templates' | 'hierarchies' | 'preferences'>('tags')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [newTag, setNewTag] = useState<Partial<CustomTag>>({
    name: '',
    description: '',
    category: 'subject',
    confidence: 1.0,
    subjectArea: preferences.subjectArea,
    curriculumAlignment: [],
    learningObjectives: [],
    assessmentCriteria: [],
    gradeLevel: '',
    isTemplate: false,
  })

  const filteredTags = customTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateTag = async () => {
    if (!newTag.name || !newTag.description) return

    try {
      await onCreateTag(newTag as Omit<CustomTag, 'teacherId'>)
      setNewTag({
        name: '',
        description: '',
        category: 'subject',
        confidence: 1.0,
        subjectArea: preferences.subjectArea,
        curriculumAlignment: [],
        learningObjectives: [],
        assessmentCriteria: [],
        gradeLevel: '',
        isTemplate: false,
      })
      setIsCreating(false)
    } catch (error) {
      console.error('Error creating tag:', error)
    }
  }

  const handleUpdateTag = async (tagId: string, updates: Partial<CustomTag>) => {
    try {
      await onUpdateTag(tagId, updates)
      setEditingTag(null)
    } catch (error) {
      console.error('Error updating tag:', error)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedTags.length === 0) return

    try {
      await onBulkOperation({
        operation: 'delete',
        tagIds: selectedTags,
        reason: 'Bulk deletion',
      })
      setSelectedTags([])
    } catch (error) {
      console.error('Error in bulk delete:', error)
    }
  }

  const handleExportSelected = async () => {
    if (selectedTags.length === 0) return

    try {
      await onExportTags(selectedTags)
    } catch (error) {
      console.error('Error exporting tags:', error)
    }
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      await onImportTags(file)
      // Reset the input
      event.target.value = ''
    } catch (error) {
      console.error('Error importing tags:', error)
    }
  }

  const categories: TagCategory[] = ['subject', 'topic', 'skill', 'difficulty', 'format', 'language', 'custom']

  const tabs = [
    { id: 'tags', label: 'Custom Tags', icon: TagIcon, count: customTags.length },
    { id: 'templates', label: 'Templates', icon: Folder, count: templates.length },
    { id: 'hierarchies', label: 'Hierarchies', icon: BookOpen, count: hierarchies.length },
    { id: 'preferences', label: 'Preferences', icon: Settings, count: 0 },
  ]

  return (
    <div className={twMerge(managerStyles({ layout }), className)}>
      {/* Header */}
      <div className={cardStyles({ variant: 'header' })}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tag Management</h1>
            <p className="text-gray-600 mt-1">Create, organize, and manage your custom educational tags</p>
          </div>
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>Import</span>
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Tag</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={twMerge(
                  'flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors',
                  isActive
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
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
      {activeTab === 'tags' && (
        <div className="space-y-6">
          {/* Search and Controls */}
          <div className={cardStyles()}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search custom tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {selectedTags.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{selectedTags.length} selected</span>
                    <button
                      onClick={handleExportSelected}
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
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
          </div>

          {/* Create Tag Form */}
          {isCreating && (
            <div className={cardStyles()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Create Custom Tag</h3>
                <button
                  onClick={() => setIsCreating(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tag Name *</label>
                    <input
                      type="text"
                      value={newTag.name}
                      onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter tag name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={newTag.description}
                      onChange={(e) => setNewTag(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Describe the tag's purpose and usage"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={newTag.category}
                      onChange={(e) => setNewTag(prev => ({ ...prev, category: e.target.value as TagCategory }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                    <input
                      type="text"
                      value={newTag.gradeLevel}
                      onChange={(e) => setNewTag(prev => ({ ...prev, gradeLevel: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., K-2, 3-5, 6-8, 9-12"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject Area</label>
                    <input
                      type="text"
                      value={newTag.subjectArea}
                      onChange={(e) => setNewTag(prev => ({ ...prev, subjectArea: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., Mathematics, Science, Language Arts"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Learning Objectives</label>
                    <textarea
                      value={newTag.learningObjectives?.join('\n')}
                      onChange={(e) => setNewTag(prev => ({ 
                        ...prev, 
                        learningObjectives: e.target.value.split('\n').filter(obj => obj.trim()) 
                      }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter each objective on a new line"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Curriculum Alignment</label>
                    <textarea
                      value={newTag.curriculumAlignment?.join('\n')}
                      onChange={(e) => setNewTag(prev => ({ 
                        ...prev, 
                        curriculumAlignment: e.target.value.split('\n').filter(align => align.trim()) 
                      }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., Common Core, State Standards"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newTag.isTemplate}
                        onChange={(e) => setNewTag(prev => ({ ...prev, isTemplate: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Save as template</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTag}
                  disabled={!newTag.name || !newTag.description}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>Create Tag</span>
                </button>
              </div>
            </div>
          )}

          {/* Tags Display */}
          <div className={cardStyles()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Custom Tags ({filteredTags.length})
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedTags(filteredTags.map(tag => tag.name))}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
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

            {filteredTags.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TagIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No custom tags found</p>
                <p className="text-sm">Create your first custom tag to get started!</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTags.map((tag) => (
                  <div
                    key={tag.name}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTags(prev => [...prev, tag.name])
                            } else {
                              setSelectedTags(prev => prev.filter(id => id !== tag.name))
                            }
                          }}
                        />
                        <h4 className="font-medium text-gray-900">{tag.name}</h4>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setEditingTag(tag.name)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTag(tag.name)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tag.description}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {tag.category}
                      </span>
                      {tag.gradeLevel && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {tag.gradeLevel}
                        </span>
                      )}
                      {tag.isTemplate && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          Template
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-gray-500">
                      <p>Subject: {tag.subjectArea}</p>
                      {tag.usageCount !== undefined && (
                        <p>Used: {tag.usageCount} times</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTags.map((tag) => (
                  <div
                    key={tag.name}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTags(prev => [...prev, tag.name])
                          } else {
                            setSelectedTags(prev => prev.filter(id => id !== tag.name))
                          }
                        }}
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{tag.name}</h4>
                        <p className="text-sm text-gray-600">{tag.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex space-x-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {tag.category}
                        </span>
                        {tag.isTemplate && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            Template
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setEditingTag(tag.name)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTag(tag.name)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className={cardStyles()}>
          <div className="text-center py-8 text-gray-500">
            <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Template management coming soon</p>
            <p className="text-sm">Create reusable tag templates for consistent tagging</p>
          </div>
        </div>
      )}

      {/* Hierarchies Tab */}
      {activeTab === 'hierarchies' && (
        <div className={cardStyles()}>
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Hierarchy editor coming soon</p>
            <p className="text-sm">Build tag relationships and hierarchies for better organization</p>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className={cardStyles()}>
          <div className="text-center py-8 text-gray-500">
            <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Preferences panel coming soon</p>
            <p className="text-sm">Configure AI tagging preferences and standards</p>
          </div>
        </div>
      )}
    </div>
  )
}
