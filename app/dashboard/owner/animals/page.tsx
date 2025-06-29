'use client'

import AddAnimalModal from '@/app/components/dash/animalModal'
import { useState, useEffect } from 'react'
// Bootstrap Icons will be used via CDN

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
  created_at: string
  updated_at: string
}

interface StatusSummary {
  total: number
  healthy: number
  pregnant: number
  sick: number
  types: { [key: string]: number }
}

export default function AnimalDashboard() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterHealth, setFilterHealth] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null)

  // Fetch animals on component mount
  useEffect(() => {
    // Load Bootstrap Icons CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css'
    document.head.appendChild(link)
    
    fetchAnimals()
    
    return () => {
      document.head.removeChild(link)
    }
  }, [])

  const fetchAnimals = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/animals/add')
      
      if (!response.ok) {
        throw new Error('Failed to fetch animals')
      }
      
      const data = await response.json()
      setAnimals(data.animals || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch animals')
    } finally {
      setLoading(false)
    }
  }

  // Calculate status summary
  const getStatusSummary = (): StatusSummary => {
    const summary: StatusSummary = {
      total: animals.length,
      healthy: 0,
      pregnant: 0,
      sick: 0,
      types: {}
    }

    animals.forEach(animal => {
      // Health status count
      if (animal.health_status === 'healthy') summary.healthy++
      else if (animal.health_status === 'pregnant') summary.pregnant++
      else if (animal.health_status === 'sick') summary.sick++

      // Animal types count
      summary.types[animal.type] = (summary.types[animal.type] || 0) + 1
    })

    return summary
  }

  // Filter animals based on search and filters
  const getFilteredAnimals = () => {
    return animals.filter(animal => {
      const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          animal.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (animal.breed && animal.breed.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesType = filterType === 'all' || animal.type === filterType
      const matchesHealth = filterHealth === 'all' || animal.health_status === filterHealth

      return matchesSearch && matchesType && matchesHealth
    })
  }

  // Pagination logic
  const filteredAnimals = getFilteredAnimals()
  const totalPages = Math.ceil(filteredAnimals.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedAnimals = filteredAnimals.slice(startIndex, startIndex + itemsPerPage)

  const statusSummary = getStatusSummary()
  const uniqueTypes = [...new Set(animals.map(animal => animal.type))]

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this animal?')) return

    try {
      const response = await fetch(`/api/animals/add?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchAnimals()
      } else {
        throw new Error('Failed to delete animal')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete animal')
    }
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50'
      case 'pregnant': return 'text-red-600 bg-red-50'
      case 'sick': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 flex items-center justify-center">
          <i className="bi bi-arrow-clockwise text-green-600"></i>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen  p-6">
      <div className="">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Animal Management</h1>
          <p className="text-gray-600">Manage your animals and track their health status</p>
        </div>

        {/* Status Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Animals</p>
                <p className="text-3xl font-bold text-gray-900">{statusSummary.total}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <i className="bi bi-heart-fill text-gray-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Healthy</p>
                <p className="text-3xl font-bold text-green-600">{statusSummary.healthy}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="bi bi-check-circle-fill text-green-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pregnant</p>
                <p className="text-3xl font-bold text-red-600">{statusSummary.pregnant}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="bi bi-thermometer-half text-red-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sick</p>
                <p className="text-3xl font-bold text-yellow-600">{statusSummary.sick}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="bi bi-bandaid-fill text-yellow-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative">
                <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search animals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full md:w-64"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={filterHealth}
                onChange={(e) => setFilterHealth(e.target.value)}
                className="px-4 py-2 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Health Status</option>
                <option value="healthy">Healthy</option>
                <option value="pregnant">Pregnant</option>
                <option value="sick">Sick</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <i className="bi bi-plus-lg"></i>
              Add Animal
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Animals Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Name</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Type</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Breed</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Gender</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Health Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">ID Number</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedAnimals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      No animals found. {animals.length === 0 ? 'Add your first animal!' : 'Try adjusting your filters.'}
                    </td>
                  </tr>
                ) : (
                  paginatedAnimals.map((animal) => (
                    <tr key={animal.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">{animal.name}</div>
                        {animal.birth_date && (
                          <div className="text-sm text-gray-500">
                            Born: {new Date(animal.birth_date).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-900">{animal.type}</td>
                      <td className="py-4 px-6 text-gray-600">{animal.breed || '-'}</td>
                      <td className="py-4 px-6 text-gray-600">{animal.gender || '-'}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthStatusColor(animal.health_status)}`}>
                          {animal.health_status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{animal.identification_number || '-'}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingAnimal(animal)}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit Animal"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(animal.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Animal"
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAnimals.length)} of {filteredAnimals.length} animals
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous Page"
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded text-sm ${
                          currentPage === page
                            ? 'bg-green-600 text-white'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Next Page"
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {showAddModal && <AddAnimalModal isOpen={showAddModal} onClose={() => setShowAddModal(!showAddModal)} onSuccess={() => {}} />}
    </div>
  )
}