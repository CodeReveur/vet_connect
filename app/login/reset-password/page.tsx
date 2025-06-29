'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const translations: any = {
  en: {
    resetPassword: "Reset your password",
    newPassword: "New password",
    confirmPassword: "Confirm password",
    resetButton: "Reset password",
    passwordMismatch: "Passwords do not match",
    passwordTooShort: "Password must be at least 6 characters",
    invalidToken: "Invalid or expired reset link",
    success: "Password reset successfully!",
    redirecting: "Redirecting to login...",
    backToLogin: "Back to login",
    loading: "Loading..."
  },
  rw: {
    resetPassword: "Subiramo ijambo ry'ibanga",
    newPassword: "Ijambo ry'ibanga rishya",
    confirmPassword: "Emeza ijambo ry'ibanga",
    resetButton: "Subiramo ijambo ry'ibanga",
    passwordMismatch: "Amagambo y'ibanga ntahura",
    passwordTooShort: "Ijambo ry'ibanga rigomba kuba nibura inyuguti 6",
    invalidToken: "Umurongo wo gusubiramo warangiye cyangwa ntiwemewe",
    success: "Ijambo ry'ibanga ryarasubiwemo neza!",
    redirecting: "Turaza ku kwinjira...",
    backToLogin: "Garuka ku kwinjira",
    loading: "Gutegura..."
  }
}

// Separate component that uses useSearchParams
function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [lang, setLang] = useState('en')
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const t = translations[lang]

  useEffect(() => {
    if (!token) {
      setError(t.invalidToken)
    }
  }, [token, t.invalidToken])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate passwords
    if (passwords.newPassword.length < 6) {
      setError(t.passwordTooShort)
      return
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError(t.passwordMismatch)
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword: passwords.newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setError(data.error || t.invalidToken)
      }
    } catch (err) {
      setError(t.invalidToken)
    } finally {
      setLoading(false)
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

          {/* Logo and Title */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center text-green-700 text-2xl font-bold mb-6">
              <span className="text-3xl mr-2">🐾</span>
              VetConnect
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{t.resetPassword}</h1>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <i className="bi bi-check-circle-fill text-green-600 text-2xl"></i>
              </div>
              <p className="text-green-700 font-medium">{t.success}</p>
              <p className="text-gray-600 text-sm">{t.redirecting}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  <i className="bi bi-exclamation-circle-fill mr-2"></i>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.newPassword}
                </label>
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full text-gray-700 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder={t.newPassword}
                  disabled={!token}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.confirmPassword}
                </label>
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="w-full text-gray-700 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder={t.confirmPassword}
                  disabled={!token}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !token || !passwords.newPassword || !passwords.confirmPassword}
                className="w-full py-3 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? t.loading : t.resetButton}
              </button>

              <div className="text-center">
                <Link href="/login" className="text-green-600 hover:text-green-700 text-sm">
                  {t.backToLogin}
                </Link>
              </div>
            </form>
          )}
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
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordForm />
    </Suspense>
  )
}