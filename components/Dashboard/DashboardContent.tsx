"use client"

import { useState } from "react"
import { ChatInterface } from "components/Chat/ChatInterface"
import { DocumentUpload } from "components/DocumentUpload/DocumentUpload"
import { EnhancedDocumentUpload } from "components/DocumentUpload/EnhancedDocumentUpload"
import { DocumentList } from "components/Documents/DocumentList"
import { DocumentPreview } from "components/Documents/DocumentPreview"
import { useChat } from "components/Chat/ChatProvider"
import { useAuth } from "components/Auth/AuthProvider"
import { Document } from "types/documents"

export function DashboardContent() {
  const { isChatOpen, openChat, closeChat } = useChat()
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("PIANIFICAZIONE")
  const [showDocumentUpload, setShowDocumentUpload] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showDocumentPreview, setShowDocumentPreview] = useState(false)
  const [showDocumentManager, setShowDocumentManager] = useState(false)

  const tabs = [
    "PIANIFICAZIONE",
    "Generatore di contenuti", 
    "inclusione",
    "valutazioni"
  ]

  const handleFileProcessed = (file: any) => {
    console.log("File processed:", file)
    // You could automatically open chat here or show a notification
  }

  const handleDocumentProcessed = (document: Document) => {
    setDocuments(prev => {
      const existingIndex = prev.findIndex(doc => doc.id === document.id)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = document
        return updated
      } else {
        return [document, ...prev]
      }
    })

    // Optionally show success notification
    console.log("Document processed:", document.title)
  }

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document)
    setShowDocumentPreview(true)
  }

  const handleDocumentDelete = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId))
    if (selectedDocument?.id === documentId) {
      setSelectedDocument(null)
      setShowDocumentPreview(false)
    }
  }

  const handleDocumentPreview = (document: Document) => {
    setSelectedDocument(document)
    setShowDocumentPreview(true)
  }

  const handleAskDocumentQuestion = (question: string) => {
    if (selectedDocument) {
      // Close preview and open chat with document context
      setShowDocumentPreview(false)
      openChat()
      // In a real implementation, you would pass the document context to the chat
      console.log(`Asking question about document ${selectedDocument.title}: ${question}`)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      setShowUserMenu(false)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <div className="min-h-screen bg-didattika-orange">
      {/* Header */}
      <header className="w-full bg-didattika-orange px-2 py-3">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="https://api.builder.io/api/v1/image/assets/TEMP/0d983f9212f49516849aa4ef097ba2171230fdcc?width=314" 
              alt="DIDATTIKA" 
              className="h-8 w-auto"
            />
          </div>

          {/* Header Right Section */}
          <div className="flex items-center gap-4 lg:gap-6">
            {/* Premium Button */}
            <button className="premium-btn">
              <span>Abbonati a Premium</span>
              <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12.5L10 8.5L6 4.5" stroke="#3E88C7" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Calendar Icon */}
            <button className="icon-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="#3E88C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 2V6" stroke="#3E88C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 2V6" stroke="#3E88C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 10H21" stroke="#3E88C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Notification Icon */}
            <button className="icon-btn">
              <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8.5C18 6.9087 17.3679 5.38258 16.2426 4.25736C15.1174 3.13214 13.5913 2.5 12 2.5C10.4087 2.5 8.88258 3.13214 7.75736 4.25736C6.63214 5.38258 6 6.9087 6 8.5C6 15.5 3 17.5 3 17.5H21C21 17.5 18 15.5 18 8.5Z" stroke="#3E88C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21.5C13.5542 21.8031 13.3019 22.0547 12.9982 22.2295C12.6946 22.4044 12.3504 22.4965 12 22.4965C11.6496 22.4965 11.3054 22.4044 11.0018 22.2295C10.6982 22.0547 10.4458 21.8031 10.27 21.5" stroke="#3E88C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Coin Balance */}
            <div className="coin-balance">
              <span className="coin-count">500</span>
              <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 14.5C11.3137 14.5 14 11.8137 14 8.5C14 5.18629 11.3137 2.5 8 2.5C4.68629 2.5 2 5.18629 2 8.5C2 11.8137 4.68629 14.5 8 14.5Z" stroke="#FAB417" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.0898 10.87C19.0352 11.2224 19.8763 11.8075 20.5356 12.5712C21.1949 13.3349 21.6509 14.2524 21.8616 15.2391C22.0723 16.2257 22.0307 17.2495 21.7409 18.2158C21.451 19.1822 20.9222 20.0598 20.2033 20.7676C19.4844 21.4754 18.5986 21.9905 17.6278 22.2652C16.6571 22.54 15.6327 22.5655 14.6495 22.3395C13.6663 22.1134 12.756 21.6431 12.0027 20.972C11.2494 20.3009 10.6775 19.4507 10.3398 18.5" stroke="#FAB417" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 6.5H8V10.5" stroke="#FAB417" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16.7098 14.38L17.4098 15.09L14.5898 17.91" stroke="#FAB417" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6.5L8 10.5L12 6.5" stroke="#3E88C7" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <div className="w-8 h-8 bg-didattika-blue text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6.5L8 10.5L12 6.5" stroke="#3E88C7" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="font-semibold text-gray-900">{user?.email}</div>
                    <div className="text-sm text-gray-600 capitalize">
                      {user?.user_type === 'student' ? 'Studente' : 'Docente'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Membro dal {user?.created_at ? new Date(user.created_at).toLocaleDateString('it-IT') : 'N/A'}
                    </div>
                  </div>
                  <div className="p-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                      Profilo
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                      Impostazioni
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {/* Home - Active */}
            <a href="#" className="nav-item active">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 6.00004L8 1.33337L14 6.00004V13.3334C14 13.687 13.8595 14.0261 13.6095 14.2762C13.3594 14.5262 13.0203 14.6667 12.6667 14.6667H3.33333C2.97971 14.6667 2.64057 14.5262 2.39052 14.2762C2.14048 14.0261 2 13.687 2 13.3334V6.00004Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 14.6667V8H10V14.6667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Home</span>
            </a>

            {/* AI Personale */}
            <button onClick={openChat} className="nav-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.40023 4.0747C6.61482 3.5306 7.38484 3.5306 7.59944 4.0747L8.20671 5.61436C8.59977 6.61106 9.38871 7.40003 10.3854 7.79309L11.9251 8.40036C12.4692 8.61496 12.4692 9.38496 11.9251 9.59956L10.3854 10.2068C9.38871 10.5999 8.59977 11.3888 8.20671 12.3856L7.59944 13.9252C7.38484 14.4693 6.61482 14.4693 6.40023 13.9252L5.793 12.3856C5.39991 11.3888 4.61094 10.5999 3.61424 10.2068L2.07458 9.59956C1.53048 9.38496 1.53048 8.61496 2.07458 8.40036L3.61424 7.79309C4.61094 7.40003 5.39991 6.61106 5.793 5.61436L6.40023 4.0747Z" stroke="currentColor"/>
                <path d="M12.1086 1.81965C12.1891 1.61562 12.4779 1.61562 12.5584 1.81965L12.786 2.39702C12.9335 2.77078 13.2294 3.06665 13.6031 3.21406L14.1805 3.44177C14.3845 3.52224 14.3845 3.811 14.1805 3.89148L13.6031 4.11919C13.2294 4.2666 12.9335 4.56246 12.786 4.93622L12.5584 5.5136C12.4779 5.71763 12.1891 5.71763 12.1086 5.5136L11.881 4.93622C11.7335 4.56246 11.4376 4.2666 11.0639 4.11919L10.4865 3.89148C10.2825 3.811 10.2825 3.52224 10.4865 3.44177L11.0639 3.21406C11.4376 3.06665 11.7335 2.77078 11.881 2.39702L12.1086 1.81965Z" stroke="currentColor" strokeWidth="0.8"/>
              </svg>
              <span>Il mio AI personale</span>
            </button>

            {/* Le mie lezioni */}
            <a href="#" className="nav-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.6665 13C2.6665 12.558 2.8421 12.1341 3.15466 11.8215C3.46722 11.509 3.89114 11.3334 4.33317 11.3334H13.3332" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.33317 1.33337H13.3332V14.6667H4.33317C3.89114 14.6667 3.46722 14.4911 3.15466 14.1786C2.8421 13.866 2.6665 13.4421 2.6665 13V3.00004C2.6665 2.55801 2.8421 2.13409 3.15466 1.82153C3.46722 1.50897 3.89114 1.33337 4.33317 1.33337Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Le mie lezioni</span>
            </a>

            {/* Le mie classi */}
            <a href="#" className="nav-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.6668 6.66671V10.6667M14.6668 6.66671L8.00016 3.33337L1.3335 6.66671L8.00016 10L14.6668 6.66671Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 8V11.3333C6 13.3333 10 13.3333 12 11.3333V8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Le mie classi</span>
            </a>

            {/* Il mio materiale */}
            <button onClick={() => setShowDocumentManager(!showDocumentManager)} className="nav-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.66683 13.3333H13.3335C13.6871 13.3333 14.0263 13.1929 14.2763 12.9428C14.5264 12.6928 14.6668 12.3536 14.6668 12V5.33333C14.6668 4.97971 14.5264 4.64057 14.2763 4.39052C14.0263 4.14048 13.6871 4 13.3335 4H8.04683C7.82722 3.99886 7.61129 3.9435 7.41823 3.83883C7.22517 3.73415 7.06095 3.58341 6.94016 3.4L6.3935 2.6C6.27271 2.41659 6.10849 2.26585 5.91543 2.16117C5.72237 2.0565 5.50644 2.00114 5.28683 2H2.66683C2.31321 2 1.97407 2.14048 1.72402 2.39052C1.47397 2.64057 1.3335 2.97971 1.3335 3.33333V12C1.3335 12.7333 1.9335 13.3333 2.66683 13.3333Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>I miei documenti</span>
              {documents.length > 0 && (
                <span className="ml-auto bg-didattika-blue text-white text-xs rounded-full px-2 py-1">
                  {documents.length}
                </span>
              )}
            </button>

            {/* Carica documenti */}
            <button onClick={() => setShowDocumentUpload(!showDocumentUpload)} className="nav-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 1.33337V14.6667M1.33333 8H14.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Carica documenti</span>
            </button>

            {/* Storico chat */}
            <a href="#" className="nav-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.3335 2.66663H2.66683C1.93045 2.66663 1.3335 3.26358 1.3335 3.99996V4.66663C1.3335 5.40301 1.93045 5.99996 2.66683 5.99996H13.3335C14.0699 5.99996 14.6668 5.40301 14.6668 4.66663V3.99996C14.6668 3.26358 14.0699 2.66663 13.3335 2.66663Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2.6665 6V12C2.6665 12.3536 2.80698 12.6928 3.05703 12.9428C3.30708 13.1929 3.64622 13.3333 3.99984 13.3333H11.9998C12.3535 13.3333 12.6926 13.1929 12.9426 12.9428C13.1927 12.6928 13.3332 12.3536 13.3332 12V6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.6665 8.66663H9.33317" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Storico chat</span>
            </a>
          </nav>

          {/* Close Menu Button */}
          <button className="close-menu-btn">
            <span>Chiudi menù</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 15L13 12L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Tools Title & Tabs */}
          <div className="tools-header">
            <h1 className="tools-title">I tuoi strumenti!</h1>
            
            {/* Tabs */}
            <div className="tabs-container">
              {tabs.map((tab) => (
                <div 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`tab ${activeTab === tab ? "active" : ""}`}
                >
                  {tab}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                onClick={() => setShowDocumentUpload(!showDocumentUpload)}
                className="action-btn"
                title="Carica documenti"
              >
                <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.5 17H13.5V13H17.5V11H13.5V7H11.5V11H7.5V13H11.5V17ZM12.5 22C11.1167 22 9.81667 21.7417 8.6 21.225C7.38333 20.6917 6.325 19.975 5.425 19.075C4.525 18.175 3.80833 17.1167 3.275 15.9C2.75833 14.6833 2.5 13.3833 2.5 12C2.5 10.6167 2.75833 9.31667 3.275 8.1C3.80833 6.88333 4.525 5.825 5.425 4.925C6.325 4.025 7.38333 3.31667 8.6 2.8C9.81667 2.26667 11.1167 2 12.5 2C13.8833 2 15.1833 2.26667 16.4 2.8C17.6167 3.31667 18.675 4.025 19.575 4.925C20.475 5.825 21.1833 6.88333 21.7 8.1C22.2333 9.31667 22.5 10.6167 22.5 12C22.5 13.3833 22.2333 14.6833 21.7 15.9C21.1833 17.1167 20.475 18.175 19.575 19.075C18.675 19.975 17.6167 20.6917 16.4 21.225C15.1833 21.7417 13.8833 22 12.5 22ZM12.5 20C14.7333 20 16.625 19.225 18.175 17.675C19.725 16.125 20.5 14.2333 20.5 12C20.5 9.76667 19.725 7.875 18.175 6.325C16.625 4.775 14.7333 4 12.5 4C10.2667 4 8.375 4.775 6.825 6.325C5.275 7.875 4.5 9.76667 4.5 12C4.5 14.2333 5.275 16.125 6.825 17.675C8.375 19.225 10.2667 20 12.5 20Z" fill="#3E88C7"/>
                </svg>
              </button>
              <button className="action-btn">
                <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.8335 5H11.3335M3.8335 10H9.66683M3.8335 15H9.66683M13.0002 12.5L15.5002 15M15.5002 15L18.0002 12.5M15.5002 15V5" stroke="#3E88C7" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Enhanced Document Upload Section */}
          {showDocumentUpload && (
            <div className="mb-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Carica Documenti</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Carica PDF, TXT o DOCX per ottenere supporto AI personalizzato
                  </p>
                </div>
                <button
                  onClick={() => setShowDocumentUpload(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <EnhancedDocumentUpload
                onFileProcessed={handleDocumentProcessed}
                maxFiles={10}
                allowMultiple={true}
              />
            </div>
          )}

          {/* Document Manager Section */}
          {showDocumentManager && (
            <div className="mb-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">I Miei Documenti</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Gestisci e visualizza i tuoi documenti caricati
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDocumentUpload(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-didattika-blue text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Carica nuovo
                  </button>
                  <button
                    onClick={() => setShowDocumentManager(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <DocumentList
                documents={documents}
                onDocumentSelect={handleDocumentSelect}
                onDocumentDelete={handleDocumentDelete}
                onDocumentPreview={handleDocumentPreview}
                selectedDocumentId={selectedDocument?.id}
                showFilters={true}
                viewMode="list"
              />
            </div>
          )}

          {/* Language Selector */}
          <div className="language-selector">
            <div className="language-tags">
              <span className="language-tag">Italiano</span>
              <span className="language-tag">Geografia</span>
            </div>
            
            <button onClick={openChat} className="search-input">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.40023 4.0747C6.61482 3.5306 7.38484 3.5306 7.59944 4.0747L8.20671 5.61436C8.59977 6.61106 9.38871 7.40003 10.3854 7.79309L11.9251 8.40036C12.4692 8.61496 12.4692 9.38496 11.9251 9.59956L10.3854 10.2068C9.38871 10.5999 8.59977 11.3888 8.20671 12.3856L7.59944 13.9252C7.38484 14.4693 6.61482 14.4693 6.40023 13.9252L5.793 12.3856C5.39991 11.3888 4.61094 10.5999 3.61424 10.2068L2.07458 9.59956C1.53048 9.38496 1.53048 8.61496 2.07458 8.40036L3.61424 7.79309C4.61094 7.40003 5.39991 6.61106 5.793 5.61436L6.40023 4.0747Z" stroke="#3E88C7"/>
                <path d="M12.1086 1.81965C12.1891 1.61562 12.4779 1.61562 12.5584 1.81965L12.786 2.39702C12.9335 2.77078 13.2294 3.06665 13.6031 3.21406L14.1805 3.44177C14.3845 3.52224 14.3845 3.811 14.1805 3.89148L13.6031 4.11919C13.2294 4.2666 12.9335 4.56246 12.786 4.93622L12.5584 5.5136C12.4779 5.71763 12.1891 5.71763 12.1086 5.5136L11.881 4.93622C11.7335 4.56246 11.4376 4.2666 11.0639 4.11919L10.4865 3.89148C10.2825 3.811 10.2825 3.52224 10.4865 3.44177L11.0639 3.21406C11.4376 3.06665 11.7335 2.77078 11.881 2.39702L12.1086 1.81965Z" stroke="#3E88C7" strokeWidth="0.8"/>
              </svg>
              <span>Ciao! Cosa vuoi fare oggi?</span>
              <div className="coin-indicator">
                <span>100</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="#FAB417" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.0898 10.37C19.0352 10.7224 19.8763 11.3075 20.5356 12.0712C21.1949 12.8349 21.6509 13.7524 21.8616 14.7391C22.0723 15.7257 22.0307 16.7495 21.7409 17.7158C21.451 18.6822 20.9222 19.5598 20.2033 20.2676C19.4844 20.9754 18.5986 21.4905 17.6278 21.7652C16.6571 22.04 15.6327 22.0655 14.6495 21.8395C13.6663 21.6134 12.756 21.1431 12.0027 20.472C11.2494 19.8009 10.6775 18.9507 10.3398 18" stroke="#FAB417" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 6H8V10" stroke="#FAB417" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16.7098 13.88L17.4098 14.59L14.5898 17.41" stroke="#FAB417" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12L10 8L6 4" stroke="#3E88C7" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Tool Cards */}
          <div className="tools-grid">
            {/* First Row */}
            <div className="tool-card">
              <div className="tool-icon">
                <img src="https://api.builder.io/api/v1/image/assets/TEMP/7ba23b467eee527b7c5cb3beded092c01ef199bf?width=95" alt="Tool icon" />
              </div>
              <div className="tool-content">
                <h3>Crea un piano didattico</h3>
                <p>Dalla singola lezione all'intero anno scolastico: la programmazione delle lezioni non sarà più un problema!</p>
                <button onClick={openChat} className="generate-btn">
                  <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.8007 6.87613C11.1628 5.95796 12.4622 5.95796 12.8243 6.87613L13.8491 9.4743C14.5124 11.1562 15.8437 12.4876 17.5257 13.1509L20.1239 14.1757C21.042 14.5378 21.042 15.8372 20.1239 16.1993L17.5257 17.2241C15.8437 17.8874 14.5124 19.2187 13.8491 20.9007L12.8243 23.4989C12.4622 24.417 11.1628 24.417 10.8007 23.4989L9.77596 20.9007C9.11262 19.2187 7.78123 17.8874 6.0993 17.2241L3.50113 16.1993C2.58296 15.8372 2.58296 14.5378 3.50113 14.1757L6.0993 13.1509C7.78123 12.4876 9.11262 11.1562 9.77596 9.4743L10.8007 6.87613Z" stroke="white"/>
                    <path d="M20.433 3.07073C20.5688 2.72642 21.0562 2.72642 21.192 3.07073L21.5762 4.04505C21.825 4.67577 22.3243 5.17504 22.9549 5.42379L23.9293 5.80806C24.2736 5.94386 24.2736 6.43114 23.9293 6.56694L22.9549 6.9512C22.3243 7.19995 21.825 7.69923 21.5762 8.32995L21.192 9.30426C21.0562 9.64857 20.5688 9.64857 20.433 9.30426L20.0488 8.32995C19.8 7.69923 19.3007 7.19995 18.6701 6.9512L17.6957 6.56694C17.3514 6.43114 17.3514 5.94386 17.6957 5.80806L18.6701 5.42379C19.3007 5.17504 19.8 4.67577 20.0488 4.04505L20.433 3.07073Z" stroke="white" strokeWidth="0.8"/>
                  </svg>
                  <span>Genera</span>
                </button>
              </div>
            </div>

            <div className="tool-card">
              <div className="tool-icon">
                <img src="https://api.builder.io/api/v1/image/assets/TEMP/7ba23b467eee527b7c5cb3beded092c01ef199bf?width=95" alt="Tool icon" />
              </div>
              <div className="tool-content">
                <h3>Genera un piano di recupero</h3>
                <p>I tuoi studenti hanno difficoltà su alcune parti del programma? supportali con un piano di recupero personalizzato</p>
                <button onClick={openChat} className="generate-btn">
                  <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.8007 6.87613C11.1628 5.95796 12.4622 5.95796 12.8243 6.87613L13.8491 9.4743C14.5124 11.1562 15.8437 12.4876 17.5257 13.1509L20.1239 14.1757C21.042 14.5378 21.042 15.8372 20.1239 16.1993L17.5257 17.2241C15.8437 17.8874 14.5124 19.2187 13.8491 20.9007L12.8243 23.4989C12.4622 24.417 11.1628 24.417 10.8007 23.4989L9.77596 20.9007C9.11262 19.2187 7.78123 17.8874 6.0993 17.2241L3.50113 16.1993C2.58296 15.8372 2.58296 14.5378 3.50113 14.1757L6.0993 13.1509C7.78123 12.4876 9.11262 11.1562 9.77596 9.4743L10.8007 6.87613Z" stroke="white"/>
                    <path d="M20.433 3.07073C20.5688 2.72642 21.0562 2.72642 21.192 3.07073L21.5762 4.04505C21.825 4.67577 22.3243 5.17504 22.9549 5.42379L23.9293 5.80806C24.2736 5.94386 24.2736 6.43114 23.9293 6.56694L22.9549 6.9512C22.3243 7.19995 21.825 7.69923 21.5762 8.32995L21.192 9.30426C21.0562 9.64857 20.5688 9.64857 20.433 9.30426L20.0488 8.32995C19.8 7.69923 19.3007 7.19995 18.6701 6.9512L17.6957 6.56694C17.3514 6.43114 17.3514 5.94386 17.6957 5.80806L18.6701 5.42379C19.3007 5.17504 19.8 4.67577 20.0488 4.04505L20.433 3.07073Z" stroke="white" strokeWidth="0.8"/>
                  </svg>
                  <span>Genera</span>
                </button>
              </div>
            </div>

            {/* Second Row */}
            <div className="tool-card">
              <div className="tool-icon">
                <img src="https://api.builder.io/api/v1/image/assets/TEMP/7ba23b467eee527b7c5cb3beded092c01ef199bf?width=95" alt="Tool icon" />
              </div>
              <div className="tool-content">
                <h3>Attività interdisciplinari</h3>
                <p>Crea e gestisci attività che integrano più materie.</p>
                <button onClick={openChat} className="generate-btn">
                  <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.8007 6.87613C11.1628 5.95796 12.4622 5.95796 12.8243 6.87613L13.8491 9.4743C14.5124 11.1562 15.8437 12.4876 17.5257 13.1509L20.1239 14.1757C21.042 14.5378 21.042 15.8372 20.1239 16.1993L17.5257 17.2241C15.8437 17.8874 14.5124 19.2187 13.8491 20.9007L12.8243 23.4989C12.4622 24.417 11.1628 24.417 10.8007 23.4989L9.77596 20.9007C9.11262 19.2187 7.78123 17.8874 6.0993 17.2241L3.50113 16.1993C2.58296 15.8372 2.58296 14.5378 3.50113 14.1757L6.0993 13.1509C7.78123 12.4876 9.11262 11.1562 9.77596 9.4743L10.8007 6.87613Z" stroke="white"/>
                    <path d="M20.433 3.07073C20.5688 2.72642 21.0562 2.72642 21.192 3.07073L21.5762 4.04505C21.825 4.67577 22.3243 5.17504 22.9549 5.42379L23.9293 5.80806C24.2736 5.94386 24.2736 6.43114 23.9293 6.56694L22.9549 6.9512C22.3243 7.19995 21.825 7.69923 21.5762 8.32995L21.192 9.30426C21.0562 9.64857 20.5688 9.64857 20.433 9.30426L20.0488 8.32995C19.8 7.69923 19.3007 7.19995 18.6701 6.9512L17.6957 6.56694C17.3514 6.43114 17.3514 5.94386 17.6957 5.80806L18.6701 5.42379C19.3007 5.17504 19.8 4.67577 20.0488 4.04505L20.433 3.07073Z" stroke="white" strokeWidth="0.8"/>
                  </svg>
                  <span>Genera</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Chat Avatar */}
      <button onClick={openChat} className="chat-avatar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#FAB417" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Chat Interface */}
      <ChatInterface isOpen={isChatOpen} onClose={closeChat} />

      {/* Document Preview Modal */}
      {showDocumentPreview && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <DocumentPreview
              document={selectedDocument}
              onClose={() => setShowDocumentPreview(false)}
              onAskQuestion={handleAskDocumentQuestion}
              size="full"
              showActions={true}
              showMetadata={true}
            />
          </div>
        </div>
      )}
    </div>
  )
}
