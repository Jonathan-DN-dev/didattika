import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "DIDATTIKA - Welcome",
  description: "Accedi al tuo spazio intelligente. La scuola come non l'hai mai vissuta.",
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-didattika-yellow flex items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
          {/* Left Container */}
          <div className="flex flex-col items-center text-center lg:text-left lg:items-start max-w-lg">
            {/* Logo */}
            <div className="mb-6">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/4d27f1963d5afc03433214110715f564efe67850?width=294"
                alt="DIDATTIKA"
                className="h-7 w-auto"
              />
            </div>

            {/* Welcome Title */}
            <h1 className="text-slate-900 text-2xl md:text-3xl font-medium mb-4 font-overpass">
              Benvenuto!
            </h1>

            {/* Description */}
            <p className="text-black text-base md:text-lg leading-relaxed mb-8 max-w-md font-overpass">
              Accedi al tuo spazio intelligente. La scuola come non l'hai mai vissuta.
              Accedi o registrati con il tuo account
            </p>

            {/* Primary Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-6 w-full sm:w-auto">
              <Link href="/login" className="login-btn">
                Accedi
              </Link>
              <Link href="/register" className="login-btn">
                Registrati
              </Link>
            </div>

            {/* Social Login Buttons */}
            <div className="flex flex-col gap-3 w-full max-w-sm">
              <button className="social-btn">
                <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.5367 7.19425H13.9997V7.16659H7.99967V9.83325H11.7673C11.2177 11.3856 9.74067 12.4999 7.99967 12.4999C5.79067 12.4999 3.99967 10.7089 3.99967 8.49992C3.99967 6.29092 5.79067 4.49992 7.99967 4.49992C9.01934 4.49992 9.94701 4.88459 10.6533 5.51292L12.539 3.62725C11.3483 2.51759 9.75567 1.83325 7.99967 1.83325C4.31801 1.83325 1.33301 4.81825 1.33301 8.49992C1.33301 12.1816 4.31801 15.1666 7.99967 15.1666C11.6813 15.1666 14.6663 12.1816 14.6663 8.49992C14.6663 8.05292 14.6203 7.61659 14.5367 7.19425Z" fill="#FFC107"/>
                  <path d="M2.10156 5.39692L4.2919 7.00325C4.88456 5.53592 6.3199 4.49992 7.99956 4.49992C9.01923 4.49992 9.9469 4.88458 10.6532 5.51292L12.5389 3.62725C11.3482 2.51759 9.75556 1.83325 7.99956 1.83325C5.4389 1.83325 3.21823 3.27892 2.10156 5.39692Z" fill="#FF3D00"/>
                  <path d="M8.00043 15.1667C9.72243 15.1667 11.2871 14.5077 12.4701 13.436L10.4068 11.69C9.73743 12.197 8.90543 12.5 8.00043 12.5C6.26643 12.5 4.7941 11.3943 4.23943 9.85132L2.06543 11.5263C3.16876 13.6853 5.40943 15.1667 8.00043 15.1667Z" fill="#4CAF50"/>
                  <path d="M14.537 7.19441H14V7.16675H8V9.83342H11.7677C11.5037 10.5791 11.024 11.2221 10.4053 11.6904L10.4063 11.6897L12.4697 13.4357C12.3237 13.5684 14.6667 11.8334 14.6667 8.50008C14.6667 8.05308 14.6207 7.61675 14.537 7.19441Z" fill="#1976D2"/>
                </svg>
                <span>Continua con Google</span>
              </button>

              <button className="social-btn">
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.5003 1.83325H10.5003C9.61627 1.83325 8.76842 2.18444 8.1433 2.80956C7.51818 3.43468 7.16699 4.28253 7.16699 5.16659V7.16659H5.16699V9.83325H7.16699V15.1666H9.83366V9.83325H11.8337L12.5003 7.16659H9.83366V5.16659C9.83366 4.98977 9.9039 4.82021 10.0289 4.69518C10.1539 4.57016 10.3235 4.49992 10.5003 4.49992H12.5003V1.83325Z" stroke="#3E88C7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Continua con Facebook</span>
              </button>
            </div>
          </div>

          {/* Right Container - Illustration */}
          <div className="flex-shrink-0 max-w-lg lg:max-w-xl">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/a3710979f45974bf4678bbe12c74eeb59272f1bf?width=1264"
              alt="Educational illustration with students and learning tools"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </main>
  )
}
