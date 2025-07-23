import { NextRequest, NextResponse } from "next/server"
import { getPersonaPrompt } from "lib/ai/persona-configs"
import { Message, PersonaType, ChatAPIRequest, ChatAPIResponse } from "types/chat"

// Enhanced AI response generation with better error handling
async function generateAIResponse(
  message: string, 
  persona: PersonaType = "tutor", 
  history: Message[] = [],
  conversationId?: string
): Promise<string> {
  try {
    // Get persona-specific prompt
    const personaPrompt = getPersonaPrompt(persona)
    
    // In production, this would use OpenAI API:
    /*
    const openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    })
    
    const messages = [
      { role: "system", content: personaPrompt },
      ...history.slice(-5).map(msg => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content
      })),
      { role: "user", content: message }
    ]
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      max_tokens: 500,
      temperature: 0.7
    })
    
    return completion.choices[0]?.message?.content || "Mi dispiace, non riesco a generare una risposta al momento."
    */
    
    // Simulate processing time with realistic delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))
    
    // Enhanced responses based on persona and context
    const responses = {
      tutor: {
        greetings: [
          "Ciao! Sono felice di aiutarti nel tuo percorso di apprendimento. Su quale argomento hai bisogno di supporto?",
          "Benvenuto! Sono qui per aiutarti a comprendere meglio qualsiasi concetto. Dimmi cosa stai studiando.",
          "Salve! Sono il tuo tutor personale. Insieme possiamo affrontare qualsiasi sfida di apprendimento. Da dove iniziamo?"
        ],
        math: [
          "La matematica può sembrare complessa, ma spezzandola in piccoli passi diventa molto più gestibile. Partiamo dall'inizio: qual è la parte che trovi più difficile?",
          "Ottima domanda! In matematica è importante capire i concetti di base prima di procedere. Ti faccio un esempio pratico per chiarire...",
          "La matematica è come costruire una casa: serve una base solida. Dimmi qual è il tuo livello attuale e cosa vuoi imparare."
        ],
        science: [
          "Le scienze sono affascinanti perché ci aiutano a capire il mondo che ci circonda. Proviamo a collegare questo concetto a qualcosa che conosci già.",
          "Questo è un argomento molto interessante! Ti spiego con un esperimento mentale che renderà tutto più chiaro.",
          "La scienza è ovunque intorno a noi! Facciamo un esempio pratico per rendere questo concetto più concreto."
        ],
        general: [
          "Capisco la tua difficoltà. Proviamo ad affrontare questo argomento da un'altra prospettiva. Dimmi cosa sai già sull'argomento.",
          "Ottima domanda! È normale avere dubbi. Ti aiuto a chiarire questo punto passo dopo passo.",
          "Non preoccuparti, insieme troveremo il modo migliore per farti capire. Dimmi cosa ti confonde di più."
        ]
      },
      docente: {
        planning: [
          "Per una programmazione efficace, consideriamo gli obiettivi di apprendimento, i tempi disponibili e le caratteristiche della classe. Quale materia stai programmando?",
          "La programmazione didattica richiede un approccio sistemico. Iniziamo definendo le competenze che vuoi sviluppare nei tuoi studenti.",
          "Eccellente! La pianificazione è la chiave del successo didattico. Parliamo dei tuoi obiettivi specifici per questa unità."
        ],
        assessment: [
          "La valutazione deve essere coerente con gli obiettivi didattici. Ti suggerisco di considerare diverse tipologie: formativa, sommativa e autentica. Su cosa vuoi concentrarti?",
          "Per una valutazione efficace, è importante avere criteri chiari e condivisi. Possiamo creare insieme una rubrica di valutazione.",
          "La valutazione è un processo continuo che guida l'apprendimento. Che tipo di feedback vuoi fornire ai tuoi studenti?"
        ],
        technology: [
          "L'integrazione della tecnologia in classe può rendere l'apprendimento più coinvolgente. Quali strumenti hai a disposizione?",
          "Le tecnologie educative offrono molte opportunità. Ti suggerisco di iniziare con strumenti semplici ma efficaci.",
          "La tecnologia deve essere al servizio della didattica, non fine a se stessa. Parliamo di come può migliorare il tuo insegnamento."
        ],
        general: [
          "Come posso aiutarti nella tua attività didattica? Sono qui per supportarti nella programmazione, nella valutazione o in qualsiasi altra necessità pedagogica.",
          "Comprendo le sfide dell'insegnamento moderno. Lavoriamo insieme per trovare soluzioni pratiche ed efficaci.",
          "La professione docente è complessa ma gratificante. Dimmi qual è la tua sfida principale e troviamo insieme la soluzione."
        ]
      },
      coach: {
        motivation: [
          "È normale attraversare momenti di difficoltà nello studio. L'importante è non arrendersi e trovare la strategia giusta per te. Parliamo di cosa ti blocca.",
          "La motivazione è come un muscolo: va allenata ogni giorno. Iniziamo identificando i tuoi obiettivi e le tue passioni.",
          "Ogni grande successo inizia con il primo passo! Dimmi qual è il tuo obiettivo e costruiamo insieme il percorso per raggiungerlo."
        ],
        study_methods: [
          "Ogni persona ha un metodo di studio ideale. Scopriamo insieme qual è il tuo stile di apprendimento: sei più visivo, auditivo o cinestetico?",
          "Ottima domanda! Il metodo di studio giusto può fare una grande differenza. Ti insegno alcune tecniche efficaci.",
          "Il segreto è trovare il metodo che funziona per TE. Parlami delle tue abitudini attuali e vediamo come ottimizzarle."
        ],
        time_management: [
          "La gestione del tempo è una competenza fondamentale. Iniziamo creando una routine che funzioni per te. Qual è la tua giornata tipo?",
          "Capisco la difficoltà nel gestire tutto. Ti aiuto a creare un piano di studio sostenibile ed efficace.",
          "Il tempo è la risorsa più preziosa! Organizziamo insieme la tua giornata per massimizzare i risultati."
        ],
        general: [
          "Sono qui per aiutarti a sviluppare le tue potenzialità. Ogni sfida è un'opportunità di crescita. Dimmi cosa ti preoccupa di più.",
          "Complimenti per aver cercato supporto! È il primo passo verso il miglioramento. Come posso aiutarti oggi?",
          "Hai già dimostrato coraggio nel chiedere aiuto. Insieme possiamo trasformare ogni ostacolo in un'opportunità!"
        ]
      }
    }
    
    // Enhanced keyword matching for response selection
    const messageLower = message.toLowerCase()
    let responseCategory = "general"
    
    if (persona === "tutor") {
      if (messageLower.includes("matematica") || messageLower.includes("calcolo") || messageLower.includes("algebra") || messageLower.includes("geometria")) {
        responseCategory = "math"
      } else if (messageLower.includes("scienza") || messageLower.includes("fisica") || messageLower.includes("chimica") || messageLower.includes("biologia")) {
        responseCategory = "science"
      } else if (messageLower.includes("ciao") || messageLower.includes("aiuto") || messageLower.includes("inizio") || messageLower.includes("salve")) {
        responseCategory = "greetings"
      }
    } else if (persona === "docente") {
      if (messageLower.includes("programmazione") || messageLower.includes("curricolo") || messageLower.includes("piano") || messageLower.includes("didattica")) {
        responseCategory = "planning"
      } else if (messageLower.includes("valutazione") || messageLower.includes("verifica") || messageLower.includes("test") || messageLower.includes("voto")) {
        responseCategory = "assessment"
      } else if (messageLower.includes("tecnologia") || messageLower.includes("digitale") || messageLower.includes("strumenti") || messageLower.includes("lim")) {
        responseCategory = "technology"
      }
    } else if (persona === "coach") {
      if (messageLower.includes("motivazione") || messageLower.includes("demotivato") || messageLower.includes("difficoltà") || messageLower.includes("scoraggiato")) {
        responseCategory = "motivation"
      } else if (messageLower.includes("studio") || messageLower.includes("metodo") || messageLower.includes("apprendimento") || messageLower.includes("tecnica")) {
        responseCategory = "study_methods"
      } else if (messageLower.includes("tempo") || messageLower.includes("organizzazione") || messageLower.includes("gestione") || messageLower.includes("pianificazione")) {
        responseCategory = "time_management"
      }
    }
    
    const categoryResponses = responses[persona][responseCategory as keyof typeof responses[typeof persona]]
    const randomResponse = categoryResponses[Math.floor(Math.random() * categoryResponses.length)]
    
    return randomResponse
    
  } catch (error) {
    console.error("Error generating AI response:", error)
    throw new Error("Failed to generate AI response")
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatAPIRequest = await request.json()
    const { message, persona = "tutor", conversationId, conversationHistory = [] } = body

    // Validate input
    if (!message || message.trim() === "") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: "Message too long. Please keep it under 1000 characters." },
        { status: 400 }
      )
    }

    // Generate AI response with enhanced error handling
    const aiResponse = await generateAIResponse(message, persona, conversationHistory, conversationId)

    const response: ChatAPIResponse = {
      message: aiResponse,
      persona,
      conversationId,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error("Chat API error:", error)
    
    // Return appropriate error response
    if (error instanceof Error && error.message === "Failed to generate AI response") {
      return NextResponse.json(
        { error: "AI service temporarily unavailable. Please try again in a moment." },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    )
  }
}
