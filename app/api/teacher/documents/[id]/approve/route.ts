import { NextRequest, NextResponse } from "next/server"
import { DocumentApprovalAction } from "types/teacher-documents"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id
    const teacherId = "current-teacher" // In production, get from auth token
    const body: DocumentApprovalAction = await request.json()

    const { action, reason, feedback } = body

    // Validate action
    if (!['approve', 'flag', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve', 'flag', or 'reject'" },
        { status: 400 }
      )
    }

    // In production, verify teacher has permission to approve this document
    // Check student-teacher relationship and course access

    // Update document approval status
    const updateData = {
      approval_status: action === 'approve' ? 'approved' : action === 'flag' ? 'flagged' : 'rejected',
      approval_date: new Date(),
      teacher_feedback: feedback,
      updated_at: new Date()
    }

    // In production, update database
    // const { data, error } = await supabase
    //   .from('documents')
    //   .update(updateData)
    //   .eq('id', documentId)
    //   .eq('teacher_id', teacherId) // Ensure teacher can only update their students' documents

    // Log the approval action for audit trail
    const auditLog = {
      document_id: documentId,
      teacher_id: teacherId,
      action,
      reason,
      feedback,
      timestamp: new Date()
    }

    // In production, save audit log
    // await supabase.from('document_approval_log').insert(auditLog)

    // Send notification to student (in production)
    if (action === 'approve') {
      // Send approval notification
      console.log(`Document ${documentId} approved by teacher ${teacherId}`)
    } else if (action === 'flag') {
      // Send flag notification with reason
      console.log(`Document ${documentId} flagged by teacher ${teacherId}: ${reason}`)
    } else if (action === 'reject') {
      // Send rejection notification
      console.log(`Document ${documentId} rejected by teacher ${teacherId}: ${reason}`)
    }

    return NextResponse.json({
      message: `Document ${action}ed successfully`,
      approval_status: updateData.approval_status,
      approval_date: updateData.approval_date
    })

  } catch (error) {
    console.error("Error processing document approval:", error)
    return NextResponse.json(
      { error: "Failed to process approval" },
      { status: 500 }
    )
  }
}
