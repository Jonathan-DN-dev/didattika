"use client"

import { useState, useMemo } from "react"
import { Tag } from "types/tags"
import { cva, type VariantProps } from "class-variance-authority"
import { twMerge } from "tailwind-merge"

const tagStyles = cva(
  ["inline-flex", "items-center", "gap-2", "px-3", "py-2", "rounded-full", "cursor-pointer", "transition-all", "duration-200", "font-medium", "hover:shadow-md", "transform", "hover:-translate-y-1"],
  {
    variants: {
      size: {
        xs: ["text-xs", "px-2", "py-1"],
        sm: ["text-sm", "px-3", "py-1.5"],
        md: ["text-base", "px-4", "py-2"],
        lg: ["text-lg", "px-5", "py-2.5"],
        xl: ["text-xl", "px-6", "py-3"],
      },
      category: {
        concept: ["bg-blue-100", "text-blue-800", "hover:bg-blue-200"],
        skill: ["bg-green-100", "text-green-800", "hover:bg-green-200"],
        topic: ["bg-yellow-100", "text-yellow-800", "hover:bg-yellow-200"],
        keyword: ["bg-indigo-100", "text-indigo-800", "hover:bg-indigo-200"],
        method: ["bg-pink-100", "text-pink-800", "hover:bg-pink-200"],
        theory: ["bg-purple-100", "text-purple-800", "hover:bg-purple-200"],
        application: ["bg-red-100", "text-red-800", "hover:bg-red-200"],
        person: ["bg-purple-100", "text-purple-800", "hover:bg-purple-200"],
        date: ["bg-gray-100", "text-gray-800", "hover:bg-gray-200"],
        location: ["bg-emerald-100", "text-emerald-800", "hover:bg-emerald-200"],
      },
      difficulty: {
        beginner: ["border-2", "border-green-300"],
        intermediate: ["border-2", "border-yellow-300"],
        advanced: ["border-2", "border-red-300"],
      },
      bookmarked: {
        true: ["ring-2", "ring-yellow-400", "shadow-lg"],
        false: [],
      },
    },
    defaultVariants: {
      size: "md",
      bookmarked: false,
    },
  }
)

interface TagCloudProps {
  tags: Tag[]
  onTagClick: (tag: Tag) => void
  onTagBookmark?: (tag: Tag) => void
  bookmarkedTags?: Set<string>
  className?: string
  maxTags?: number
  sizingMethod?: 'frequency' | 'confidence' | 'uniform'
  layout?: 'flow' | 'centered' | 'grid'
}

export function TagCloud({
  tags,
  onTagClick,
  onTagBookmark,
  bookmarkedTags = new Set(),
  className,
  maxTags = 50,
  sizingMethod = 'frequency',
  layout = 'flow'
}: TagCloudProps) {
  const [hoveredTag, setHoveredTag] = useState<string | null>(null)
  const [animationDelay, setAnimationDelay] = useState(false)

  // Calculate tag sizes based on the selected method
  const tagsWithSizes = useMemo(() => {
    const limitedTags = tags.slice(0, maxTags)
    
    if (limitedTags.length === 0) return []

    let values: number[]
    switch (sizingMethod) {
      case 'frequency':
        values = limitedTags.map(tag => tag.frequency)
        break
      case 'confidence':
        values = limitedTags.map(tag => tag.confidence_score)
        break
      case 'uniform':
      default:
        return limitedTags.map(tag => ({ ...tag, size: 'md' as const }))
    }

    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
    const range = maxValue - minValue || 1

    return limitedTags.map((tag, index) => {
      const value = values[index]
      const normalizedValue = (value - minValue) / range
      
      let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
      if (normalizedValue < 0.2) size = 'xs'
      else if (normalizedValue < 0.4) size = 'sm'
      else if (normalizedValue < 0.6) size = 'md'
      else if (normalizedValue < 0.8) size = 'lg'
      else size = 'xl'

      return { ...tag, size }
    })
  }, [tags, maxTags, sizingMethod])

  // Sort tags for better visual distribution
  const sortedTags = useMemo(() => {
    const sorted = [...tagsWithSizes]
    
    // Mix sizes for better visual balance
    const large = sorted.filter(t => ['lg', 'xl'].includes(t.size))
    const medium = sorted.filter(t => t.size === 'md')
    const small = sorted.filter(t => ['xs', 'sm'].includes(t.size))
    
    const mixed: typeof sorted = []
    const maxLength = Math.max(large.length, medium.length, small.length)
    
    for (let i = 0; i < maxLength; i++) {
      if (large[i]) mixed.push(large[i])
      if (medium[i * 2]) mixed.push(medium[i * 2])
      if (small[i * 3]) mixed.push(small[i * 3])
      if (medium[i * 2 + 1]) mixed.push(medium[i * 2 + 1])
      if (small[i * 3 + 1]) mixed.push(small[i * 3 + 1])
      if (small[i * 3 + 2]) mixed.push(small[i * 3 + 2])
    }
    
    return mixed
  }, [tagsWithSizes])

  const getLayoutStyles = () => {
    switch (layout) {
      case 'centered':
        return 'flex flex-wrap justify-center items-center gap-3'
      case 'grid':
        return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'
      case 'flow':
      default:
        return 'flex flex-wrap gap-3 justify-start items-center'
    }
  }

  const handleTagClick = (tag: Tag) => {
    setAnimationDelay(true)
    setTimeout(() => setAnimationDelay(false), 300)
    onTagClick(tag)
  }

  if (tagsWithSizes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">☁️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nessun tag disponibile
        </h3>
        <p className="text-gray-600">
          Carica alcuni documenti per vedere i concetti estratti
        </p>
      </div>
    )
  }

  return (
    <div className={twMerge("bg-white border border-gray-200 rounded-xl p-8", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Nuvola dei Concetti</h3>
          <p className="text-sm text-gray-600">
            La dimensione indica {sizingMethod === 'frequency' ? 'la frequenza' : 'la confidenza'} del concetto
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-300 rounded-full"></span>
            Principiante
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-yellow-300 rounded-full"></span>
            Intermedio
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-300 rounded-full"></span>
            Avanzato
          </span>
        </div>
      </div>

      {/* Tag Cloud */}
      <div className={getLayoutStyles()}>
        {sortedTags.map((tag, index) => (
          <div
            key={tag.id}
            className="relative group"
            style={{
              animationDelay: animationDelay ? '0ms' : `${index * 50}ms`,
              animation: 'fadeInUp 0.5s ease-out forwards'
            }}
          >
            <button
              onClick={() => handleTagClick(tag)}
              onMouseEnter={() => setHoveredTag(tag.id)}
              onMouseLeave={() => setHoveredTag(null)}
              className={twMerge(
                tagStyles({
                  size: tag.size,
                  category: tag.category,
                  difficulty: tag.difficulty_level,
                  bookmarked: bookmarkedTags.has(tag.id)
                })
              )}
            >
              {/* Tag Icon */}
              {tag.icon && (
                <span className="text-lg">{tag.icon}</span>
              )}
              
              {/* Tag Name */}
              <span>{tag.display_name}</span>
              
              {/* Frequency Badge for larger tags */}
              {(['lg', 'xl'].includes(tag.size)) && (
                <span className="bg-white bg-opacity-50 text-xs px-1.5 py-0.5 rounded-full">
                  {tag.frequency}
                </span>
              )}
              
              {/* Bookmark Icon */}
              {bookmarkedTags.has(tag.id) && (
                <span className="text-yellow-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                </span>
              )}
            </button>

            {/* Hover Tooltip */}
            {hoveredTag === tag.id && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-10 whitespace-nowrap max-w-xs">
                <div className="font-medium">{tag.display_name}</div>
                <div className="text-xs opacity-75">{tag.description}</div>
                <div className="text-xs opacity-50 mt-1">
                  {tag.category} • {tag.difficulty_level} • {tag.frequency} occorrenze
                </div>
                
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-t-4 border-t-gray-900 border-l-4 border-l-transparent border-r-4 border-r-transparent"></div>
              </div>
            )}

            {/* Bookmark Button */}
            {onTagBookmark && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onTagBookmark(tag)
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:shadow-md"
                title={bookmarkedTags.has(tag.id) ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
              >
                <svg 
                  className={`w-3 h-3 ${bookmarkedTags.has(tag.id) ? 'text-yellow-500' : 'text-gray-400'}`}
                  fill={bookmarkedTags.has(tag.id) ? 'currentColor' : 'none'}
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-didattika-blue">{tagsWithSizes.length}</div>
            <div className="text-sm text-gray-600">Concetti</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {tagsWithSizes.filter(t => t.category === 'concept').length}
            </div>
            <div className="text-sm text-gray-600">Teorie</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {tagsWithSizes.filter(t => t.category === 'skill').length}
            </div>
            <div className="text-sm text-gray-600">Competenze</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {bookmarkedTags.size}
            </div>
            <div className="text-sm text-gray-600">Preferiti</div>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
