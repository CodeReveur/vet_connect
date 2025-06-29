'use client'

import { useEffect, useState } from 'react'

interface Appointment {
  id: number
  user_id: number
  vet_id: number
  animal_id: number
  appointment_date: string
  created_at: string
  status: string
  payment_status: string
  payment_reference_id?: string
  // From joins
  user_name?: string
  user_email?: string
  user_phone?: string
  vet_name?: string
  vet_email?: string
  vet_phone?: string
  animal_name?: string
  animal_type?: string
}

const translations = {
  en: {
    title: "My Appointments",
    subtitle: "Manage your veterinary care schedule",
    noAppointments: "No appointments scheduled",
    bookFirst: "Schedule your first veterinary consultation",
    with: "with",
    veterinarian: "Veterinarian",
    dateTime: "Date & Time",
    animal: "Animal",
    status: "Status",
    payment: "Payment",
    actions: "Actions",
    cancel: "Cancel",
    reschedule: "Reschedule",
    pay: "Pay Now",
    viewDetails: "View Details",
    contactVet: "Contact Vet",
    // Status translations
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    // Payment status
    paid: "Paid",
    unpaid: "Unpaid",
    // Filters
    allStatuses: "All Statuses",
    filterByStatus: "Filter by status",
    upcoming: "Upcoming",
    past: "Past",
    today: "Today",
    appointmentDetails: "Appointment Details",
    vetContact: "Veterinarian Contact"
  },
  rw: {
    title: "Ibiganiro Byanjye",
    subtitle: "Gucunga gahunda y'ubuganga bw'itungo",
    noAppointments: "Nta gahunda zabonetse",
    bookFirst: "Gena ikiganiro cya mbere na muganga w'itungo",
    with: "na",
    veterinarian: "Muganga w'itungo",
    dateTime: "Itariki n'igihe",
    animal: "Itungo",
    status: "Imiterere",
    payment: "Kwishura",
    actions: "Ibikorwa",
    cancel: "Hagarika",
    reschedule: "Hindura igihe",
    pay: "Ishura Nonaha",
    viewDetails: "Reba Ibisobanuro",
    contactVet: "Hamagara Muganga",
    // Status translations
    pending: "Gutegereza",
    confirmed: "Byemejwe",
    completed: "Byarangiye",
    cancelled: "Byahagaritswe",
    // Payment status
    paid: "Byishuwe",
    unpaid: "Ntibyishuwe",
    // Filters
    allStatuses: "Imiterere yose",
    filterByStatus: "Shungura ukurikije imiterere",
    upcoming: "Bizaza",
    past: "Byashize",
    today: "Uyu munsi",
    appointmentDetails: "Ibisobanuro by'ikiganiro",
    vetContact: "Aho Muganga abarizwa"
  }
}

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [currentLang, setCurrentLang] = useState<'en' | 'rw'>('en')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [timeFilter, setTimeFilter] = useState<string>('all')

  const t = translations[currentLang]

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css'
    document.head.appendChild(link)
    
    fetchUserAndAppointments()
    
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }, [])

  const fetchUserAndAppointments = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) return

      const user = JSON.parse(userData)
      setCurrentUserId(user.id)

      const response = await fetch(`/api/appointments?user_id=${user.id || currentUserId}`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments || [])
      } else {
        setError('Failed to load appointments')
      }
    } catch (err) {
      setError('Error loading appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return
    
    try {
      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: appointmentId,
          status: 'cancelled'
        }),
        credentials: 'include'
      })
      
      if (response.ok) {
        fetchUserAndAppointments()
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'bi-clock-history'
      case 'confirmed': return 'bi-check-circle-fill'
      case 'completed': return 'bi-check-all'
      case 'cancelled': return 'bi-x-circle-fill'
      default: return 'bi-circle'
    }
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getTimeUntil = (date: string) => {
    const appointmentDate = new Date(date)
    const now = new Date()
    const diff = appointmentDate.getTime() - now.getTime()
    
    if (diff < 0) return null
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `In ${days} day${days > 1 ? 's' : ''}`
    if (hours > 0) return `In ${hours} hour${hours > 1 ? 's' : ''}`
    return 'Soon'
  }

  const filteredAppointments = appointments.filter(appt => {
    if (statusFilter !== 'all' && appt.status !== statusFilter) {
      return false
    }
    
    const apptDate = new Date(appt.appointment_date)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (timeFilter === 'upcoming' && apptDate < now) return false
    if (timeFilter === 'past' && apptDate >= now) return false
    if (timeFilter === 'today' && (apptDate < today || apptDate >= tomorrow)) return false
    
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="relative">
          <div className="animate-spin h-16 w-16 border-4 border-green-200 border-t-green-600 rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="bi bi-heart-pulse text-green-600 text-xl"></i>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/20">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.title}</h1>
              <p className="text-gray-600 text-lg">{t.subtitle}</p>
            </div>
            <button
              onClick={() => setCurrentLang(currentLang === 'en' ? 'rw' : 'en')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-all"
            >
              <i className="bi bi-translate text-lg"></i>
              <span className="font-medium">{currentLang === 'en' ? 'English' : 'Kinyarwanda'}</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <i className="bi bi-funnel text-gray-400"></i>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm font-medium"
              >
                <option value="all">{t.allStatuses}</option>
                <option value="pending">{t.pending}</option>
                <option value="confirmed">{t.confirmed}</option>
                <option value="completed">{t.completed}</option>
                <option value="cancelled">{t.cancelled}</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              {['all', 'today', 'upcoming', 'past'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    timeFilter === filter 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter === 'all' ? 'All' : t[filter as keyof typeof t]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6 flex items-center gap-3">
            <i className="bi bi-exclamation-triangle-fill"></i>
            {error}
          </div>
        )}

        {/* Appointments Grid */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="bi bi-calendar-x text-green-600 text-4xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.noAppointments}</h3>
              <p className="text-gray-500 mb-8">{t.bookFirst}</p>
              <a
                href="/find-vets"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all font-medium"
              >
                <i className="bi bi-plus-circle"></i>
                Book Appointment
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAppointments.map((appt) => {
              const timeUntil = getTimeUntil(appt.appointment_date)
              const appointmentDate = new Date(appt.appointment_date)
              
              return (
                <div key={appt.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{t.appointmentDetails}</h3>
                        <p className="text-green-100 text-sm">
                          {appointmentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        {timeUntil && appt.status !== 'cancelled' && appt.status !== 'completed' && (
                          <p className="text-green-100 text-sm mt-1">{timeUntil}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusStyles(appt.status)}`}>
                        <i className={`bi ${getStatusIcon(appt.status)}`}></i>
                        {t[appt.status as keyof typeof t]}
                      </span>
                      <span className={`text-sm font-medium ${appt.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                        <i className={`bi ${appt.payment_status === 'paid' ? 'bi-check-circle-fill' : 'bi-clock-history'} mr-1`}></i>
                        {t.payment}: {t[appt.payment_status as keyof typeof t]}
                      </span>
                    </div>

                    {/* Vet Info */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-500 mb-3">{t.vetContact}</h4>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                          <i className="bi bi-person-fill text-green-600 text-xl"></i>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{appt.vet_name || 'Dr. Veterinarian'}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span><i className="bi bi-envelope mr-1"></i>{appt.vet_email}</span>
                            <span><i className="bi bi-telephone mr-1"></i>{appt.vet_phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pet Info */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                          <i className="bi bi-heart text-green-600"></i>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">{t.animal}</p>
                          <p className="font-medium text-gray-900">{appt.animal_name} • {appt.animal_type}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      {appt.status === 'pending' && (
                        <button
                          onClick={() => handleCancelAppointment(appt.id)}
                          className="flex-1 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          <i className="bi bi-x-circle mr-1"></i>
                          {t.cancel}
                        </button>
                      )}
                      {appt.payment_status === 'unpaid' && appt.status !== 'cancelled' && (
                        <button className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:shadow-md transition-all">
                          <i className="bi bi-credit-card mr-1"></i>
                          {t.pay}
                        </button>
                      )}
                      <button className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                        <i className="bi bi-telephone mr-1"></i>
                        {t.contactVet}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}