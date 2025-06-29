'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const translations: any = {
  en: {
    verifying: "Verifying your email...",
    success: "Email verified successfully!",
    redirecting: "Redirecting to dashboard...",
    invalidToken: "Invalid or expired verification link",
    alreadyVerified: "This email has already been verified",
    goToLogin: "Go to login",
    goToDashboard: "Go to dashboard",
    tryAgain: "Request new verification"
  },
  rw: {
    verifying: "Turimo kwemeza imeri yawe...",
    success: "Imeri yemejwe neza!",
    redirecting: "Turimo kujya ku dashboard...",
    invalidToken: "Umurongo wo kwemeza ntiwemewe cyangwa warangiye",
    alreadyVerified: "Iyi meri yari yamaze kwemezwa",
    goToLogin: "Jya ku kwinjira",
    goToDashboard: "Jya ku dashboard",
    tryAgain: "Saba kwemezwa gushya"
  }
}

// Separate component that uses useSearchParams
function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [lang, setLang] = useState('en')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [userRole, setUserRole] = useState('')
  
  const t = translations[lang]

  useEffect(() => {
    if (token) {
      verifyEmail()
    } else {
      setStatus('error')
      setErrorMessage(t.invalidToken)
    }
  }, [token, t.invalidToken])

  const verifyEmail = async () => {
    try {
      const response = await fetch(`/api/auth/verify-link?token=${token}`, {
        method: 'GET',
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        if (data.user) {
          // Store user data in memory instead of localStorage for better SSR compatibility
          setUserRole(data.user.role)
        }
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push(data.redirect || '/dashboard')
        }, 2000)
      } else {
        setStatus('error')
        setErrorMessage(data.error || t.invalidToken)
      }
    } catch (err) {
      setStatus('error')
      setErrorMessage(t.invalidToken)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-xl rounded-2xl border border-green-100 p-8">
          {/* Language Selector */}
          <div className="flex justify-end mb-6">
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="bg-white border border-green-200 text-gray-700 px-3 py-2 rounded-lg text-sm"
            >
              <option value="en">🌐 English</option>
              <option value="rw">🇷🇼 Kinyarwanda</option>
            </select>
          </div>

          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center text-green-700 text-2xl font-bold">
              <span className="text-3xl mr-2">🐾</span>
              VetConnect
            </Link>
          </div>

          {/* Status Content */}
          <div className="text-center space-y-6">
            {status === 'loading' && (
              <>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
                <p className="text-gray-700 font-medium">{t.verifying}</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-green-700 font-medium text-lg">{t.success}</p>
                <p className="text-gray-600 text-sm">{t.redirecting}</p>
                <div className="pt-4">
                  <Link 
                    href={userRole === 'vet' ? '/vet/dashboard' : '/owner/dashboard'}
                    className="inline-block py-3 px-6 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  >
                    {t.goToDashboard}
                  </Link>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-red-700 font-medium">{errorMessage}</p>
                <div className="space-y-3 pt-4">
                  <Link 
                    href="/login"
                    className="block py-3 px-6 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  >
                    {t.goToLogin}
                  </Link>
                  <Link 
                    href="/register"
                    className="block py-3 px-6 border border-green-600 text-green-600 rounded-xl hover:bg-green-50 transition-colors"
                  >
                    {t.tryAgain}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-xl rounded-2xl border border-green-100 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center text-green-700 text-2xl font-bold">
              <span className="text-3xl mr-2">🐾</span>
              VetConnect
            </div>
          </div>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main component wrapped with Suspense
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailForm />
    </Suspense>
  )
}