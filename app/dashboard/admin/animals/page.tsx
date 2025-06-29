'use client'
import { useState, useEffect } from 'react'

interface Animal {
  id: number
  name: string
  type: string
  breed?: string
  gender?: string
  birth_date?: string
  identification_number?: string
  color?: string
  weight?: number
  health_status: string
  notes?: string
  owner_id: number
  owner_name?: string
  owner_email?: string
  created_at: string
  updated_at?: string
}

interface AnimalModalProps {
  isOpen: boolean
  onClose: () => void
  animal: Animal | null
  mode: 'add' | 'edit'
  onSuccess: () => void
}

const translations = {
  en: {
    title: "Animal Management",
    subtitle: "Manage all animals in the system",
    searchPlaceholder: "Search animals...",
    addAnimal: "Add Animal",
    editAnimal: "Edit Animal",
    deleteAnimal: "Delete Animal",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    // Form fields
    name: "Animal Name",
    type: "Animal Type",
    breed: "Breed",
    gender: "Gender",
    birthDate: "Birth Date",
    idNumber: "ID Number",
    color: "Color",
    weight: "Weight (kg)",
    healthStatus: "Health Status",
    notes: "Notes",
    owner: "Owner",
    // Animal types
    cow: "Cow",
    goat: "Goat",
    sheep: "Sheep",
    pig: "Pig",
    chicken: "Chicken",
    other: "Other",
    // Gender
    male: "Male",
    female: "Female",
    // Health status
    healthy: "Healthy",
    sick: "Sick",
    injured: "Injured",
    recovering: "Recovering",
    // Table
    actions: "Actions",
    added: "Added",
    lastUpdated: "Last Updated",
    status: "Status",
    // Messages
    confirmDelete: "Are you sure you want to delete this animal?",
    animalAdded: "Animal added successfully",
    animalUpdated: "Animal updated successfully",
    animalDeleted: "Animal deleted successfully",
    error: "An error occurred",
    required: "Required fields are missing",
    loading: "Loading...",
    noAnimals: "No animals found"
  },
  rw: {
    title: "Gucunga Itungo",
    subtitle: "Gucunga itungo ryose muri sisitemu",
    searchPlaceholder: "Shakisha itungo...",
    addAnimal: "Ongeraho Itungo",
    editAnimal: "Hindura Itungo",
    deleteAnimal: "Siba Itungo",
    cancel: "Hagarika",
    save: "Bika",
    delete: "Siba",
    // Form fields
    name: "Izina ry'itungo",
    type: "Ubwoko bw'itungo",
    breed: "Ubwoko",
    gender: "Igitsina",
    birthDate: "Italiki y'amavuko",
    idNumber: "Nomero y'irangamuntu",
    color: "Ibara",
    weight: "Uburemere (kg)",
    healthStatus: "Ubuzima",
    notes: "Ibisobanuro",
    owner: "Nyir'itungo",
    // Animal types
    cow: "Inka",
    goat: "Ihene",
    sheep: "Intama",
    pig: "Ingurube",
    chicken: "Inkoko",
    other: "Ikindi",
    // Gender
    male: "Gabo",
    female: "Gore",
    // Health status
    healthy: "Muzima",
    sick: "Urwaye",
    injured: "Yakomeretse",
    recovering: "Yakira",
    // Table
    actions: "Ibikorwa",
    added: "Byongeyeho",
    lastUpdated: "Byahinduwe",
    status: "Imiterere",
    // Messages
    confirmDelete: "Uremeza ko ushaka gusiba iri tungo?",
    animalAdded: "Itungo ryongeyeho neza",
    animalUpdated: "Itungo ryahinduwe neza",
    animalDeleted: "Itungo ryasibye neza",
    error: "Habaye ikosa",
    required: "Ibisabwa ntibuzuye",
    loading: "Biragenda...",
    noAnimals: "Nta tungo tubonetse"
  }
}

const AnimalModal = ({ isOpen, onClose, animal, mode, onSuccess }: AnimalModalProps) => {
  const [currentLang, setCurrentLang] = useState<'en' | 'rw'>('en')
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    breed: '',
    gender: '',
    birthDate: '',
    idNumber: '',
    color: '',
    weight: '',
    healthStatus: 'healthy',
    notes: '',
    owner_id: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [owners, setOwners] = useState<Array<{id: number, name: string, email: string}>>([])

  const t = translations[currentLang]

  useEffect(() => {
    if (animal && mode === 'edit') {
      setFormData({
        name: animal.name || '',
        type: animal.type || '',
        breed: animal.breed || '',
        gender: animal.gender || '',
        birthDate: animal.birth_date ? animal.birth_date.split('T')[0] : '',
        idNumber: animal.identification_number || '',
        color: animal.color || '',
        weight: animal.weight ? animal.weight.toString() : '',
        healthStatus: animal.health_status || 'healthy',
        notes: animal.notes || '',
        owner_id: animal.owner_id.toString()
      })
    }
    
    // Load owners for dropdown
    loadOwners()
  }, [animal, mode])

  const loadOwners = async () => {
    try {
      const response = await fetch('/api/users', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setOwners(data.vets || [])
      }
    } catch (err) {
      console.error('Error loading owners:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.type || !formData.owner_id) {
      setError(t.required)
      return
    }

    setLoading(true)
    
    try {
      const endpoint = '/api/animals/add'
      const method = mode === 'add' ? 'POST' : 'PUT'
      
      const payload = {
        ...(mode === 'edit' && { id: animal?.id }),
        name: formData.name,
        type: formData.type,
        breed: formData.breed || null,
        gender: formData.gender || null,
        birthDate: formData.birthDate || null,
        idNumber: formData.idNumber || null,
        color: formData.color || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        healthStatus: formData.healthStatus,
        notes: formData.notes || null,
        owner_id: parseInt(formData.owner_id)
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred')
      }

      alert(mode === 'add' ? t.animalAdded : t.animalUpdated)
      onSuccess()
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      type: '',
      breed: '',
      gender: '',
      birthDate: '',
      idNumber: '',
      color: '',
      weight: '',
      healthStatus: 'healthy',
      notes: '',
      owner_id: ''
    })
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'add' ? t.addAnimal : t.editAnimal}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.name} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.type} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select type</option>
                <option value="cow">{t.cow}</option>
                <option value="goat">{t.goat}</option>
                <option value="sheep">{t.sheep}</option>
                <option value="pig">{t.pig}</option>
                <option value="chicken">{t.chicken}</option>
                <option value="other">{t.other}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.owner} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.owner_id}
                onChange={(e) => setFormData({...formData, owner_id: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select owner</option>
                {owners.map(owner => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.breed}
              </label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => setFormData({...formData, breed: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.gender}
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select gender</option>
                <option value="male">{t.male}</option>
                <option value="female">{t.female}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.birthDate}
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.idNumber}
              </label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.color}
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.weight}
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.healthStatus}
              </label>
              <select
                value={formData.healthStatus}
                onChange={(e) => setFormData({...formData, healthStatus: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="healthy">{t.healthy}</option>
                <option value="sick">{t.sick}</option>
                <option value="injured">{t.injured}</option>
                <option value="recovering">{t.recovering}</option>
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.notes}
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? t.loading : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminAnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [currentLang, setCurrentLang] = useState<'en' | 'rw'>('en')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [healthFilter, setHealthFilter] = useState('all')
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [showModal, setShowModal] = useState(false)

  const t = translations[currentLang]

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) return

      const user = JSON.parse(userData)
      if (user.role !== 'admin') {
        window.location.assign('/login')
      }
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
    loadAnimals()
  }, [])

  const loadAnimals = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/animals/add', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnimals(data.animals || [])
      } else {
        console.error('Failed to load animals')
      }
    } catch (err) {
      console.error('Error loading animals:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (animal: Animal) => {
    setSelectedAnimal(animal)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleDelete = async (animal: Animal) => {
    if (confirm(t.confirmDelete)) {
      try {
        const response = await fetch(`/api/animals/add?id=${animal.id}`, {
          method: 'DELETE',
          credentials: 'include'
        })

        if (response.ok) {
          alert(t.animalDeleted)
          loadAnimals()
        } else {
          const data = await response.json()
          alert(data.error || t.error)
        }
      } catch (err) {
        console.error('Error deleting animal:', err)
        alert(t.error)
      }
    }
  }

  const handleAdd = () => {
    setSelectedAnimal(null)
    setModalMode('add')
    setShowModal(true)
  }

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = 
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.owner_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || animal.type === typeFilter
    const matchesHealth = healthFilter === 'all' || animal.health_status === healthFilter
    
    return matchesSearch && matchesType && matchesHealth
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      cow: t.cow,
      goat: t.goat,
      sheep: t.sheep,
      pig: t.pig,
      chicken: t.chicken,
      other: t.other
    }
    return typeMap[type] || type
  }

  const formatHealthStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      healthy: t.healthy,
      sick: t.sick,
      injured: t.injured,
      recovering: t.recovering
    }
    return statusMap[status] || status
  }

  const getHealthColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      healthy: 'bg-green-100 text-green-800',
      sick: 'bg-red-100 text-red-800',
      injured: 'bg-orange-100 text-orange-800',
      recovering: 'bg-blue-100 text-blue-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  const getAnimalIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      cow: '🐄',
      goat: '🐐',
      sheep: '🐑',
      pig: '🐷',
      chicken: '🐔',
      other: '🐾'
    }
    return iconMap[type] || '🐾'
  }

  const handleModalSuccess = () => {
    loadAnimals()
  }

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
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentLang(currentLang === 'en' ? 'rw' : 'en')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                🌐 {currentLang === 'en' ? 'English' : 'Kinyarwanda'}
              </button>
              <button
                onClick={handleAdd}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <i className='bi bi-plus-lg'></i> {t.addAnimal}
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Types</option>
              <option value="cow">{t.cow}</option>
              <option value="goat">{t.goat}</option>
              <option value="sheep">{t.sheep}</option>
              <option value="pig">{t.pig}</option>
              <option value="chicken">{t.chicken}</option>
              <option value="other">{t.other}</option>
            </select>

            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Health Status</option>
              <option value="healthy">{t.healthy}</option>
              <option value="sick">{t.sick}</option>
              <option value="injured">{t.injured}</option>
              <option value="recovering">{t.recovering}</option>
            </select>
          </div>
        </div>

        {/* Animals Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredAnimals.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">🐾</div>
              <p className="text-gray-500">{t.noAnimals}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.name}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.type}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.owner}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.healthStatus}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.weight}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.added}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAnimals.map((animal) => (
                    <tr key={animal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-lg">
                                {getAnimalIcon(animal.type)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {animal.name}
                            </div>
                            {animal.breed && (
                              <div className="text-sm text-gray-500">{animal.breed}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatType(animal.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {animal.owner_name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getHealthColor(animal.health_status)}`}>
                          {formatHealthStatus(animal.health_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {animal.weight ? `${animal.weight} kg` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(animal.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(animal)}
                            className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(animal)}
                            className="text-red-600 hover:text-red-900 px-2 py-1 rounded"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">#</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Animals</p>
                <p className="text-2xl font-semibold text-gray-900">{animals.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">✓</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Healthy</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {animals.filter(a => a.health_status === 'healthy').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600">⚠</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Need Attention</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {animals.filter(a => ['sick', 'injured'].includes(a.health_status)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600">⟳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Recovering</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {animals.filter(a => a.health_status === 'recovering').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimalModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        animal={selectedAnimal}
        mode={modalMode}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}