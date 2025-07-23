import { Metadata } from "next"
import { ProtectedRoute } from "components/Auth/ProtectedRoute"
import { ChatProvider } from "components/Chat/ChatProvider"
import { DashboardContent } from "components/Dashboard/DashboardContent"

export const metadata: Metadata = {
  title: "DIDATTIKA - Dashboard",
  description: "I tuoi strumenti! Accedi alle funzionalità di pianificazione didattica.",
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <ChatProvider>
        <DashboardContent />
      </ChatProvider>
    </ProtectedRoute>
  )
}
