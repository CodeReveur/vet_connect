'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AccountVerificationModal } from '../components/auth/auth-modals'

const translations: any = {
  en: {
    createAccount: "Create your account",
    alreadyHaveAccount: "Already have an account?",
    signIn: "Sign in",
    farmer: "Farmer",
    veterinarian: "Veterinarian",
    fullName: "Full Name",
    emailAddress: "Email Address",
    phoneNumber: "Phone Number",
    location: "Location",
    password: "Password",
    confirmPassword: "Confirm Password",
    enterFullName: "Enter your full name",
    enterEmail: "your@email.com",
    enterPhone: "+250 7XX XXX XXX",
    enterLocation: "District, Sector",
    createPassword: "Create a strong password",
    confirmPasswordPlaceholder: "Confirm your password",
    agreeTerms: "I agree to the",
    termsAndConditions: "Terms and Conditions",
    registerAs: "Register as",
    passwordsDoNotMatch: "Passwords do not match",
    registering: "Creating account...",
    registrationFailed: "Registration failed",
    emailAlreadyExists: "User with this email already exists",
    invalidEmail: "Please enter a valid email address",
    invalidPhone: "Please enter a valid Rwandan phone number",
    fillAllFields: "Please fill in all required fields",
    passwordTooShort: "Password must be at least 6 characters long",
    registrationSuccess: "Account created successfully!"
  },
  rw: {
    createAccount: "Fungura konti",
    alreadyHaveAccount: "Usanzwe ufite konti?",
    signIn: "Injira",
    farmer: "Umuhinzi",
    veterinarian: "Umuganga w'amatungo",
    fullName: "Amazina yose",
    emailAddress: "Aderesi ya imeri",
    phoneNumber: "Nimero ya telefoni",
    location: "Aho utuye",
    password: "Ijambo ry'ibanga",
    confirmPassword: "Emeza ijambo ry'ibanga",
    enterFullName: "Andika amazina yawe yose",
    enterEmail: "imeri@yawe.com",
    enterPhone: "+250 7XX XXX XXX",
    enterLocation: "Akarere, Umurenge",
    createPassword: "Kora ijambo ry'ibanga rikomeye",
    confirmPasswordPlaceholder: "Emeza ijambo ry'ibanga",
    agreeTerms: "Nemeye",
    termsAndConditions: "Amategeko n'amabwiriza",
    registerAs: "Iyandikishe nka",
    passwordsDoNotMatch: "Amagambo y'ibanga ntahura",
    registering: "Gufungura konti...",
    registrationFailed: "Kufungura konti byanze",
    emailAlreadyExists: "Aderesi ya imeri isanzwe ikoreshwa",
    invalidEmail: "Andika aderesi ya imeri nyayo",
    invalidPhone: "Andika nimero ya telefoni nyayo y'u Rwanda",
    fillAllFields: "Uzuza amakuru yose akenewe",
    passwordTooShort: "Ijambo ry'ibanga rigomba kuba rifite byibuze inyuguti 6",
    registrationSuccess: "Konti yawe yafunguwe neza!"
  }
}

export default function RegisterPage() {
  const router = useRouter()
  const [lang, setLang] = useState('en')
  const [userType, setUserType] = useState<'farmer' | 'vet'>('farmer')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    location: ''
  })
  const [loading, setLoading] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [error, setError] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  
  const t = translations[lang]

  const validateForm = () => {
    // Reset error
    setError('')

    // Check required fields
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password) {
      setError(t.fillAllFields)
      return false
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError(t.invalidEmail)
      return false
    }

    // Check phone format if provided
    if (formData.phone && !/^\+?250\s?[0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      setError(t.invalidPhone)
      return false
    }

    // Check password length
    if (formData.password.length < 6) {
      setError(t.passwordTooShort)
      return false
    }

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setError(t.passwordsDoNotMatch)
      return false
    }

    // Check terms acceptance
    if (!termsAccepted) {
      setError(t.agreeTerms +" "+ t.termsAndConditions)
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/reg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || null,
          password: formData.password,
          address: formData.location.trim() || null,
          role: userType
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error messages
        if (data.error === 'User with this email already exists') {
          setError(t.emailAlreadyExists)
        } else if (data.error === 'Invalid email format') {
          setError(t.invalidEmail)
        } else if (data.error === 'Invalid phone number format') {
          setError(t.invalidPhone)
        } else {
          setError(data.error || t.registrationFailed)
        }
        return
      } else {
         // Registration successful
         setShowVerification(true)
      }

     
      
    } catch (error) {
      console.error('Registration error:', error)
      setError(t.registrationFailed)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Main Card */}
        <div className="bg-white shadow-xl rounded-2xl border border-green-100 p-8 space-y-8">
          {/* Language Selector */}
          <div className="flex justify-end">
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="bg-white border border-green-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-sm"
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
              {t.createAccount}
            </h2>
            <p className="mt-3 text-sm text-gray-600">
              {t.alreadyHaveAccount}{' '}
              <Link href="/login" className="font-medium text-green-600 hover:text-green-700 transition-colors hover:underline">
                {t.signIn}
              </Link>
            </p>
          </div>

          <div className="space-y-6">

            {/* User Type Selection */}
            <div className="flex justify-center">
              <div className="bg-gray-100 p-1.5 rounded-xl flex shadow-sm">
                <button
                  onClick={() => setUserType('farmer')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center ${
                    userType === 'farmer'
                      ? 'bg-white text-green-700 shadow-md'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white'
                  }`}
                >
                  <i className="bi bi-person-fill mr-2"></i>
                  {t.farmer}
                </button>
                <button
                  onClick={() => setUserType('vet')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center ${
                    userType === 'vet'
                      ? 'bg-white text-green-700 shadow-md'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white'
                  }`}
                >
                  <i className="bi bi-heart-pulse-fill mr-2"></i>
                  {t.veterinarian}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.fullName} <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white transition-all hover:shadow-sm"
                  placeholder={t.enterFullName}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.emailAddress} <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:shadow-sm"
                  placeholder={t.enterEmail}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.phoneNumber}
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:shadow-sm"
                  placeholder={t.enterPhone}
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.location}
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:shadow-sm"
                  placeholder={t.enterLocation}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.password} <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:shadow-sm"
                  placeholder={t.createPassword}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.confirmPassword} <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:shadow-sm"
                  placeholder={t.confirmPasswordPlaceholder}
                />
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-400 border-gray-300 rounded transition-colors"
                />
                <label htmlFor="terms" className="ml-3 block text-sm text-gray-700">
                  {t.agreeTerms}{' '}
                  <Link href="/terms" className="text-green-600 hover:text-green-700 transition-colors hover:underline">
                    {t.termsAndConditions}
                  </Link>
                </label>
              </div>

                {/* Error Message */}
                {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    <div className="flex items-center">
                    <i className="bi bi-exclamation-triangle-fill mr-2"></i>
                    {error}
                    </div>
                </div>
                )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                {loading ? (
                  <>
                    <i className="bi bi-arrow-repeat animate-spin mr-2"></i>
                    {t.registering}
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus-fill mr-2"></i>
                    {t.registerAs} {userType === 'farmer' ? t.farmer : t.veterinarian}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Verification Modal */}
        <AccountVerificationModal 
          isOpen={showVerification}
          onClose={() => {
            setShowVerification(false)
            router.push('/login')
          }}
          lang={lang}
          email={formData.email}
        />
      </div>
    </div>
  )
}