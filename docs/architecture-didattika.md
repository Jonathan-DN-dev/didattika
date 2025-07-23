# 🧱 Architettura Tecnica – Didattika.ai

---

## ⚙️ Obiettivo dell’Architettura
Progettare un sistema scalabile, modulare e facilmente estendibile che consenta:
- Interazione con agenti AI specializzati
- Upload e parsing documenti
- Gestione utenti (studenti, docenti, admin)
- Storico delle interazioni
- Espansione futura con nuove integrazioni e funzionalità

---

## 🧩 Componenti Principali

1. **Frontend Web**
   - Framework: Next.js + TailwindCSS
   - Funzionalità:
     - Login/Signup
     - Chat multi-agente
     - Upload documenti
     - Cronologia sessioni
     - Pannello docente/admin

2. **Backend API**
   - Linguaggio: Node.js o Java (Spring Boot)
   - Framework: Fastify / Express (Node) oppure Spring MVC
   - Funzionalità:
     - Autenticazione e autorizzazione
     - Gestione file
     - Routing verso agenti AI
     - Accesso DB

3. **Modulo AI**
   - Orchestrazione: Langroid o Langchain
   - Provider: OpenAI (GPT-4 / GPT-3.5-turbo)
   - Prompt multi-persona (tutor, docente, coach)
   - Funzioni:
     - Parsing documenti caricati
     - Risposte AI contestualizzate
     - Generazione tagging e concetti chiave

4. **Database**
   - DB: PostgreSQL (via Supabase o standalone)
   - Tabelle principali:
     - Utenti
     - Conversazioni
     - File caricati
     - Tag/concetti chiave
     - Feedback beta

5. **Storage Documenti**
   - Soluzione: Supabase Storage o Amazon S3
   - Upload: PDF, TXT, DOCX (formati supportati)
   - Parser integrato nel backend AI

6. **DevOps / CI-CD**
   - Hosting: Vercel (frontend) + Fly.io o Railway (backend)
   - CI/CD: GitHub Actions
   - Monitoraggio: Log + error tracking (es. Sentry)

---

## 🔐 Sicurezza
- Autenticazione JWT / OAuth (Supabase o Auth0)
- Protezione endpoint API
- Validazione file upload
- Rate limiting su API AI
- Conformità GDPR

---

## 🔗 Integrazioni Esterne
- OpenAI API (AI Chat)
- Supabase (auth, DB, storage)
- Stripe (fase 2 – piani premium)
- Notion/Google Docs API (fase 2 – importazione materiali)

---

## 🛠️ Stack Tecnologico Riassuntivo

| Componente     | Tecnologia              |
|----------------|--------------------------|
| Frontend       | Next.js, TailwindCSS     |
| Backend        | Node.js / Fastify (o Spring Boot) |
| AI             | OpenAI + Langroid        |
| DB             | PostgreSQL               |
| Storage        | Supabase Storage / S3    |
| DevOps         | GitHub Actions + Vercel/Fly.io |
| Auth           | Supabase Auth / Auth0    |

---

## 📡 Schema Logico (descrittivo)

```
Utente ──> Frontend ──> Backend API ──> AI Orchestrator ──> OpenAI
             │              │                 │
             │              └──> DB & Storage ┘
             │
             └──> Dashboard / UI / Upload
```

---

## 🧭 Note di scalabilità
- Architettura modulare → facile estrarre microservizi futuri
- Possibile caching risposte AI per contenere costi
- Multilingua e white-label supportabili nella fase 2

---
