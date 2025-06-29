'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const translations: any = {
  en: {
    // Common
    welcome: "Welcome back",
    overview: "Today's Overview",
    viewAll: "View All",
    noData: "No data available",
    
    // Vet specific
    todayAppointments: "Today's Appointments",
    pendingRequests: "Pending Requests",
    totalClients: "Total Clients",
    completedVisits: "Completed This Week",
    newRequests: "New Requests",
    viewSchedule: "View Schedule",
    acceptRequest: "Accept",
    rejectRequest: "Reject",
    confirmed: "Confirmed",
    pending: "Pending",
    
    // Owner specific
    myAnimals: "My Animals",
    upcomingAppointments: "Upcoming Appointments",
    healthAlerts: "Health Alerts",
    totalAnimals: "Total Animals",
    healthyAnimals: "Healthy Animals",
    needsAttention: "Needs Attention",
    nextVaccination: "Next Vaccination",
    bookAppointment: "Book Appointment",
    viewAnimalRecords: "View Records",
    
    // Status
    healthy: "Healthy",
    sick: "Sick",
    recovering: "Recovering",
    critical: "Critical",
    emergency: "Emergency"
  },
  rw: {
    // Common
    welcome: "Murakaza neza",
    overview: "Ibikorwa by'uyu munsi",
    viewAll: "Reba byose",
    noData: "Nta makuru ahari",
    
    // Vet specific
    todayAppointments: "Ibihe by'uyu munsi",
    pendingRequests: "Ibisabwa bitegereje",
    totalClients: "Abakiriya bose",
    completedVisits: "Byarangiye iki cyumweru",
    newRequests: "Ibisabwa bishya",
    viewSchedule: "Reba gahunda",
    acceptRequest: "Emeza",
    rejectRequest: "Hanga",
    confirmed: "Byemejwe",
    pending: "Bitegereje",
    
    // Owner specific
    myAnimals: "Amatungo yanjye",
    upcomingAppointments: "Ibiganiro biri imbere",
    healthAlerts: "Imenyesha ry'ubuzima",
    totalAnimals: "Amatungo yose",
    healthyAnimals: "Afite ubuzima bwiza",
    needsAttention: "Akeneye ubuvuzi",
    nextVaccination: "Urukingo rukurikira",
    bookAppointment: "Gena igihe",
    viewAnimalRecords: "Reba amateka",
    
    // Status
    healthy: "Afite ubuzima bwiza",
    sick: "Ararwaye",
    recovering: "Arakira",
    critical: "Arakomeye",
    emergency: "Byihutirwa"
  }
}

export default function Dashboard() {
  const [lang, setLang] = useState('en')
  const [userInfo, setUserInfo] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [animals, setAnimals] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const t = translations[lang]
  const isVet = userInfo?.role === 'vet'

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'en'
    setLang(savedLang)
    
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setUserInfo(user)
      loadDashboardData(user)
    }
  }, [])

  const loadDashboardData = async (user: any) => {
    try {
      if (user.role === 'vet') {
        // Load vet appointments
        const appointmentsRes = await fetch(`/api/appointments?vet_id=${user.id}`, {
          credentials: 'include'
        })
        if (appointmentsRes.ok) {
          const data = await appointmentsRes.json()
          setAppointments(data.appointments || [])
          setRequests(data.appointments?.filter((a: any) => a.status === 'pending') || [])
        }
      } else {
        // Load owner's animals
        const animalsRes = await fetch('/api/animals/add', {
          credentials: 'include'
        })
        if (animalsRes.ok) {
          const data = await animalsRes.json()
          setAnimals(data.animals || [])
        }
        
        // Load owner's appointments
        const appointmentsRes = await fetch(`/api/appointments?user_id=${user.id}`, {
          credentials: 'include'
        })
        if (appointmentsRes.ok) {
          const data = await appointmentsRes.json()
          setAppointments(data.appointments || [])
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestAction = async (appointmentId: number, action: 'confirmed' | 'cancelled') => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: appointmentId,
          status: action
        }),
        credentials: 'include'
      })
      
      if (response.ok) {
        loadDashboardData(userInfo)
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
    }
  }

  // Calculate stats
  const stats = isVet ? {
    totalClients: new Set(appointments.map(a => a.user_id)).size,
    todayAppointments: appointments.filter(a => {
      const today = new Date().toDateString()
      return new Date(a.appointment_date).toDateString() === today
    }).length,
    completedThisWeek: appointments.filter(a => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return a.status === 'completed' && new Date(a.created_at) > weekAgo
    }).length,
    newRequests: requests.length
  } : {
    totalAnimals: animals.length,
    healthyAnimals: animals.filter(a => a.health_status === 'healthy').length,
    needsAttention: animals.filter(a => ['sick', 'critical'].includes(a.health_status)).length,
    upcomingAppointments: appointments.filter(a => 
      new Date(a.appointment_date) > new Date() && a.status !== 'cancelled'
    ).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t.welcome}, {isVet ? 'Dr.' : ''} {userInfo?.name || 'User'}!
            </h1>
            <p className="text-gray-600 text-sm mt-1">{t.overview}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const newLang = lang === 'en' ? 'rw' : 'en'
                setLang(newLang)
                localStorage.setItem('language', newLang)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              🌐 {lang === 'en' ? 'English' : 'Kinyarwanda'}
            </button>
            {isVet ? (
              <Link href="/dashboard/vet/appointments" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <i className="bi bi-calendar-week mr-2"></i>
                {t.viewSchedule}
              </Link>
            ) : (
              <Link href="/dashboard/owner/find-vets" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <i className="bi bi-plus-circle mr-2"></i>
                {t.bookAppointment}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isVet ? (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{t.totalClients}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalClients}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <i className="bi bi-people text-green-600 text-2xl"></i>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{t.todayAppointments}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todayAppointments}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <i className="bi bi-calendar-check text-blue-600 text-2xl"></i>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{t.completedVisits}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedThisWeek}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <i className="bi bi-check-circle text-purple-600 text-2xl"></i>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{t.newRequests}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.newRequests}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <i className="bi bi-bell text-yellow-600 text-2xl"></i>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{t.totalAnimals}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAnimals}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <i className="bi bi-piggy-bank text-green-600 text-2xl"></i>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{t.healthyAnimals}</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.healthyAnimals}</p>
                  </div>
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <i className="bi bi-heart-fill text-emerald-600 text-2xl"></i>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{t.needsAttention}</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">{stats.needsAttention}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-lg">
                    <i className="bi bi-exclamation-triangle text-red-600 text-2xl"></i>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{t.upcomingAppointments}</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{stats.upcomingAppointments}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <i className="bi bi-calendar-check text-blue-600 text-2xl"></i>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  {isVet ? t.todayAppointments : t.myAnimals}
                </h2>
                <Link 
                  href={isVet ? "/appointments" : "/animals"} 
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  {t.viewAll} →
                </Link>
              </div>
            </div>
            <div className="p-6">
              {isVet ? (
                appointments.filter(a => {
                  const today = new Date().toDateString()
                  return new Date(a.appointment_date).toDateString() === today
                }).length > 0 ? (
                  <div className="space-y-3">
                    {appointments.filter(a => {
                      const today = new Date().toDateString()
                      return new Date(a.appointment_date).toDateString() === today
                    }).map(apt => (
                      <div key={apt.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {new Date(apt.appointment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                            <p className="text-sm text-gray-600">
                              {apt.user_name} • {apt.animal_name} ({apt.animal_type})
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {t[apt.status]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">{t.noData}</p>
                )
              ) : (
                animals.length > 0 ? (
                  <div className="space-y-3">
                    {animals.slice(0, 5).map(animal => (
                      <div key={animal.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{animal.name}</p>
                            <p className="text-sm text-gray-600">
                              {animal.type} {animal.breed && `• ${animal.breed}`}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            animal.health_status === 'healthy' ? 'bg-green-100 text-green-700' :
                            animal.health_status === 'sick' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {t[animal.health_status] || animal.health_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">{t.noData}</p>
                )
              )}
            </div>
          </div>

          {/* Side Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {isVet ? t.pendingRequests : t.upcomingAppointments}
              </h2>
            </div>
            <div className="p-6">
              {isVet ? (
                requests.length > 0 ? (
                  <div className="space-y-3">
                    {requests.slice(0, 3).map(req => (
                      <div key={req.id} className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-900">{req.user_name}</p>
                        <p className="text-sm text-gray-600">{req.animal_name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(req.appointment_date).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <button 
                            onClick={() => handleRequestAction(req.id, 'confirmed')}
                            className="flex-1 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            {t.acceptRequest}
                          </button>
                          <button 
                            onClick={() => handleRequestAction(req.id, 'cancelled')}
                            className="flex-1 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            {t.rejectRequest}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">{t.noData}</p>
                )
              ) : (
                appointments.filter(a => 
                  new Date(a.appointment_date) > new Date() && a.status !== 'cancelled'
                ).length > 0 ? (
                  <div className="space-y-3">
                    {appointments.filter(a => 
                      new Date(a.appointment_date) > new Date() && a.status !== 'cancelled'
                    ).slice(0, 3).map(apt => (
                      <div key={apt.id} className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-900">
                          {new Date(apt.appointment_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {apt.vet_name} • {apt.animal_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(apt.appointment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">{t.noData}</p>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}