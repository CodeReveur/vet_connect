'use client'

import { useState, useEffect } from 'react'

interface Client {
  id: number
  name: string
  email: string
  phone: string
  address?: string
  total_animals: number
  total_appointments: number
  last_appointment?: string
}

interface Animal {
  id: number
  name: string
  type: string
  breed?: string
  health_status: string
  age?: number
  weight?: number
}

interface MedicalRecordModalProps {
  isOpen: boolean
  onClose: () => void
  animal: Animal | null
  clientName: string
  vetId: number
  onSuccess: () => void
}

const translations = {
  en: {
    title: "My Clients",
    subtitle: "Manage client relationships and medical records",
    searchPlaceholder: "Search clients...",
    totalAnimals: "Animals",
    appointments: "Appointments",
    lastVisit: "Last Visit",
    viewAnimals: "View Animals",
    noClients: "No clients found",
    noClientsDesc: "Clients will appear here after appointments",
    // Animal section
    animals: "Animals",
    createRecord: "Create Record",
    viewHistory: "View History",
    healthStatus: "Health Status",
    age: "Age",
    weight: "Weight",
    years: "years",
    kg: "kg",
    // Modal
    newMedicalRecord: "New Medical Record",
    diagnosis: "Diagnosis",
    treatment: "Treatment",
    notes: "Additional Notes",
    submit: "Save Record",
    cancel: "Cancel",
    required: "This field is required",
    success: "Medical record created successfully",
    error: "Failed to create record"
  },
  rw: {
    title: "Abakiriya Banjye",
    subtitle: "Gucunga abakiriya n'amateka y'ubuvuzi",
    searchPlaceholder: "Shakisha abakiriya...",
    totalAnimals: "Amatungo",
    appointments: "Ibiganiro",
    lastVisit: "Iheruka",
    viewAnimals: "Reba Amatungo",
    noClients: "Nta bakiriya babonetse",
    noClientsDesc: "Abakiriya bazagaragara nyuma y'ibiganiro",
    // Animal section
    animals: "Amatungo",
    createRecord: "Kora Raporo",
    viewHistory: "Reba Amateka",
    healthStatus: "Ubuzima",
    age: "Imyaka",
    weight: "Uburemere",
    years: "imyaka",
    kg: "kg",
    // Modal
    newMedicalRecord: "Raporo Nshya y'Ubuvuzi",
    diagnosis: "Uburwayi",
    treatment: "Ubuvuzi",
    notes: "Ibindi bisobanuro",
    submit: "Bika Raporo",
    cancel: "Hagarika",
    required: "Iki gisabwa",
    success: "Raporo y'ubuvuzi yakozwe neza",
    error: "Byanze gukora raporo"
  }
}

const MedicalRecordModal = ({ isOpen, onClose, animal, clientName, vetId, onSuccess }: MedicalRecordModalProps) => {
  const [currentLang, setCurrentLang] = useState<'en' | 'rw'>('en')
  const [formData, setFormData] = useState({
    diagnosis: '',
    treatment: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const t = translations[currentLang]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!animal || !formData.diagnosis || !formData.treatment) {
      setError(t.required)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/medical-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animal_id: animal.id,
          vet_id: vetId,
          diagnosis: formData.diagnosis,
          treatment: formData.treatment,
          notes: formData.notes
        }),
        credentials: 'include'
      })

      if (response.ok) {
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
    setFormData({ diagnosis: '', treatment: '', notes: '' })
    setError('')
    onClose()
  }

  if (!isOpen || !animal) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{t.newMedicalRecord}</h2>
          <p className="text-gray-600 mt-1">
            {clientName} - {animal.name} ({animal.type})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.diagnosis} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.diagnosis}
                onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.treatment} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.treatment}
                onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.notes}
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows={2}
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
              {loading ? '...' : t.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function VetClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientAnimals, setClientAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [currentLang, setCurrentLang] = useState<'en' | 'rw'>('en')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null)
  const [showMedicalModal, setShowMedicalModal] = useState(false)
  const [vetId, setVetId] = useState<number>(0)

  const t = translations[currentLang]

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css'
    document.head.appendChild(link)
    
    loadVetClients()
    
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }, [])

  const loadVetClients = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) return
      
      const user = JSON.parse(userData)
      setVetId(user.id)

      // Get appointments to find unique clients
      const response = await fetch(`/api/appointments?vet_id=${user.id}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        const appointments = data.appointments || []
        
        // Extract unique clients with their animals count
        const clientMap = new Map()
        const clientAnimalsCount = new Map()
        
        appointments.forEach((apt: any) => {
          if (!clientMap.has(apt.user_id)) {
            clientMap.set(apt.user_id, {
              id: apt.user_id,
              name: apt.user_name || 'Unknown',
              email: apt.user_email || '',
              phone: apt.user_phone || '',
              total_appointments: 0,
              total_animals: 0,
              last_appointment: apt.appointment_date
            })
            clientAnimalsCount.set(apt.user_id, new Set())
          }
          
          // Count unique animals per client
          clientAnimalsCount.get(apt.user_id).add(apt.animal_id)
          
          clientMap.get(apt.user_id).total_appointments++
          
          const lastDate = new Date(clientMap.get(apt.user_id).last_appointment)
          const aptDate = new Date(apt.appointment_date)
          if (aptDate > lastDate) {
            clientMap.get(apt.user_id).last_appointment = apt.appointment_date
          }
        })
        
        // Update total animals count
        clientMap.forEach((client, clientId) => {
          client.total_animals = clientAnimalsCount.get(clientId).size
        })
        
        setClients(Array.from(clientMap.values()))
      }
    } catch (err) {
      console.error('Error loading clients:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadClientAnimals = async (clientId: number) => {
    try {
      // Since the animals endpoint uses session auth, we need to get animals through appointments
      // Get all appointments for this vet
      const response = await fetch(`/api/appointments?vet_id=${vetId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        const appointments = data.appointments || []
        
        // Filter appointments by client and extract unique animals
        const animalMap = new Map()
        appointments
          .filter((apt: any) => apt.user_id === clientId)
          .forEach((apt: any) => {
            if (!animalMap.has(apt.animal_id)) {
              animalMap.set(apt.animal_id, {
                id: apt.animal_id,
                name: apt.animal_name || 'Unknown',
                type: apt.animal_type || 'Unknown',
                breed: '',
                health_status: 'Unknown'
              })
            }
          })
        
        setClientAnimals(Array.from(animalMap.values()))
      }
    } catch (err) {
      console.error('Error loading animals:', err)
    }
  }

  const handleViewAnimals = (client: Client) => {
    setSelectedClient(client)
    loadClientAnimals(client.id)
  }

  const handleCreateRecord = (animal: Animal) => {
    setSelectedAnimal(animal)
    setShowMedicalModal(true)
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
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
              🌐 {currentLang === 'en' ? 'English' : 'Kinyarwanda'}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
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

        {/* Clients Grid */}
        {filteredClients.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <i className="bi bi-people text-gray-300 text-5xl mb-4 block"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.noClients}</h3>
            <p className="text-gray-500">{t.noClientsDesc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map(client => (
              <div key={client.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="bi bi-person-fill text-green-600 text-2xl"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{client.name}</h3>
                    <p className="text-sm text-gray-600">{client.email}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t.totalAnimals}:</span>
                    <span className="font-medium">{client.total_animals || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t.appointments}:</span>
                    <span className="font-medium">{client.total_appointments}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t.lastVisit}:</span>
                    <span className="font-medium">
                      {client.last_appointment 
                        ? new Date(client.last_appointment).toLocaleDateString()
                        : '-'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleViewAnimals(client)}
                  className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <i className="bi bi-list mr-2"></i>
                  {t.viewAnimals}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Animals Modal/Section */}
        {selectedClient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedClient.name}&apos;s {t.animals}
                  </h2>
                  <p className="text-gray-600">{selectedClient.email}</p>
                </div>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="bi bi-x-lg text-xl"></i>
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {clientAnimals.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No animals found</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clientAnimals.map(animal => (
                      <div key={animal.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{animal.name}</h4>
                            <p className="text-sm text-gray-600">
                              {animal.type} {animal.breed && `• ${animal.breed}`}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            animal.health_status === 'healthy' 
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {animal.health_status}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1 mb-3">
                          {animal.age && <p>{t.age}: {animal.age} {t.years}</p>}
                          {animal.weight && <p>{t.weight}: {animal.weight} {t.kg}</p>}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCreateRecord(animal)}
                            className="flex-1 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            <i className="bi bi-plus-circle mr-1"></i>
                            {t.createRecord}
                          </button>
                          <button className="flex-1 py-1.5 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
                            <i className="bi bi-clock-history mr-1"></i>
                            {t.viewHistory}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Medical Record Modal */}
        <MedicalRecordModal
          isOpen={showMedicalModal}
          onClose={() => setShowMedicalModal(false)}
          animal={selectedAnimal}
          clientName={selectedClient?.name || ''}
          vetId={vetId}
          onSuccess={() => {
            alert(t.success)
            setShowMedicalModal(false)
          }}
        />
      </div>
    </div>
  )
}