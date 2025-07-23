import { NextRequest, NextResponse } from "next/server"
import { DocumentProcessor } from "lib/documents/processor"
import { Document, DocumentUploadResponse } from "types/documents"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file
    const validation = DocumentProcessor.validateFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 400 }
      )
    }

    // In production, get user ID from auth token
    const userId = "current-user"

    // Generate document ID
    const documentId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create initial document record
    const document: Document = {
      id: documentId,
      user_id: userId,
      title: title || file.name.replace(/\.[^/.]+$/, ""),
      file_path: `/uploads/${userId}/${documentId}-${file.name}`,
      file_type: DocumentProcessor.getFileType(file) as 'pdf' | 'txt' | 'docx',
      file_size: file.size,
      status: 'uploading',
      created_at: new Date(),
      updated_at: new Date()
    }

    // In production, upload file to Supabase Storage
    // const { data, error } = await supabase.storage
    //   .from('documents')
    //   .upload(document.file_path, file)

    // Process document in background
    processDocumentAsync(document, file)

    const response: DocumentUploadResponse = {
      document_id: documentId,
      message: "File uploaded successfully, processing started",
      status: 'uploading'
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}

// Background processing function
async function processDocumentAsync(document: Document, file: File) {
  try {
    // Update status to processing
    await updateDocumentStatus(document.id, 'processing')

    // Process the document
    const result = await DocumentProcessor.processDocument(file)

    if (result.success && result.document) {
      // Generate summary
      const summary = await DocumentProcessor.generateSummary(result.document.text)

      // Update document with processed content
      await updateDocument(document.id, {
        status: 'completed',
        content_text: result.document.text,
        summary,
        metadata: result.document.metadata,
        updated_at: new Date()
      })

      console.log(`Document ${document.id} processed successfully`)
    } else {
      throw new Error(result.error || 'Processing failed')
    }

  } catch (error) {
    console.error(`Processing failed for document ${document.id}:`, error)
    
    await updateDocument(document.id, {
      status: 'failed',
      metadata: {
        ...document.metadata,
        error_log: [error instanceof Error ? error.message : 'Unknown error']
      },
      updated_at: new Date()
    })
  }
}

// Helper functions (in production, these would interact with the database)
async function updateDocumentStatus(documentId: string, status: Document['status']) {
  // Mock implementation - in production, update database
  console.log(`Document ${documentId} status updated to: ${status}`)
}

async function updateDocument(documentId: string, updates: Partial<Document>) {
  // Mock implementation - in production, update database
  console.log(`Document ${documentId} updated:`, updates)
}
