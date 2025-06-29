'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AccountVerificationModal, ForgotPasswordModal, OTPModal } from '../components/auth/auth-modals'

const translations: any = {
  en: {
    signIn: "Sign in to your account",
    emailAddress: "Email address",
    password: "Password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot your password?",
    signInButton: "Sign in",
    noAccount: "Or",
    createAccount: "create a new account",
    invalidCredentials: "Invalid email or password",
    serverError: "Something went wrong. Please try again.",
    fillAllFields: "Please fill in all fields"
  },
  rw: {
    signIn: "Injira kuri konti yawe",
    emailAddress: "Aderesi ya imeri",
    password: "Ijambo ry'ibanga",
    rememberMe: "Unyibuke",
    forgotPassword: "Wibagiwe ijambo ry'ibanga?",
    signInButton: "Injira",
    noAccount: "Cyangwa",
    createAccount: "fungura konti nshya",
    invalidCredentials: "Imeri cyangwa ijambo ry'ibanga bitariho",
    serverError: "Habaye ikibazo. Ongera ugerageze.",
    fillAllFields: "Uzuza ibisabwa byose"
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [lang, setLang] = useState('en')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Modal states
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  
  const t = translations[lang]

  const handleSubmit = async () => {
    // Clear previous errors
    setError('')

    // Validate form data
    if (!formData.email || !formData.password) {
      setError(t.fillAllFields)
      return
    }
    
    setLoading(true)
    setUserEmail(formData.email)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
        credentials: 'include' // Important for cookies
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          setError(t.invalidCredentials)
        } else if (response.status === 400) {
          setError(data.error || t.fillAllFields)
        } else {
          setError(t.serverError)
        }
        return
      }

      // Success - store user data if needed
      if (data.user) {
        // You can store user data in context or local storage here
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      // Check if additional verification is needed
      // This is where you might implement your own business logic
      const userRole = data.user?.role
      
      // Redirect based on user role
      if (userRole === 'vet') {
        router.push('/dashboard')
      } else if (userRole === 'owner') {
        router.push('/dashboard')
      } else {
        router.push('/dashboard')
      }
      
    } catch (err) {
      console.error('Login error:', err)
      setError(t.serverError)
    } finally {
      setLoading(false)
    }
  }

  const handleOTPVerified = () => {
    router.push('/dashboard')
  }

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowForgotPassword(true)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Main Card */}
        <div className="bg-white shadow-xl rounded-2xl border border-green-100 p-8 space-y-8">
          {/* Language Selector */}
          <div className="flex justify-end">
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="bg-white border border-green-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-sm"
            >
              <option value="en">🌐 English</option>
              <option value="rw">🇷🇼 Kinyarwanda</option>
            </select>
          </div>
          
          <div className="text-center">
            <Link href="/" className="inline-flex items-center text-green-700 text-3xl font-bold hover:text-green-800 transition-colors">
              <span className="text-4xl mr-2">🐾</span>
              VetConnect
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-gray-900 tracking-tight">
              {t.signIn}
            </h2>
            <p className="mt-3 text-sm text-gray-600">
              {t.noAccount}{' '}
              <Link href="/register" className="font-medium text-green-600 hover:text-green-700 transition-colors hover:underline">
                {t.createAccount}
              </Link>
            </p>
          </div>
          
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
                <i className="bi bi-exclamation-circle-fill mr-2"></i>
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.emailAddress}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    setError('') // Clear error on input change
                  }}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white transition-all hover:shadow-sm"
                  placeholder={t.emailAddress}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.password}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    setError('') // Clear error on input change
                  }}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:shadow-sm"
                  placeholder={t.password}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-400 border-gray-300 rounded transition-colors"
                />
                <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-700">
                  {t.rememberMe}
                </label>
              </div>

              <div className="text-sm">
                <button
                  onClick={handleForgotPassword}
                  className="font-medium text-green-600 hover:text-green-700 transition-colors hover:underline"
                >
                  {t.forgotPassword}
                </button>
              </div>
            </div>

            <div>
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.email || !formData.password}
                className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                {loading ? (
                  <i className="bi bi-arrow-repeat animate-spin text-lg"></i>
                ) : (
                  <>
                    <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                      <i className="bi bi-lock-fill text-green-400 group-hover:text-green-300 transition-colors"></i>
                    </span>
                    <span className="ml-6">{t.signInButton}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Modals */}
        <ForgotPasswordModal 
          isOpen={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
          lang={lang}
        />
        
        <OTPModal 
          isOpen={showOTP}
          onClose={() => setShowOTP(false)}
          lang={lang}
          email={userEmail}
          onVerified={handleOTPVerified}
        />
        
        <AccountVerificationModal 
          isOpen={showVerification}
          onClose={() => setShowVerification(false)}
          lang={lang}
          email={userEmail}
        />
      </div>
    </div>
  )
}