import { NextRequest, NextResponse } from 'next/server'
import type { 
  TagValidationRequest, 
  TagValidation, 
  AITagFeedback 
} from '../../../../../types/teacher-tags'
import { teacherFeedbackService } from '../../../../../lib/ai/teacher-feedback'
import type { Tag } from '../../../../../types/tags'

interface RouteParams {
  params: {
    id: string
  }
}

// Mock function to get tag by ID
const getTagById = async (tagId: string): Promise<Tag | null> => {
  // In a real implementation, this would query the database
  const mockTags: Tag[] = [
    {
      id: 'tag-1',
      name: 'Mathematics',
      description: 'Mathematical concepts and problems',
      category: 'subject',
      confidence: 0.85,
      usageCount: 15,
      createdAt: new Date('2024-01-15'),
      synonyms: ['Math', 'Arithmetic'],
    },
    {
      id: 'tag-2',
      name: 'Science',
      description: 'Scientific concepts and experiments',
      category: 'subject',
      confidence: 0.78,
      usageCount: 12,
      createdAt: new Date('2024-01-10'),
      synonyms: ['Natural Science'],
    },
  ]

  return mockTags.find(tag => tag.id === tagId) || null
}

// Mock function to save validation
const saveValidation = async (validation: TagValidation): Promise<void> => {
  // In a real implementation, this would save to the database
  console.log('Saving validation:', validation)
}

// Mock function to update tag
const updateTag = async (tagId: string, updates: Partial<Tag>): Promise<void> => {
  // In a real implementation, this would update the tag in the database
  console.log('Updating tag:', tagId, updates)
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const tagId = params.id
    const body: TagValidationRequest = await request.json()
    const teacherId = 'teacher-001' // In a real app, get from authentication

    // Validate request
    if (!body.action || !['approve', 'reject', 'modify'].includes(body.action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve, reject, or modify' },
        { status: 400 }
      )
    }

    // Get the original tag
    const originalTag = await getTagById(tagId)
    if (!originalTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    // Create validation record
    const validation: TagValidation = {
      id: `validation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tagId,
      teacherId,
      originalName: originalTag.name,
      validatedName: body.newName || originalTag.name,
      originalDescription: originalTag.description,
      validatedDescription: body.newDescription || originalTag.description,
      feedbackType: body.action === 'approve' ? 'approved' 
                   : body.action === 'reject' ? 'rejected' 
                   : 'modified',
      feedback: body.feedback,
      confidence: originalTag.confidence,
      timestamp: new Date(),
      reasonForChange: body.reasonForChange,
    }

    // Save validation
    await saveValidation(validation)

    // Update tag if modified or approved
    if (body.action === 'modify') {
      const updates: Partial<Tag> = {}
      if (body.newName) updates.name = body.newName
      if (body.newDescription) updates.description = body.newDescription
      if (body.newCategory) updates.category = body.newCategory
      
      await updateTag(tagId, updates)
    }

    // Submit feedback to AI service for learning
    let aiFeedback: AITagFeedback | null = null
    try {
      aiFeedback = await teacherFeedbackService.submitTagFeedback(
        originalTag,
        validation,
        {
          documentType: 'educational_content',
          studentLevel: 'K-12',
          curriculumContext: 'general',
          subjectArea: body.newCategory || originalTag.category,
        }
      )
    } catch (error) {
      console.error('Error submitting AI feedback:', error)
      // Continue with validation even if AI feedback fails
    }

    // Prepare response
    const response = {
      success: true,
      validation,
      aiFeedback,
      message: getValidationMessage(body.action),
      updatedTag: body.action === 'modify' ? {
        ...originalTag,
        name: body.newName || originalTag.name,
        description: body.newDescription || originalTag.description,
        category: body.newCategory || originalTag.category,
      } : originalTag,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error validating tag:', error)
    return NextResponse.json(
      { error: 'Failed to validate tag' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const tagId = params.id
    
    // Get tag validation history
    const validationHistory: TagValidation[] = [
      {
        id: 'validation-1',
        tagId,
        teacherId: 'teacher-001',
        originalName: 'Math',
        validatedName: 'Mathematics',
        originalDescription: 'Math problems',
        validatedDescription: 'Mathematical concepts and problem-solving exercises',
        feedbackType: 'modified',
        feedback: 'Made the description more comprehensive and educational',
        confidence: 0.85,
        timestamp: new Date('2024-01-20'),
        reasonForChange: 'Better alignment with curriculum standards',
      },
    ]

    // Get tag details
    const tag = await getTagById(tagId)
    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      tag,
      validationHistory,
      canValidate: true, // In a real app, check teacher permissions
    })
  } catch (error) {
    console.error('Error getting tag validation info:', error)
    return NextResponse.json(
      { error: 'Failed to get tag validation information' },
      { status: 500 }
    )
  }
}

function getValidationMessage(action: string): string {
  switch (action) {
    case 'approve':
      return 'Tag approved successfully. This will improve AI accuracy for similar content.'
    case 'reject':
      return 'Tag rejected successfully. The AI will learn to avoid similar suggestions.'
    case 'modify':
      return 'Tag modified successfully. The AI will learn from your improvements.'
    default:
      return 'Tag validation completed successfully.'
  }
}
