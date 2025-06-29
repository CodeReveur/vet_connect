'use client'

import AddAnimalModal from '@/app/components/dash/animalModal'
import { useEffect, useState } from 'react'

interface Animal {
  id: number
  user_id: number
  name: string
  type: string
  breed?: string
  age?: number
  weight?: number
  health_status: string
  created_at: string
  last_checkup?: string
  next_vaccination?: string
  microchip_id?: string
  gender?: string
  profile_picture?: string
}

interface MedicalRecord {
  id: number
  animal_id: number
  vet_id: number
  diagnosis: string
  treatment: string
  notes?: string
  created_at: string
  vet_name?: string
  vet_full_name?: string
}

interface Appointment {
  id: number
  animal_id: number
  appointment_date: string
  status: string
  vet_name?: string
}

const translations = {
  en: {
    title: "My Animals",
    subtitle: "Comprehensive health records for your animals",
    addAnimal: "Add New Animal",
    searchPlaceholder: "Search animals...",
    // Animal details
    basicInfo: "Basic Information",
    medicalHistory: "Medical History",
    appointments: "Appointments",
    type: "Type",
    breed: "Breed",
    age: "Age",
    weight: "Weight",
    gender: "Gender",
    healthStatus: "Health Status",
    microchipId: "Microchip ID",
    lastCheckup: "Last Checkup",
    nextVaccination: "Next Vaccination",
    years: "years",
    kg: "kg",
    // Medical records
    diagnosis: "Diagnosis",
    treatment: "Treatment",
    veterinarian: "Veterinarian",
    date: "Date",
    notes: "Notes",
    noMedicalRecords: "No medical records yet",
    // Actions
    editAnimal: "Edit",
    deleteAnimal: "Delete",
    viewDetails: "View Details",
    bookAppointment: "Book Appointment",
    addMedicalRecord: "Add Medical Record",
    // Status
    healthy: "Healthy",
    sick: "Sick",
    recovering: "Recovering",
    critical: "Critical",
    vaccinated: "Vaccinated",
    pregnant: 'Pregnant',
    // Animal types
    cow: "Cow",
    goat: "Goat",
    sheep: "Sheep",
    pig: "Pig",
    chicken: "Chicken",
    dog: "Dog",
    cat: "Cat",
    rabbit: "Rabbit",
    horse: "Horse",
    // Gender
    male: "Male",
    female: "Female",
    // Filters
    allTypes: "All Types",
    allStatuses: "All Statuses",
    sortBy: "Sort by",
    newest: "Newest",
    oldest: "Oldest",
    name: "Name",
    // Empty state
    noAnimals: "No animals registered yet",
    noAnimalsDesc: "Start by adding your first animal to track their health",
    // Stats
    totalAnimals: "Total Animals",
    healthyAnimals: "Healthy",
    sickAnimals: "Need Attention",
    upcomingAppointments: "Upcoming Appointments"
  },
  rw: {
    title: "Amatungo Yanjye",
    subtitle: "Amateka y'ubuzima bw'amatungo yawe",
    addAnimal: "Ongeraho Itungo",
    searchPlaceholder: "Shakisha itungo...",
    // Animal details
    basicInfo: "Amakuru y'ibanze",
    medicalHistory: "Amateka y'ubuvuzi",
    appointments: "Ibiganiro",
    type: "Ubwoko",
    breed: "Ubwoko bwihariye",
    age: "Imyaka",
    weight: "Uburemere",
    gender: "Igitsina",
    healthStatus: "Imiterere y'ubuzima",
    microchipId: "Nimero ya Microchip",
    lastCheckup: "Isuzuma rya nyuma",
    nextVaccination: "Urukingo rukurikira",
    years: "imyaka",
    kg: "kg",
    // Medical records
    diagnosis: "Uburwayi",
    treatment: "Ubuvuzi",
    veterinarian: "Muganga",
    date: "Itariki",
    notes: "Ibisobanuro",
    noMedicalRecords: "Nta mateka y'ubuvuzi ahari",
    // Actions
    editAnimal: "Hindura",
    deleteAnimal: "Siba",
    viewDetails: "Reba Ibisobanuro",
    bookAppointment: "Gena Igihe",
    addMedicalRecord: "Ongeraho Raporo",
    // Status
    healthy: "Afite ubuzima bwiza",
    sick: "Ararwaye",
    recovering: "Arakira",
    critical: "Arakomeye",
    vaccinated: "Yakingiwe",
    pregnant: 'Yiteguye kubyara',
    // Animal types
    cow: "Inka",
    goat: "Ihene",
    sheep: "Intama",
    pig: "Ingurube",
    chicken: "Inkoko",
    dog: "Imbwa",
    cat: "Injangwe",
    rabbit: "Urukwavu",
    horse: "Ifarashi",
    // Gender
    male: "Gabo",
    female: "Gore",
    // Filters
    allTypes: "Ubwoko bwose",
    allStatuses: "Imiterere yose",
    sortBy: "Shungura",
    newest: "Ibishya",
    oldest: "Ibishaje",
    name: "Izina",
    // Empty state
    noAnimals: "Nta matungo wanditse",
    noAnimalsDesc: "Tangira wongereho itungo rya mbere kugira ngo ukurikirane ubuzima bwaryo",
    // Stats
    totalAnimals: "Amatungo yose",
    healthyAnimals: "Afite ubuzima bwiza",
    sickAnimals: "Akeneye ubuvuzi",
    upcomingAppointments: "Ibiganiro biri imbere"
  }
}

export default function AnimalRecordsPage() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [medicalRecords, setMedicalRecords] = useState<{ [key: number]: MedicalRecord[] }>({})
  const [appointments, setAppointments] = useState<{ [key: number]: Appointment[] }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentLang, setCurrentLang] = useState<'en' | 'rw'>('en')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showMedicalHistory, setShowMedicalHistory] = useState<number | null>(null)

  const t = translations[currentLang]

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css'
    document.head.appendChild(link)
    
    fetchAnimalsData()
    
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }, [])

  const fetchAnimalsData = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) return

      const user = JSON.parse(userData)

      // Fetch animals
      const animalsResponse = await fetch('/api/animals/add', {
        credentials: 'include',
      })

      if (animalsResponse.ok) {
        const data = await animalsResponse.json()
        setAnimals(data.animals || [])
        
        // Fetch medical records for each animal
        for (const animal of data.animals) {
          fetchMedicalRecords(animal.id)
          fetchAppointments(animal.id)
        }
      } else {
        setError('Failed to load animals')
      }
    } catch (err) {
      setError('Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const fetchMedicalRecords = async (animalId: number) => {
    try {
      const response = await fetch(`/api/medical-records?animal_id=${animalId}`, {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        setMedicalRecords(prev => ({
          ...prev,
          [animalId]: data.medical_records || []
        }))
      }
    } catch (err) {
      console.error('Error fetching medical records:', err)
    }
  }

  const fetchAppointments = async (animalId: number) => {
    try {
      const response = await fetch(`/api/appointments?animal_id=${animalId}`, {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        setAppointments(prev => ({
          ...prev,
          [animalId]: data.appointments || []
        }))
      }
    } catch (err) {
      console.error('Error fetching appointments:', err)
    }
  }

  const getAnimalIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      cow: '🐄',
      goat: '🐐',
      sheep: '🐑',
      pig: '🐷',
      chicken: '🐔',
      dog: '🐕',
      cat: '🐈',
      rabbit: '🐰',
      horse: '🐎'
    }
    return icons[type.toLowerCase()] || '🐾'
  }

  const getHealthStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'sick': return 'bg-red-50 text-red-700 border-red-200'
      case 'recovering': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'critical': return 'bg-red-100 text-red-800 border-red-300'
      case 'vaccinated': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'pregnant': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getHealthStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': return 'bi-heart-fill'
      case 'sick': return 'bi-exclamation-triangle-fill'
      case 'recovering': return 'bi-arrow-clockwise'
      case 'critical': return 'bi-exclamation-octagon-fill'
      case 'vaccinated': return 'bi-shield-check'
      case 'pregnant': return 'bi-exclamation-octagon-fill'
      default: return 'bi-question-circle'
    }
  }

  const filteredAndSortedAnimals = animals
    .filter(animal => {
      const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          animal.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          animal.breed?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = typeFilter === 'all' || animal.type.toLowerCase() === typeFilter
      const matchesStatus = statusFilter === 'all' || animal.health_status.toLowerCase() === statusFilter.toLowerCase()
      
      return matchesSearch && matchesType && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'name': return a.name.localeCompare(b.name)
        default: return 0
      }
    })

  // Calculate stats
  const stats = {
    total: animals.length,
    healthy: animals.filter(a => a.health_status.toLowerCase() === 'healthy').length,
    sick: animals.filter(a => ['sick', 'critical'].includes(a.health_status.toLowerCase())).length,
    appointments: Object.values(appointments).flat().filter(a => 
      new Date(a.appointment_date) > new Date() && a.status !== 'cancelled'
    ).length
  }

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
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentLang(currentLang === 'en' ? 'rw' : 'en')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-all"
              >
                <i className="bi bi-translate text-lg"></i>
                <span className="font-medium">{currentLang === 'en' ? 'English' : 'Kinyarwanda'}</span>
              </button>
              <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-medium" onClick={() => setShowAddModal(true)}>
                <i className="bi bi-plus-circle"></i>
                {t.addAnimal}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{t.totalAnimals}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <i className="bi bi-piggy-bank text-green-600 text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{t.healthyAnimals}</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.healthy}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center">
                <i className="bi bi-heart-fill text-emerald-600 text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{t.sickAnimals}</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.sick}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center">
                <i className="bi bi-exclamation-triangle text-red-600 text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{t.upcomingAppointments}</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.appointments}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                <i className="bi bi-calendar-check text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm font-medium"
            >
              <option value="all">{t.allTypes}</option>
              {['cow', 'goat', 'sheep', 'pig', 'chicken', 'dog', 'cat', 'rabbit', 'horse'].map(type => (
                <option key={type} value={type}>{t[type as keyof typeof t]}</option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm font-medium"
            >
              <option value="all">{t.allStatuses}</option>
              {['healthy', 'sick', 'recovering', 'critical', 'vaccinated'].map(status => (
                <option key={status} value={status}>{t[status as keyof typeof t]}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm font-medium"
            >
              <option value="newest">{t.sortBy}: {t.newest}</option>
              <option value="oldest">{t.sortBy}: {t.oldest}</option>
              <option value="name">{t.sortBy}: {t.name}</option>
            </select>
          </div>
        </div>

        {/* Animals Grid */}
        {filteredAndSortedAnimals.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="bi bi-plus-square text-green-600 text-4xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.noAnimals}</h3>
              <p className="text-gray-500 mb-8">{t.noAnimalsDesc}</p>
              <button className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all font-medium">
                <i className="bi bi-plus-circle"></i>
                {t.addAnimal}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedAnimals.map((animal) => (
              <div key={animal.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                {/* Card Header with Animal Image/Icon */}
                <div className="h-48 bg-gradient-to-br from-green-500 to-emerald-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getHealthStatusStyles(animal.health_status)}`}>
                      <i className={`bi ${getHealthStatusIcon(animal.health_status)}`}></i>
                      {t[animal.health_status.toLowerCase() as keyof typeof t] || animal.health_status}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-5xl mb-2">{getAnimalIcon(animal.type)}</div>
                    <h3 className="text-2xl font-bold">{animal.name}</h3>
                    <p className="text-green-100">{t[animal.type.toLowerCase() as keyof typeof t]} {animal.breed && `• ${animal.breed}`}</p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Basic Info Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-gray-500 text-sm">{t.age}</p>
                      <p className="font-medium text-gray-900">{animal.age || '-'} {animal.age && t.years}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">{t.weight}</p>
                      <p className="font-medium text-gray-900">{animal.weight || '-'} {animal.weight && t.kg}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">{t.gender}</p>
                      <p className="font-medium text-gray-900">{animal.gender ? t[animal.gender.toLowerCase() as keyof typeof t] : '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">{t.microchipId}</p>
                      <p className="font-medium text-gray-900 text-xs">{animal.microchip_id || '-'}</p>
                    </div>
                  </div>

                  {/* Medical Summary */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{t.medicalHistory}</h4>
                      <button
                        onClick={() => setShowMedicalHistory(showMedicalHistory === animal.id ? null : animal.id)}
                        className="text-sm text-green-600 hover:text-green-700"
                      >
                        {showMedicalHistory === animal.id ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    
                    {showMedicalHistory === animal.id && (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {medicalRecords[animal.id]?.length > 0 ? (
                          medicalRecords[animal.id].slice(0, 3).map((record, index) => (
                            <div key={record.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                              <div className="flex justify-between items-start mb-1">
                                <p className="font-medium text-gray-900">{record.diagnosis}</p>
                                <p className="text-xs text-gray-500">{new Date(record.created_at).toLocaleDateString()}</p>
                              </div>
                              <p className="text-gray-600 text-xs">{record.treatment}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">{t.noMedicalRecords}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
                    <div className="flex items-center gap-1">
                      <i className="bi bi-calendar-check text-green-600"></i>
                      <span>{appointments[animal.id]?.filter(a => a.status === 'pending').length || 0} appointments</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <i className="bi bi-file-medical text-blue-600"></i>
                      <span>{medicalRecords[animal.id]?.length || 0} records</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showAddModal && <AddAnimalModal isOpen={showAddModal} onClose={() => setShowAddModal(!showAddModal)} onSuccess={() => {}} />}
    </div>
  )
}