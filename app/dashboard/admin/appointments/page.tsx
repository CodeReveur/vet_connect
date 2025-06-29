'use client'

import { useState, useEffect } from 'react'

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
  user_name?: string
  user_email?: string
  user_phone?: string
  vet_name?: string
  vet_email?: string
  vet_phone?: string
  animal_name?: string
  animal_type?: string
}

interface StatusModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: Appointment | null
  onSuccess: () => void
}

const translations = {
  en: {
    title: "Appointments Management",
    subtitle: "View and manage all system appointments",
    searchPlaceholder: "Search appointments...",
    // Filters
    allStatuses: "All Statuses",
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    today: "Today",
    thisWeek: "This Week",
    thisMonth: "This Month",
    allTime: "All Time",
    // Table
    date: "Date & Time",
    client: "Client",
    veterinarian: "Veterinarian",
    animal: "Animal",
    status: "Status",
    payment: "Payment",
    actions: "Actions",
    // Status
    paid: "Paid",
    unpaid: "Unpaid",
    // Actions
    updateStatus: "Update Status",
    viewDetails: "View Details",
    cancel: "Cancel",
    save: "Save Changes",
    // Modal
    appointmentDetails: "Appointment Details",
    changeStatus: "Change Status",
    paymentStatus: "Payment Status",
    markAsPaid: "Mark as Paid",
    notes: "Notes",
    // Messages
    statusUpdated: "Status updated successfully",
    error: "Failed to update status"
  },
  rw: {
    title: "Gucunga Ibiganiro",
    subtitle: "Reba kandi ucunge ibiganiro byose bya sisitemu",
    searchPlaceholder: "Shakisha ibiganiro...",
    // Filters
    allStatuses: "Imiterere Yose",
    pending: "Gutegereza",
    confirmed: "Byemejwe",
    completed: "Byarangiye",
    cancelled: "Byahagaritswe",
    today: "Uyu munsi",
    thisWeek: "Iki cyumweru",
    thisMonth: "Uku kwezi",
    allTime: "Igihe cyose",
    // Table
    date: "Itariki n'Igihe",
    client: "Umukiriya",
    veterinarian: "Muganga",
    animal: "Itungo",
    status: "Imiterere",
    payment: "Kwishura",
    actions: "Ibikorwa",
    // Status
    paid: "Byishuwe",
    unpaid: "Ntibyishuwe",
    // Actions
    updateStatus: "Hindura Imiterere",
    viewDetails: "Reba Ibisobanuro",
    cancel: "Hagarika",
    save: "Bika Impinduka",
    // Modal
    appointmentDetails: "Ibisobanuro by'Ikiganiro",
    changeStatus: "Hindura Imiterere",
    paymentStatus: "Imiterere y'Ubwishyu",
    markAsPaid: "Shyira ko Byishuwe",
    notes: "Ibisobanuro",
    // Messages
    statusUpdated: "Imiterere yahinduwe neza",
    error: "Byanze guhindura imiterere"
  }
}

const StatusModal = ({ isOpen, onClose, appointment, onSuccess }: StatusModalProps) => {
  const [currentLang, setCurrentLang] = useState<'en' | 'rw'>('en')
  const [status, setStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const t = translations[currentLang]

  useEffect(() => {
    if (appointment) {
      setStatus(appointment.status)
      setPaymentStatus(appointment.payment_status)
    }
  }, [appointment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: appointment?.id,
          status: status,
          payment_status: paymentStatus
        }),
        credentials: 'include'
      })

      if (response.ok) {
        alert(t.statusUpdated)
        onSuccess()
        handleClose()
      } else {
        setError(t.error)
      }
    } catch (err) {
      setError(t.error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError('')
    onClose()
  }

  if (!isOpen || !appointment) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{t.appointmentDetails}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Appointment Info */}
          <div className="mb-6 space-y-3 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t.client}:</span>
              <span className="font-medium">{appointment.user_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t.veterinarian}:</span>
              <span className="font-medium">{appointment.vet_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t.animal}:</span>
              <span className="font-medium">{appointment.animal_name} ({appointment.animal_type})</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t.date}:</span>
              <span className="font-medium">
                {new Date(appointment.appointment_date).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Status Update */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.changeStatus}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="pending">{t.pending}</option>
                <option value="confirmed">{t.confirmed}</option>
                <option value="completed">{t.completed}</option>
                <option value="cancelled">{t.cancelled}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.paymentStatus}
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="unpaid">{t.unpaid}</option>
                <option value="paid">{t.paid}</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? '...' : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentLang, setCurrentLang] = useState<'en' | 'rw'>('en')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showModal, setShowModal] = useState(false)

  const t = translations[currentLang]

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css'
    document.head.appendChild(link)
    try {
        const userData = localStorage.getItem('user')
        if (!userData) return
  
        const user = JSON.parse(userData);
        if(user.role != 'admin'){
            window.location.assign("/login");
        }
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
      
    loadAppointments()
    
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }, [])

  const loadAppointments = async () => {
    try {
      const response = await fetch('/api/appointments', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments || [])
      }
    } catch (err) {
      console.error('Error loading appointments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'confirmed': return 'bg-blue-100 text-blue-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.vet_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.animal_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter
    
    const appointmentDate = new Date(appointment.appointment_date)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(today)
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    
    let matchesTime = true
    if (timeFilter === 'today') {
      matchesTime = appointmentDate >= today
    } else if (timeFilter === 'week') {
      matchesTime = appointmentDate >= weekAgo
    } else if (timeFilter === 'month') {
      matchesTime = appointmentDate >= monthAgo
    }
    
    return matchesSearch && matchesStatus && matchesTime
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-gray-600 mt-1">{t.subtitle}</p>
            </div>
            <button
              onClick={() => setCurrentLang(currentLang === 'en' ? 'rw' : 'en')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <i className="bi bi-translate"></i>
              {currentLang === 'en' ? 'English' : 'Kinyarwanda'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">{t.allStatuses}</option>
              <option value="pending">{t.pending}</option>
              <option value="confirmed">{t.confirmed}</option>
              <option value="completed">{t.completed}</option>
              <option value="cancelled">{t.cancelled}</option>
            </select>
            
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">{t.allTime}</option>
              <option value="today">{t.today}</option>
              <option value="week">{t.thisWeek}</option>
              <option value="month">{t.thisMonth}</option>
            </select>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.date}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.client}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.veterinarian}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.animal}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.status}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.payment}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAppointments.map(appointment => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(appointment.appointment_date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{appointment.user_name}</p>
                        <p className="text-xs text-gray-500">{appointment.user_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{appointment.vet_name}</p>
                        <p className="text-xs text-gray-500">{appointment.vet_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {appointment.animal_name} ({appointment.animal_type})
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                        {t[appointment.status as keyof typeof t]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        appointment.payment_status === 'paid' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {t[appointment.payment_status as keyof typeof t]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleUpdateStatus(appointment)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Update Modal */}
        <StatusModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          appointment={selectedAppointment}
          onSuccess={loadAppointments}
        />
      </div>
    </div>
  )
}