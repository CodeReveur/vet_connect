'use client'

import { useState, useEffect } from 'react'

interface MedicalRecord {
  id: number
  animal_id: number
  vet_id: number
  diagnosis: string
  treatment: string
  notes?: string
  created_at: string
  animal_name?: string
  animal_type?: string
  vet_name?: string
  vet_full_name?: string
}

interface Animal {
  id: number
  name: string
  type: string
  breed?: string
  health_status: string
}

interface RecordDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  record: MedicalRecord | null
  isVet: boolean
}

const translations = {
  en: {
    // Common
    title: "Medical Records",
    searchPlaceholder: "Search records...",
    viewDetails: "View Details",
    noRecords: "No medical records found",
    diagnosis: "Diagnosis",
    treatment: "Treatment",
    notes: "Notes",
    date: "Date",
    close: "Close",
    // Vet specific
    vetSubtitle: "Patient medical history and treatments",
    patient: "Patient",
    owner: "Owner",
    createNew: "New Record",
    editRecord: "Edit",
    filterByAnimal: "Filter by Animal",
    allAnimals: "All Animals",
    recentRecords: "Recent Records",
    totalRecords: "Total Records",
    thisWeek: "This Week",
    thisMonth: "This Month",
    // Owner specific
    ownerSubtitle: "Your animals' medical history",
    veterinarian: "Veterinarian",
    animal: "Animal",
    filterByPet: "Filter by Pet",
    allPets: "All Pets",
    downloadRecord: "Download",
    printRecord: "Print",
    healthSummary: "Health Summary",
    lastVisit: "Last Visit",
    nextCheckup: "Next Checkup"
  },
  rw: {
    // Common
    title: "Amateka y'Ubuvuzi",
    searchPlaceholder: "Shakisha raporo...",
    viewDetails: "Reba Ibisobanuro",
    noRecords: "Nta mateka y'ubuvuzi abonetse",
    diagnosis: "Uburwayi",
    treatment: "Ubuvuzi",
    notes: "Ibisobanuro",
    date: "Itariki",
    close: "Funga",
    // Vet specific
    vetSubtitle: "Amateka y'abarwayi n'ubuvuzi",
    patient: "Umurwayi",
    owner: "Nyir'itungo",
    createNew: "Raporo Nshya",
    editRecord: "Hindura",
    filterByAnimal: "Shungura ukurikije Itungo",
    allAnimals: "Amatungo Yose",
    recentRecords: "Raporo Ziheruka",
    totalRecords: "Raporo Zose",
    thisWeek: "Iki Cyumweru",
    thisMonth: "Uku Kwezi",
    // Owner specific
    ownerSubtitle: "Amateka y'ubuvuzi bw'amatungo yawe",
    veterinarian: "Muganga",
    animal: "Itungo",
    filterByPet: "Shungura ukurikije Itungo",
    allPets: "Amatungo Yose",
    downloadRecord: "Kuramo",
    printRecord: "Sohora",
    healthSummary: "Incamake y'Ubuzima",
    lastVisit: "Iheruka",
    nextCheckup: "Isuzuma Rikurikira"
  }
}

const RecordDetailsModal = ({ isOpen, onClose, record, isVet }: RecordDetailsModalProps) => {
  const [currentLang, setCurrentLang] = useState<'en' | 'rw'>('en')
  const t = translations[currentLang]

  if (!isOpen || !record) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Medical Record Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <i className="bi bi-x-lg text-xl"></i>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">{t.animal}</p>
              <p className="font-medium text-gray-900">
                {record.animal_name} ({record.animal_type})
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{isVet ? t.owner : t.veterinarian}</p>
              <p className="font-medium text-gray-900">
                {record.vet_full_name || record.vet_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{t.date}</p>
              <p className="font-medium text-gray-900">
                {new Date(record.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">{t.diagnosis}</h3>
              <p className="text-gray-700">{record.diagnosis}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">{t.treatment}</h3>
              <p className="text-gray-700">{record.treatment}</p>
            </div>

            {record.notes && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{t.notes}</h3>
                <p className="text-gray-700">{record.notes}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            {!isVet && (
              <>
                <button className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <i className="bi bi-download mr-2"></i>
                  {t.downloadRecord}
                </button>
                <button className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  <i className="bi bi-printer mr-2"></i>
                  {t.printRecord}
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className={`${!isVet ? 'flex-1' : 'w-full'} py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700`}
            >
              {t.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentLang, setCurrentLang] = useState<'en' | 'rw'>('en')
  const [searchTerm, setSearchTerm] = useState('')
  const [animalFilter, setAnimalFilter] = useState<string>('all')
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const t = translations[currentLang]
  const isVet = currentUser?.role === 'vet'

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css'
    document.head.appendChild(link)
    
    loadUserAndRecords()
    
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }, [])

  const loadUserAndRecords = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) return

      const user = JSON.parse(userData)
      setCurrentUser(user)

      if (user.role === 'vet') {
        // Vet: Get all records they created
        const response = await fetch(`/api/medical-records?vet_id=${user.id}`, {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setRecords(data.medical_records || [])
          
          // Extract unique animals
          const uniqueAnimals = new Map()
          data.medical_records.forEach((record: any) => {
            if (!uniqueAnimals.has(record.animal_id)) {
              uniqueAnimals.set(record.animal_id, {
                id: record.animal_id,
                name: record.animal_name || 'Unknown',
                type: record.animal_type || 'Unknown'
              })
            }
          })
          setAnimals(Array.from(uniqueAnimals.values()))
        }
      } else {
        // Owner: Get records for their animals
        // First get their animals
        const animalsRes = await fetch('/api/animals', {
          credentials: 'include'
        })
        if (animalsRes.ok) {
          const animalsData = await animalsRes.json()
          setAnimals(animalsData.animals || [])
          
          // Then get medical records for each animal
          const allRecords: MedicalRecord[] = []
          for (const animal of animalsData.animals) {
            const recordsRes = await fetch(`/api/medical-records?animal_id=${animal.id}`, {
              credentials: 'include'
            })
            if (recordsRes.ok) {
              const recordsData = await recordsRes.json()
              allRecords.push(...recordsData.medical_records.map((r: any) => ({
                ...r,
                animal_name: animal.name,
                animal_type: animal.type
              })))
            }
          }
          setRecords(allRecords)
        }
      }
    } catch (err) {
      console.error('Error loading records:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.treatment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.animal_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAnimal = animalFilter === 'all' || record.animal_id.toString() === animalFilter
    
    return matchesSearch && matchesAnimal
  })

  // Calculate stats
  const stats = {
    total: records.length,
    thisWeek: records.filter(r => {
      const recordDate = new Date(r.created_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return recordDate > weekAgo
    }).length,
    thisMonth: records.filter(r => {
      const recordDate = new Date(r.created_at)
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return recordDate > monthAgo
    }).length
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/20">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-gray-600 text-lg mt-1">{isVet ? t.vetSubtitle : t.ownerSubtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentLang(currentLang === 'en' ? 'rw' : 'en')}
                className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                <i className="bi bi-translate"></i>
                {currentLang === 'en' ? 'English' : 'Kinyarwanda'}
              </button>
              {isVet && (
                <button className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg">
                  <i className="bi bi-plus-circle mr-2"></i>
                  {t.createNew}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t.totalRecords}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <i className="bi bi-file-medical text-green-600 text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t.thisWeek}</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.thisWeek}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <i className="bi bi-calendar-week text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t.thisMonth}</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.thisMonth}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <i className="bi bi-calendar-month text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            
            <select
              value={animalFilter}
              onChange={(e) => setAnimalFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
            >
              <option value="all">{isVet ? t.allAnimals : t.allPets}</option>
              {animals.map(animal => (
                <option key={animal.id} value={animal.id}>
                  {animal.name} ({animal.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Records Grid */}
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <i className="bi bi-file-medical text-gray-300 text-6xl mb-4 block"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.noRecords}</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecords.map(record => (
              <div key={record.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {record.animal_name}
                      </h3>
                      <p className="text-sm text-gray-600">{record.animal_type}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(record.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t.diagnosis}</p>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {record.diagnosis}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t.treatment}</p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {record.treatment}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <i className="bi bi-person-badge"></i>
                      <span>{isVet ? 'You' : (record.vet_name || 'Veterinarian')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedRecord(record)
                      setShowDetails(true)
                    }}
                    className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                  >
                    <i className="bi bi-eye mr-2"></i>
                    {t.viewDetails}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Details Modal */}
        <RecordDetailsModal
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          record={selectedRecord}
          isVet={isVet}
        />
      </div>
    </div>
  )
}