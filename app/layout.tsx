import "styles/tailwind.css"
import { AuthProvider } from "components/Auth/AuthProvider"
import { DevModeNotice } from "components/Auth/DevModeNotice"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <DevModeNotice />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
