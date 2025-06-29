import { useState } from 'react'

interface AddAnimalModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const translations: any = {
  en: {
    addAnimal: "Add New Animal",
    animalName: "Animal Name",
    animalType: "Animal Type",
    breed: "Breed (Optional)",
    gender: "Gender",
    birthDate: "Birth Date (Optional)",
    idNumber: "ID/Tag Number (Optional)",
    color: "Color (Optional)",
    weight: "Weight (kg) (Optional)",
    healthStatus: "Health Status",
    notes: "Additional Notes (Optional)",
    save: "Save Animal",
    cancel: "Cancel",
    saving: "Saving...",
    success: "Animal added successfully!",
    error: "Failed to add animal. Please try again.",
    required: "This field is required",
    selectType: "Select type",
    selectGender: "Select gender",
    // Animal types
    cow: "Cow",
    goat: "Goat",
    sheep: "Sheep",
    chicken: "Chicken",
    pig: "Pig",
    rabbit: "Rabbit",
    // Gender
    male: "Male",
    female: "Female",
    // Health status
    healthy: "Healthy",
    sick: "Sick",
    under_treatment: "Under Treatment",
    pregnant: "Pregnant"
  },
  rw: {
    addAnimal: "Ongeraho Itungo",
    animalName: "Izina ry'itungo",
    animalType: "Ubwoko bw'itungo",
    breed: "Ubwoko (Ntago ari ngombwa)",
    gender: "Igitsina",
    birthDate: "Itariki y'amavuko (Ntago ari ngombwa)",
    idNumber: "Nimero y'ikirango (Ntago ari ngombwa)",
    color: "Ibara (Ntago ari ngombwa)",
    weight: "Uburemere (kg) (Ntago ari ngombwa)",
    healthStatus: "Imiterere y'ubuzima",
    notes: "Ibindi bisobanuro (Ntago ari ngombwa)",
    save: "Bika Itungo",
    cancel: "Hagarika",
    saving: "Kubika...",
    success: "Itungo ryongeweho neza!",
    error: "Byanze. Ongera ugerageze.",
    required: "Iki gisabwa",
    selectType: "Hitamo ubwoko",
    selectGender: "Hitamo igitsina",
    // Animal types
    cow: "Inka",
    goat: "Ihene",
    sheep: "Intama",
    chicken: "Inkoko",
    pig: "Ingurube",
    rabbit: "Urukwavu",
    // Gender
    male: "Gabo",
    female: "Gore",
    // Health status
    healthy: "Afite ubuzima bwiza",
    sick: "Ararwaye",
    under_treatment: "Ari mu buvuzi",
    pregnant: "Igisamo"
  }
}

export default function AddAnimalModal({ isOpen, onClose, onSuccess }: AddAnimalModalProps) {
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
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const t = translations[currentLang]

  const animalTypes = ['cow', 'goat', 'sheep', 'chicken', 'pig', 'rabbit']
  const genders = ['male', 'female']
  const healthStatuses = ['healthy', 'sick', 'under_treatment', 'pregnant']

  const toggleLanguage = () => {
    setCurrentLang(currentLang === 'en' ? 'rw' : 'en')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!formData.name || !formData.type) {
      setError(t.required)
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/animals/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
      name: '',
      type: '',
      breed: '',
      gender: '',
      birthDate: '',
      idNumber: '',
      color: '',
      weight: '',
      healthStatus: 'healthy',
      notes: ''
    })
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{t.addAnimal}</h2>
            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                type="button"
              >
                <span className="text-xs">🌐</span>
                <span className="font-medium">{currentLang === 'en' ? 'English' : 'Kinyarwanda'}</span>
              </button>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Animal Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.animalName} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {/* Animal Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.animalType} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">{t.selectType}</option>
                {animalTypes.map(type => (
                  <option key={type} value={type}>{t[type]}</option>
                ))}
              </select>
            </div>

            {/* Breed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.breed}
              </label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.gender}
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">{t.selectGender}</option>
                {genders.map(gender => (
                  <option key={gender} value={gender}>{t[gender]}</option>
                ))}
              </select>
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.birthDate}
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* ID Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.idNumber}
              </label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.color}
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.weight}
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Health Status */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.healthStatus}
              </label>
              <select
                value={formData.healthStatus}
                onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {healthStatuses.map(status => (
                  <option key={status} value={status}>{t[status]}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.notes}
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name || !formData.type}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t.saving : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}