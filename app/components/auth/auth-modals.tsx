import { useState, useEffect } from 'react'

interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  lang: string
}

const translations: any = {
  en: {
    // Forgot Password Modal
    forgotPassword: "Reset your password",
    forgotPasswordDesc: "Enter your email address and we'll send you a link to reset your password.",
    emailAddress: "Email address",
    sendResetLink: "Send reset link",
    backToLogin: "Back to login",
    resetLinkSent: "Reset link sent!",
    checkEmailMessage: "Please check your email for password reset instructions.",
    errorSending: "Failed to send reset link. Please try again.",
    
    // OTP Modal
    verifyAccount: "Verify your account",
    otpSentTo: "We've sent a 6-digit code to",
    enterOTPCode: "Enter verification code",
    verifyCode: "Verify code",
    resendCode: "Resend code",
    codeResent: "Code resent successfully!",
    invalidCode: "Invalid verification code",
    errorVerifying: "Failed to verify code. Please try again.",
    
    // Account Verification Modal
    accountCreated: "Account created successfully!",
    verificationRequired: "Please verify your email address to activate your account.",
    verificationSent: "A verification link has been sent to",
    checkEmail: "Check your email",
    didntReceive: "Didn't receive the email?",
    resendVerification: "Resend verification",
    verificationResent: "Verification email resent!",
    errorResending: "Failed to resend verification. Please try again.",
    
    // Common
    close: "Close",
    cancel: "Cancel",
    loading: "Loading..."
  },
  rw: {
    // Forgot Password Modal
    forgotPassword: "Hindura ijambo ry'ibanga",
    forgotPasswordDesc: "Andika aderesi ya imeri yawe kandi tuzakwoherereza umunyururu wo guhindura ijambo ry'ibanga.",
    emailAddress: "Aderesi ya imeri",
    sendResetLink: "Ohereza umunyururu wo kusubiramo",
    backToLogin: "Garuka ku kwinjira",
    resetLinkSent: "Umunyururu waroherejwe!",
    checkEmailMessage: "Reba imeri yawe ugere ku mabwiriza yo kusubiramo ijambo ry'ibanga.",
    errorSending: "Kunaniritse kohereza umunyururu. Ongera ugerageze.",
    
    // OTP Modal
    verifyAccount: "Emeza konti yawe",
    otpSentTo: "Twohereje umubare w'imibare 6 kuri",
    enterOTPCode: "Andika kode yo kwemeza",
    verifyCode: "Emeza kode",
    resendCode: "Ongera wohereze kode",
    codeResent: "Kode yongera yaroherejwe neza!",
    invalidCode: "Kode yo kwemeza ntiyemewe",
    errorVerifying: "Kunaniritse kwemeza kode. Ongera ugerageze.",
    
    // Account Verification Modal
    accountCreated: "Konti yarakoreshejwe neza!",
    verificationRequired: "Nyamuneka emeza aderesi ya imeri yawe kugira ngo ukoreshe konti yawe.",
    verificationSent: "Umunyururu wo kwemeza waroherejwe kuri",
    checkEmail: "Reba imeri yawe",
    didntReceive: "Ntabwo wakiriye imeri?",
    resendVerification: "Ongera wohereze kwemeza",
    verificationResent: "Imeri yo kwemeza yongera yaroherejwe!",
    errorResending: "Kunaniritse kohereza kwemeza. Ongera ugerageze.",
    
    // Common
    close: "Funga",
    cancel: "Hagarika",
    loading: "Gutegura..."
  }
}

// Forgot Password Modal
export function ForgotPasswordModal({ isOpen, onClose, lang }: BaseModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const t = translations[lang]

  const handleSubmit = async () => {
    if (!email) return
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setSent(true)
      } else {
        setError(data.error || t.errorSending)
      }
    } catch (err) {
      setError(t.errorSending)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setSent(false)
    setLoading(false)
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-brightness-50 backdrop-blur-sm bg-slate-400/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">{t.forgotPassword}</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        {!sent ? (
          <>
            <p className="text-gray-600 text-sm">{t.forgotPasswordDesc}</p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                {t.emailAddress}
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                placeholder={t.emailAddress}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {t.backToLogin}
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !email}
                className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? t.loading : t.sendResetLink}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <i className="bi bi-envelope-check text-green-600 text-2xl"></i>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{t.resetLinkSent}</h4>
              <p className="text-gray-600 text-sm">{t.checkEmailMessage}</p>
            </div>
            
            <button
              onClick={handleClose}
              className="w-full py-3 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
            >
              {t.close}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// OTP Verification Modal
export function OTPModal({ isOpen, onClose, lang, email, onVerified }: BaseModalProps & { email: string, onVerified: () => void }) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const t = translations[lang]

  useEffect(() => {
    if (isOpen && email) {
      // Send OTP when modal opens
      sendOTP()
    }
  }, [isOpen, email])

  const sendOTP = async () => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      
      // In development, you might want to show the OTP
      if (process.env.NODE_ENV === 'development' && data.debug_otp) {
        console.log('Debug OTP:', data.debug_otp)
      }
    } catch (err) {
      console.error('Failed to send OTP:', err)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)
      setError('')
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleVerify = async () => {
    const otpCode = otp.join('')
    if (otpCode.length !== 6) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode }),
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        // Store user data if returned
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
        }
        onVerified()
        handleClose()
      } else {
        setError(data.error || t.invalidCode)
      }
    } catch (err) {
      setError(t.errorVerifying)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setError('')
    setSuccessMessage('')
    
    try {
      const response = await fetch(`/api/auth/verify-email?email=${encodeURIComponent(email)}`, {
        method: 'GET'
      })

      if (response.ok) {
        setSuccessMessage(t.codeResent)
        setOtp(['', '', '', '', '', ''])
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (err) {
      setError(t.errorVerifying)
    } finally {
      setResendLoading(false)
    }
  }

  const handleClose = () => {
    setOtp(['', '', '', '', '', ''])
    setError('')
    setLoading(false)
    setResendLoading(false)
    setSuccessMessage('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-brightness-50 backdrop-blur-sm bg-slate-400/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">{t.verifyAccount}</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        <div className="text-center">
          <p className="text-gray-600 text-sm mb-1">{t.otpSentTo}</p>
          <p className="font-medium text-gray-900">{email}</p>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm text-center">
            {successMessage}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t.enterOTPCode}
          </label>
          <div className="flex space-x-2 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
            ))}
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleVerify}
            disabled={loading || otp.join('').length !== 6}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? t.loading : t.verifyCode}
          </button>
          
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="w-full py-2 px-4 text-green-600 hover:text-green-700 disabled:opacity-50 transition-colors"
          >
            {resendLoading ? t.loading : t.resendCode}
          </button>
        </div>
      </div>
    </div>
  )
}

// Account Verification Modal
export function AccountVerificationModal({ isOpen, onClose, lang, email }: BaseModalProps & { email: string }) {
  const [resendLoading, setResendLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [error, setError] = useState('')
  const t = translations[lang]

  useEffect(() => {
    if (isOpen && email) {
      // Send verification email when modal opens
      sendVerificationEmail()
    }
  }, [isOpen, email])

  const sendVerificationEmail = async () => {
    try {
      const response = await fetch('/api/auth/verify-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      
      // In development, you might want to show the link
      if (process.env.NODE_ENV === 'development' && data.debug_link) {
        console.log('Debug verification link:', data.debug_link)
      }
    } catch (err) {
      console.error('Failed to send verification email:', err)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setError('')
    setSuccessMessage('')
    
    try {
      const response = await fetch('/api/auth/verify-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        setSuccessMessage(t.verificationResent)
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(t.errorResending)
      }
    } catch (err) {
      setError(t.errorResending)
    } finally {
      setResendLoading(false)
    }
  }

  const handleClose = () => {
    setResendLoading(false)
    setError('')
    setSuccessMessage('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-brightness-50 backdrop-blur-sm bg-slate-400/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">{t.accountCreated}</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <i className="bi bi-check-circle text-green-600 text-3xl"></i>
          </div>
          
          <h4 className="text-lg font-semibold text-gray-900 mb-2">{t.checkEmail}</h4>
          <p className="text-gray-600 text-sm mb-2">{t.verificationRequired}</p>
          <p className="text-gray-600 text-sm mb-4">
            {t.verificationSent} <span className="font-medium text-gray-900">{email}</span>
          </p>
          
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {successMessage}
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleClose}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
          >
            {t.close}
          </button>
          
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">{t.didntReceive}</p>
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-green-600 hover:text-green-700 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              {resendLoading ? t.loading : t.resendVerification}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}