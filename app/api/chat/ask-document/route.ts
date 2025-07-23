import { NextRequest, NextResponse } from "next/server"
import { getPersonaPrompt } from "lib/ai/persona-configs"
import { PersonaType, ChatAPIResponse } from "types/chat"
import { Document } from "types/documents"

interface DocumentChatRequest {
  message: string
  document_ids: string[]
  persona?: PersonaType
  conversation_id?: string
}

// Mock documents database
let documents: Document[] = []

export async function POST(request: NextRequest) {
  try {
    const body: DocumentChatRequest = await request.json()
    const { message, document_ids, persona = "tutor", conversation_id } = body

    // Validate input
    if (!message || message.trim() === "") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    if (!document_ids || document_ids.length === 0) {
      return NextResponse.json(
        { error: "At least one document ID is required" },
        { status: 400 }
      )
    }

    // Get documents (in production, fetch from database)
    const userId = "current-user" // In production, get from auth token
    const relevantDocuments = documents.filter(doc => 
      document_ids.includes(doc.id) && 
      doc.user_id === userId &&
      doc.status === 'completed'
    )

    if (relevantDocuments.length === 0) {
      return NextResponse.json(
        { error: "No valid documents found" },
        { status: 404 }
      )
    }

    // Build context from documents
    const documentContext = relevantDocuments.map(doc => ({
      title: doc.title,
      summary: doc.summary || '',
      content_preview: doc.content_text?.substring(0, 2000) || '', // First 2000 chars
      file_type: doc.file_type
    }))

    // Generate AI response with document context
    const aiResponse = await generateDocumentAwareResponse(
      message, 
      documentContext, 
      persona
    )

    const response: ChatAPIResponse = {
      message: aiResponse,
      persona,
      conversationId: conversation_id,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error("Document chat API error:", error)
    return NextResponse.json(
      { error: "Failed to process document chat request" },
      { status: 500 }
    )
  }
}

async function generateDocumentAwareResponse(
  message: string,
  documentContext: Array<{
    title: string
    summary: string
    content_preview: string
    file_type: string
  }>,
  persona: PersonaType
): Promise<string> {
  try {
    // Get persona-specific prompt
    const personaPrompt = getPersonaPrompt(persona)
    
    // Build document context prompt
    const contextPrompt = documentContext.map(doc => `
DOCUMENTO: ${doc.title} (${doc.file_type.toUpperCase()})
RIASSUNTO: ${doc.summary}
CONTENUTO: ${doc.content_preview}${doc.content_preview.length >= 2000 ? '...' : ''}
    `).join('\n---\n')

    // In production, this would use OpenAI API:
    /*
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    
    const systemPrompt = `${personaPrompt}
    
    IMPORTANTE: Rispondi basandoti ESCLUSIVAMENTE sui documenti forniti dall'utente.
    Se la domanda non può essere risposta con i documenti disponibili, dillo chiaramente.
    Cita sempre la fonte specifica quando possibile (es. "Nel documento 'Titolo documento'...").
    
    DOCUMENTI DISPONIBILI:
    ${contextPrompt}`
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 800,
      temperature: 0.7
    })
    
    return completion.choices[0]?.message?.content || "Mi dispiace, non riesco a generare una risposta al momento."
    */

    // Mock response for development
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Generate contextual response based on the documents
    const responses = {
      tutor: [
        `Basandomi sui documenti che hai caricato, posso spiegarti questo concetto step by step. Nel documento "${documentContext[0].title}" viene menzionato che...`,
        `Ottima domanda! Guardando i contenuti del tuo documento "${documentContext[0].title}", posso aiutarti a comprendere meglio questo argomento. Iniziamo con...`,
        `Dal documento che hai condiviso emerge chiaramente che... Lascia che ti spieghi questo concetto in modo più semplice e dettagliato.`
      ],
      docente: [
        `Analizzando i materiali didattici che hai fornito, posso aiutarti a strutturare una lezione su questo argomento. Il documento "${documentContext[0].title}" contiene elementi chiave per...`,
        `Basandomi sui contenuti del documento "${documentContext[0].title}", posso suggerirti alcune strategie didattiche efficaci per questo argomento...`,
        `I materiali che hai caricato offrono spunti interessanti per la programmazione didattica. Nel documento si evidenzia che...`
      ],
      coach: [
        `Perfetto! Dal documento "${documentContext[0].title}" che hai condiviso posso aiutarti a creare un piano di studio efficace. Vedo che...`,
        `Ottimo materiale di studio! Basandomi sui contenuti del tuo documento, posso suggerirti il metodo migliore per apprendere questi concetti...`,
        `Dal documento emerge che questo argomento richiede un approccio specifico. Ti aiuto a organizzare lo studio in modo efficace...`
      ]
    }

    // Simple keyword matching for more contextual responses
    const messageLower = message.toLowerCase()
    let responseCategory = "general"
    
    if (messageLower.includes("spiegami") || messageLower.includes("cosa significa") || messageLower.includes("come")) {
      responseCategory = "explanation"
    } else if (messageLower.includes("riassumi") || messageLower.includes("punti principali")) {
      responseCategory = "summary"
    } else if (messageLower.includes("esempio") || messageLower.includes("pratico")) {
      responseCategory = "example"
    }

    // Enhanced responses based on document content
    if (responseCategory === "summary") {
      return `📋 **Riassunto basato sui tuoi documenti:**

Dai documenti che hai caricato, ecco i punti principali:

${documentContext.map((doc, index) => `
**${index + 1}. Dal documento "${doc.title}":**
${doc.summary || 'Contenuto in elaborazione...'}
`).join('\n')}

${persona === 'tutor' ? 'Vuoi che ti spieghi uno di questi punti in dettaglio?' : 
  persona === 'docente' ? 'Questi contenuti possono essere utilizzati per creare attività didattiche specifiche.' :
  'Possiamo creare un piano di studio basato su questi argomenti!'}`
    }

    if (responseCategory === "explanation") {
      const docTitle = documentContext[0].title
      return `🎯 **Spiegazione basata sul documento "${docTitle}":**

${documentContext[0].summary}

${persona === 'tutor' ? 'Ti spiego questo concetto passo dopo passo basandomi sul tuo materiale...' : 
  persona === 'docente' ? 'Questo argomento può essere sviluppato in una lezione strutturata...' :
  'Ecco il metodo migliore per studiare questo argomento...'}`
    }

    // Default contextual response
    const personaResponses = responses[persona]
    const baseResponse = personaResponses[Math.floor(Math.random() * personaResponses.length)]
    
    return `${baseResponse}

📚 **Riferimenti dai tuoi documenti:**
${documentContext.map(doc => `��� **${doc.title}**: ${doc.summary.substring(0, 150)}...`).join('\n')}

${persona === 'tutor' ? '💡 Hai altre domande su questi materiali?' : 
  persona === 'docente' ? '📝 Posso aiutarti a creare materiali didattici basati su questi contenuti.' :
  '🎯 Vuoi che ti aiuti a organizzare un piano di studio personalizzato?'}`

  } catch (error) {
    console.error("Error generating document-aware response:", error)
    throw new Error("Failed to generate AI response")
  }
}
