'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Stats {
  totalUsers: number
  totalVets: number
  totalOwners: number
  totalAppointments: number
  pendingAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  totalAnimals: number
  totalMedicalRecords: number
  totalMessages: number
  unreadMessages: number
}

interface RecentActivity {
  id: string
  type: 'appointment' | 'user' | 'animal' | 'message'
  description: string
  timestamp: string
  status?: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

interface Appointment {
  id: string
  status: string
  scheduledDate: string
  veterinarian: { name: string }
  owner: { name: string }
  animal: { name: string }
}

const translations = {
  en: {
    title: "Admin Dashboard",
    subtitle: "Comprehensive System Overview and Management",
    users: "Total Users",
    veterinarians: "Veterinarians",
    animalOwners: "Animal Owners",
    appointments: "Total Appointments",
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
    animals: "Animals",
    medicalRecords: "Medical Records",
    messages: "Messages",
    unreadMessages: "Unread Messages",
    manageUsers: "Manage Users",
    manageAppointments: "Manage Appointments",
    manageAnimals: "Manage Animals",
    viewMessages: "View Messages",
    recentActivity: "Recent Activity",
    systemStats: "System Statistics",
    quickActions: "Quick Actions",
    viewAll: "View All",
    today: "Today",
    thisWeek: "This Week",
    thisMonth: "This Month",
    loading: "Loading dashboard data...",
    error: "Error loading data",
    retry: "Retry",
    noActivity: "No recent activity",
    lastUpdated: "Last updated",
    refreshData: "Refresh Data"
  },
  rw: {
    title: "Ikibanza cy'Umuyobozi",
    subtitle: "Irebera Ryuzuye rya Sisitemu n'Ubuyobozi",
    users: "Abakoresha Bose",
    veterinarians: "Abaganga b'amatungo",
    animalOwners: "Ba nyir'amatungo",
    appointments: "Ibiganiro Byose",
    pending: "Bitegereje",
    completed: "Byarangiye",
    cancelled: "Byahagaritswe",
    animals: "Amatungo",
    medicalRecords: "Inyandiko z'Ubuvuzi",
    messages: "Ubutumwa",
    unreadMessages: "Ubutumwa Butasomwe",
    manageUsers: "Gucunga Abakoresha",
    manageAppointments: "Gucunga Ibiganiro",
    manageAnimals: "Gucunga Amatungo",
    viewMessages: "Reba Ubutumwa",
    recentActivity: "Ibikorwa Biheruka",
    systemStats: "Imibare ya Sisitemu",
    quickActions: "Ibikorwa Byihuse",
    viewAll: "Reba Byose",
    today: "Uyu munsi",
    thisWeek: "Iki cyumweru",
    thisMonth: "Uku kwezi",
    loading: "Gushaka amakuru...",
    error: "Ikosa mu gushaka amakuru",
    retry: "Ongera ugerageze",
    noActivity: "Nta bikorwa biheruka",
    lastUpdated: "Byavuguruwe bwa nyuma",
    refreshData: "Vugurura Amakuru"
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalVets: 0,
    totalOwners: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalAnimals: 0,
    totalMedicalRecords: 0,
    totalMessages: 0,
    unreadMessages: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentLang, setCurrentLang] = useState<'en' | 'rw'>('en')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  const t = translations[currentLang]

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css'
    document.head.appendChild(link)
    
    // Check admin authentication
    try {
      const userData = localStorage.getItem('user')
      if (!userData) {
        window.location.assign("/login")
        return
      }

      const user = JSON.parse(userData)
      if (user.role !== 'admin') {
        window.location.assign("/login")
        return
      }
    } catch (err) {
      console.error('Error checking authentication:', err)
      window.location.assign("/login")
      return
    }

    loadDashboardData()
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000)
    
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
      clearInterval(interval)
    }
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [usersRes, appointmentsRes, animalsRes, medicalRecordsRes, messagesRes] = await Promise.all([
        fetch('/api/users', { credentials: 'include' }),
        fetch('/api/appointments', { credentials: 'include' }),
        fetch('/api/animals/add', { credentials: 'include' }),
        fetch('/api/medical-records', { credentials: 'include' }),
        fetch('/api/messages', { credentials: 'include' })
      ])

      // Parse responses
      const usersData = await usersRes.json()
      const appointmentsData = await appointmentsRes.json()
      const animalsData = await animalsRes.json()
      const medicalRecordsData = await medicalRecordsRes.json()
      const messagesData = await messagesRes.json()

      // Process users data
      const allUsers = usersData.users || usersData.vets || []
      const vets = allUsers.filter((user: User) => user.role === 'veterinarian' || user.role === 'vet')
      const owners = allUsers.filter((user: User) => user.role === 'owner' || user.role === 'animal_owner')

      // Process appointments data
      const appointments = appointmentsData.appointments || []
      const pendingAppointments = appointments.filter((a: any) => a.status === 'pending')
      const completedAppointments = appointments.filter((a: any) => a.status === 'completed')
      const cancelledAppointments = appointments.filter((a: any) => a.status === 'cancelled')

      // Process other data
      const animals = animalsData.animals || []
      const medicalRecords = medicalRecordsData.records || []
      const messages = messagesData.messages || []
      const unreadMessages = messages.filter((m: any) => !m.read || m.status === 'unread')

      // Update stats
      setStats({
        totalUsers: allUsers.length,
        totalVets: vets.length,
        totalOwners: owners.length,
        totalAppointments: appointments.length,
        pendingAppointments: pendingAppointments.length,
        completedAppointments: completedAppointments.length,
        cancelledAppointments: cancelledAppointments.length,
        totalAnimals: animals.length,
        totalMedicalRecords: medicalRecords.length,
        totalMessages: messages.length,
        unreadMessages: unreadMessages.length
      })

      // Generate recent activity
      const activity: RecentActivity[] = []
      
      // Recent appointments
      appointments
        .sort((a: any, b: any) => new Date(b.createdAt || b.scheduledDate).getTime() - new Date(a.createdAt || a.scheduledDate).getTime())
        .slice(0, 3)
        .forEach((apt: Appointment) => {
          activity.push({
            id: apt.id,
            type: 'appointment',
            description: `New appointment scheduled with ${apt.veterinarian?.name || 'veterinarian'} for ${apt.animal?.name || 'animal'}`,
            timestamp: apt.scheduledDate,
            status: apt.status
          })
        })

      // Recent users
      allUsers
        .sort((a: User, b: User) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 2)
        .forEach((user: User) => {
          activity.push({
            id: user.id,
            type: 'user',
            description: `New ${user.role} registered: ${user.name}`,
            timestamp: user.createdAt
          })
        })

      // Recent messages
      messages
        .sort((a: any, b: any) => new Date(b.createdAt || b.timestamp).getTime() - new Date(a.createdAt || a.timestamp).getTime())
        .slice(0, 2)
        .forEach((msg: any) => {
          activity.push({
            id: msg.id,
            type: 'message',
            description: `New message from ${msg.sender?.name || 'user'}`,
            timestamp: msg.createdAt || msg.timestamp
          })
        })

      // Sort activity by timestamp
      activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setRecentActivity(activity.slice(0, 8))
      
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(currentLang === 'en' ? 'en-US' : 'rw-RW', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment': return 'bi bi-calendar-plus'
      case 'user': return 'bi bi-person-plus'
      case 'animal': return 'bi bi-heart'
      case 'message': return 'bi bi-chat-dots'
      default: return 'bi bi-activity'
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pending': return 'text-amber-600 bg-amber-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  if (loading && stats.totalUsers === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm">
          <i className="bi bi-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t.error}</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <i className="bi bi-arrow-clockwise mr-2"></i>
            {t.retry}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-gray-600 mt-1">{t.subtitle}</p>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-1">
                {t.lastUpdated}: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <i className={`bi bi-arrow-clockwise mr-2 ${loading ? 'animate-spin' : ''}`}></i>
              {t.refreshData}
            </button>
            <button
              onClick={() => setCurrentLang(currentLang === 'en' ? 'rw' : 'en')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <i className="bi bi-translate mr-2"></i>
              {currentLang === 'en' ? 'English' : 'Kinyarwanda'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t.users}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.totalVets} vets, {stats.totalOwners} owners
                </p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <i className="bi bi-people-fill text-blue-600 text-2xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t.appointments}</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalAppointments}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.pendingAppointments} pending
                </p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <i className="bi bi-calendar-check text-green-600 text-2xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t.animals}</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalAnimals}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.totalMedicalRecords} medical records
                </p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <i className="bi bi-heart-fill text-purple-600 text-2xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t.messages}</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalMessages}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.unreadMessages} unread
                </p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <i className="bi bi-chat-dots-fill text-blue-600 text-2xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t.pending}</p>
                <p className="text-2xl font-bold text-amber-600 mt-2">{stats.pendingAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <i className="bi bi-clock-history text-amber-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t.completed}</p>
                <p className="text-2xl font-bold text-green-600 mt-2">{stats.completedAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="bi bi-check-circle text-green-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t.cancelled}</p>
                <p className="text-2xl font-bold text-red-600 mt-2">{stats.cancelledAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="bi bi-x-circle text-red-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.quickActions}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/dashboard/admin/users" className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{t.manageUsers}</h3>
                    <p className="text-gray-600 text-sm">Add, edit, and manage system users</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
                    <i className="bi bi-people-fill text-xl"></i>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/admin/appointments" className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{t.manageAppointments}</h3>
                    <p className="text-gray-600 text-sm">View and manage all appointments</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                    <i className="bi bi-calendar-week text-xl"></i>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/admin/animals" className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{t.manageAnimals}</h3>
                    <p className="text-gray-600 text-sm">Manage animal records and profiles</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white">
                    <i className="bi bi-heart-fill text-xl"></i>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/admin/messages" className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{t.viewMessages}</h3>
                    <p className="text-gray-600 text-sm">View and respond to messages</p>
                    {stats.unreadMessages > 0 && (
                      <span className="inline-block bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full mt-1">
                        {stats.unreadMessages} unread
                      </span>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center text-white">
                    <i className="bi bi-chat-dots-fill text-xl"></i>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.recentActivity}</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              {recentActivity.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className={`${getActivityIcon(activity.type)} text-gray-600 text-sm`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {activity.description}
                          </p>
                          <div className="flex items-center space-x-2">
                            <p className="text-xs text-gray-500">
                              {formatDate(activity.timestamp)}
                            </p>
                            {activity.status && (
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
                                {activity.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <i className="bi bi-activity text-2xl mb-2"></i>
                  <p>{t.noActivity}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}