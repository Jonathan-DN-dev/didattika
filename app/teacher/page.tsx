import { Metadata } from "next"
import { ProtectedRoute } from "components/Auth/ProtectedRoute"
import { TeacherDocumentDashboard } from "components/Teacher/Documents/TeacherDocumentDashboard"

export const metadata: Metadata = {
  title: "DIDATTIKA - Dashboard Docente",
  description: "Dashboard per la gestione e monitoraggio dei documenti degli studenti.",
}

export default function TeacherDashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="https://api.builder.io/api/v1/image/assets/TEMP/0d983f9212f49516849aa4ef097ba2171230fdcc?width=314" 
                alt="DIDATTIKA" 
                className="h-8 w-auto"
              />
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Dashboard Docente</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V3h5v14z" />
                </svg>
              </button>
              
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                D
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-8">
          <TeacherDocumentDashboard />
        </main>
      </div>
    </ProtectedRoute>
  )
}
