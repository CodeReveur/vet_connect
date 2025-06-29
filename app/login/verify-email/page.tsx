'use client'
import { useState, useEffect } from 'react'
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

export default function VerifyEmailPage() {
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
  }, [token])

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
          localStorage.setItem('user', JSON.stringify(data.user))
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
            <Link href="/" className="inline-flex items-center text-green-700 text-3xl font-bold">
              <span className="text-4xl mr-2">🐾</span>
              VetConnect
            </Link>
          </div>

          {/* Status Content */}
          <div className="text-center space-y-6">
            {status === 'loading' && (
              <>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <i className="bi bi-arrow-repeat animate-spin text-green-600 text-2xl"></i>
                </div>
                <p className="text-gray-700 font-medium">{t.verifying}</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <i className="bi bi-check-circle-fill text-green-600 text-2xl"></i>
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
                  <i className="bi bi-x-circle-fill text-red-600 text-2xl"></i>
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