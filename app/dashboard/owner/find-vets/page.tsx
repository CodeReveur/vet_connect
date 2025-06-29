'use client'

import { useState, useEffect } from 'react'

interface Vet {
  id: number
  name: string
  full_name: string
  email: string
  phone: string
  profile_picture?: string
  address: string
  role: string
  created_at: string
  last_login?: string
  // Additional vet-specific fields that might be stored in profile or metadata
  specialty?: string
  clinic_name?: string
  experience_years?: number
  services?: string[]
  availability?: string[]
  rating?: number
}

interface Animal {
  id: number
  name: string
  type: string
  breed?: string
  health_status: string
}

interface Appointment {
  id: number
  user_id: number
  animal_id: number
  appointment_date: string
  created_at: string
  status: string
  payment_reference_id?: string
  payment_status: string
}

interface AppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  vet: Vet | null
  animals: Animal[]
  onSuccess: () => void
  currentUserId: number | null
}

const translations = {
  en: {
    findVets: "Find Veterinarians",
    findBestVet: "Find the best veterinary care for your animals",
    searchVets: "Search veterinarians...",
    allSpecialties: "All Specialties",
    allServices: "All Services",
    requestAppointment: "Request Appointment",
    rating: "Rating",
    experience: "years experience",
    nearYou: "Near you",
    km: "km",
    phone: "Phone",
    email: "Email",
    services: "Services",
    availability: "Availability",
    noVetsFound: "No veterinarians found. Try adjusting your search.",
    // Modal translations
    bookAppointment: "Book Appointment",
    selectAnimal: "Select Animal",
    appointmentDate: "Appointment Date & Time",
    notes: "Additional Notes",
    submit: "Submit Request",
    cancel: "Cancel",
    submitting: "Submitting...",
    required: "This field is required",
    success: "Appointment request submitted successfully!",
    error: "Failed to submit request. Please try again.",
    // Services
    generalCheckup: "General Checkup",
    vaccination: "Vaccination",
    surgery: "Surgery",
    emergency: "Emergency",
    dental: "Dental Care",
    breeding: "Breeding Consultation",
    // Status
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled"
  },
  rw: {
    findVets: "Shakisha Muganga w'itungo",
    findBestVet: "Shakisha ubuvuzi bwiza bw'itungo ryawe",
    searchVets: "Shakisha muganga w'itungo...",
    allSpecialties: "Ubumenyi bwose",
    allServices: "Serivisi zose",
    requestAppointment: "Saba Gahunda",
    rating: "Amanota",
    experience: "imyaka y'uburambe",
    nearYou: "Hafi yawe",
    km: "km",
    phone: "Telefoni",
    email: "Imeyili",
    services: "Serivisi",
    availability: "Igihe aboneka",
    noVetsFound: "Nta muganga w'itungo wabonetse. Gerageza guhindura ishakiro ryawe.",
    // Modal translations
    bookAppointment: "Gena Gahunda",
    selectAnimal: "Hitamo Itungo",
    appointmentDate: "Itariki n'igihe cy'ikibazo",
    notes: "Ibindi bisobanuro",
    submit: "Ohereza Icyifuzo",
    cancel: "Hagarika",
    submitting: "Gwohereza...",
    required: "Iki gisabwa",
    success: "Icyifuzo cy'ikibazo cyoherejwe neza!",
    error: "Byanze. Ongera ugerageze.",
    // Services
    generalCheckup: "Isuzuma rusange",
    vaccination: "Urukingo",
    surgery: "Ubuvuzi bukomeye",
    emergency: "Ihutirwa",
    dental: "Kwita ku menyo",
    breeding: "Inama z'ororoka",
    // Status
    pending: "Gutegereza",
    confirmed: "Byemejwe",
    completed: "Byarangiye",
    cancelled: "Byahagaritswe"
  }
}

const AppointmentModal = ({ isOpen, onClose, vet, animals, onSuccess, currentUserId }: AppointmentModalProps) => {
  const [currentLang, setCurrentLang] = useState<'en' | 'rw'>('en')
  const [formData, setFormData] = useState({
    animal_id: '',
    appointment_date: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const t = translations[currentLang]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.animal_id || !formData.appointment_date) {
      setError(t.required)
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUserId, // The current user's ID (animal owner)
          vet_id: vet?.id, // The vet's user ID
          animal_id: parseInt(formData.animal_id),
          appointment_date: formData.appointment_date,
          notes: formData.notes
        }),
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
        handleClose()
      } else {
        setError(data.error || t.error)
      }
    } catch (err) {
      setError(t.error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      animal_id: '',
      appointment_date: '',
      notes: ''
    })
    setError('')
    onClose()
  }

  if (!isOpen || !vet) return null

  // Get minimum date (today) and format for datetime-local input
  const today = new Date()
  const minDateTime = today.toISOString().slice(0, 16)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t.bookAppointment}</h2>
              <p className="text-gray-600">{vet.full_name || vet.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentLang(currentLang === 'en' ? 'rw' : 'en')}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <span className="text-xs">🌐</span>
                <span className="font-medium">{currentLang === 'en' ? 'English' : 'Kinyarwanda'}</span>
              </button>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <i className="bi bi-x-lg text-xl"></i>
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Select Animal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.selectAnimal} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.animal_id}
                onChange={(e) => setFormData({ ...formData, animal_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Select an animal</option>
                {animals.map(animal => (
                  <option key={animal.id} value={animal.id}>
                    {animal.name} ({animal.type}) - {animal.health_status}
                  </option>
                ))}
              </select>
            </div>

            {/* Appointment Date & Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.appointmentDate} <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                min={minDateTime}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.notes}
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Describe the issue or reason for visit..."
              />
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
              {loading ? t.submitting : t.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function FindVetsPage() {
  const [currentLang, setCurrentLang] = useState<'en' | 'rw'>('en')
  const [vets, setVets] = useState<Vet[]>([])
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVet, setSelectedVet] = useState<Vet | null>(null)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  const t = translations[currentLang]

  // Load Bootstrap Icons CSS
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css'
    document.head.appendChild(link)
    
    fetchVets()
    fetchAnimals()
    fetchCurrentUser()
    
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }, [])

  const fetchCurrentUser = async () => {
    try {
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const user= JSON.parse(userData);
            setCurrentUserId(user.id);
          } catch (error) {
            console.error('Error parsing user info:', error);
          }
        } 
    } catch (err) {
      console.error('Failed to fetch current user:', err)
    }
  }

  const fetchVets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setVets(data.vets || [])
      } else {
        setError('Failed to fetch veterinarians')
      }
    } catch (err) {
      setError('Failed to fetch veterinarians')
    } finally {
      setLoading(false)
    }
  }

  const fetchAnimals = async () => {
    try {
      const response = await fetch('/api/animals/add', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setAnimals(data.animals || [])
      }
    } catch (err) {
      console.error('Failed to fetch animals:', err)
    }
  }

  const getFilteredVets = () => {
    return vets.filter(vet => {
      const matchesSearch = (vet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vet.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vet.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vet.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vet.clinic_name?.toLowerCase().includes(searchTerm.toLowerCase()))
      
      return matchesSearch
    })
  }

  const handleRequestAppointment = (vet: Vet) => {
    setSelectedVet(vet)
    setShowAppointmentModal(true)
  }
  const vetsBefore = getFilteredVets();
  const getOnlyVets = vetsBefore.filter((n) => n.role === 'vet');
  const filteredVets = getOnlyVets;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`bi ${i < Math.floor(rating) ? 'bi-star-fill' : 'bi-star'} text-yellow-400`}
      ></i>
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.findVets}</h1>
              <p className="text-gray-600">{t.findBestVet}</p>
            </div>
            <button
              onClick={() => setCurrentLang(currentLang === 'en' ? 'rw' : 'en')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <span className="text-sm">🌐</span>
              <span className="font-medium">{currentLang === 'en' ? 'English' : 'Kinyarwanda'}</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative">
            <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder={t.searchVets}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Vets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVets.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              {t.noVetsFound}
            </div>
          ) : (
            filteredVets.map((vet) => (
              <div key={vet.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
                    {vet.profile_picture ? (
                      <img 
                        src={vet.profile_picture} 
                        alt={vet.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <i className="bi bi-person-fill text-green-600 text-2xl"></i>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{vet.full_name || vet.name}</h3>
                    <p className="text-gray-600 text-sm">{vet.specialty || 'Veterinarian'}</p>
                    {vet.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        {renderStars(vet.rating)}
                        <span className="text-sm text-gray-600 ml-2">{vet.rating}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {vet.clinic_name && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <i className="bi bi-building"></i>
                      <span>{vet.clinic_name}</span>
                    </div>
                  )}
                  {vet.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <i className="bi bi-geo-alt"></i>
                      <span>{vet.address}</span>
                    </div>
                  )}
                  {vet.experience_years && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <i className="bi bi-clock"></i>
                      <span>{vet.experience_years} {t.experience}</span>
                    </div>
                  )}
                </div>

                {vet.services && vet.services.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{t.services}:</h4>
                    <div className="flex flex-wrap gap-1">
                      {vet.services.map(service => (
                        <span key={service} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                          {t[service as keyof typeof t] || service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <i className="bi bi-telephone"></i>
                    <span>{vet.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <i className="bi bi-envelope"></i>
                    <span>{vet.email}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRequestAppointment(vet)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <i className="bi bi-calendar-plus"></i>
                  {t.requestAppointment}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        vet={selectedVet}
        animals={animals}
        onSuccess={() => {
          // Handle success - maybe show a success message
          alert(translations[currentLang].success)
        }}
        currentUserId={currentUserId}
      />
    </div>
  )
}