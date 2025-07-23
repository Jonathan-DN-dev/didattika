# 📄 Product Requirement Document – Didattika.ai

---

## 1. Titolo del Progetto
**Didattika.ai – L'educazione potenziata dall'intelligenza artificiale**

---

## 2. Obiettivo del Prodotto
Creare una piattaforma intelligente in grado di assistere studenti e insegnanti tramite un'interfaccia AI conversazionale multi-agente, offrendo supporto nella comprensione dei contenuti, nella gestione dei materiali e nella creazione di percorsi di apprendimento personalizzati.

---

## 3. Contesto e Problema da Risolvere
L’attuale sistema scolastico e formativo soffre spesso di mancanza di personalizzazione, supporto individuale e strumenti moderni. Gli studenti faticano ad accedere a spiegazioni chiare, mentre i docenti non sempre dispongono di strumenti avanzati per l’organizzazione e la distribuzione dei contenuti.

---

## 4. Target Utenti
- **Studenti** delle scuole superiori e università
- **Docenti e formatori**
- **Scuole e enti di formazione**
- In prospettiva: genitori, tutor, educatori privati

---

## 5. Caratteristiche Principali (Feature List)
- Chat AI con agenti specializzati (tutor, docente, coach)
- Upload documenti (PDF, appunti) e lettura AI
- Tagging automatico dei concetti chiave
- Cronologia e salvataggio delle sessioni
- Pannello docente per gestione contenuti
- Sistema base di gestione utenti

---

## 6. User Flow / User Story

### Studente
- Accede → Carica documento → Chatta con AI → Riceve aiuto su contenuti → Salva sessione

### Docente
- Accede → Carica materiali → Monitora interazioni → Personalizza risposte AI → Gestisce i corsi

---

## 7. Requisiti Funzionali
- Autenticazione utenti (Supabase/Auth0)
- Frontend responsive (Next.js + Tailwind)
- Integrazione OpenAI API + Langroid
- Database PostgreSQL
- Upload file e storage associato

---

## 8. Requisiti Non Funzionali
- Alta usabilità e accessibilità
- Tempi di risposta AI < 3s
- Scalabilità su più utenti
- Costo API sostenibile
- Privacy e protezione dati (compliance GDPR)

---

## 9. Vincoli e Dipendenze
- Budget limitato → uso di tecnologie open-source e deploy ottimizzato
- Tempo: MVP da completare entro 6 settimane
- Costi OpenAI → ottimizzazione dei prompt e caching

---

## 10. Success Metrics
- ✅ MVP rilasciato entro 6 settimane
- ✅ Almeno 10 beta tester attivi
- ✅ Feedback qualitativo positivo (soddisfazione > 80%)
- ✅ Tasso di completamento attività ≥ 70%
- ✅ Tempo medio di interazione > 3 min

---

## 11. Roadmap Iniziale (MVP)

**Settimana 1** – Setup auth, repo, UI  
**Settimana 2** – Integrazione AI e chat base  
**Settimana 3** – Upload documenti + storage  
**Settimana 4** – Tagging + cronologia + dashboard  
**Settimana 5** – Refactoring e bugfix  
**Settimana 6** – Test, onboarding, beta tester

---

## 12. Considerazioni Aggiuntive
- Supporto multilingua previsto in fase 2
- Possibilità di white-label per enti scolastici
- Focus iniziale su discipline scientifiche e linguistiche

---
