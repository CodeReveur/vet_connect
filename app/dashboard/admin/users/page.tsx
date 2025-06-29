'use client'
import { useState, useEffect } from 'react'

interface User {
  id: number
  name: string
  full_name?: string
  email: string
  phone?: string
  address?: string
  role: string
  created_at: string
  last_login?: string
}

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  mode: 'add' | 'edit'
  onSuccess: () => void
}

const translations = {
  en: {
    title: "User Management",
    subtitle: "Manage system users and permissions",
    searchPlaceholder: "Search users...",
    addUser: "Add User",
    editUser: "Edit User",
    deleteUser: "Delete User",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    // Form fields
    name: "Username",
    fullName: "Full Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    role: "Role",
    password: "Password",
    confirmPassword: "Confirm Password",
    // Roles
    admin: "Administrator",
    vet: "Veterinarian",
    owner: "Animal Owner",
    // Table
    actions: "Actions",
    joined: "Joined",
    lastActive: "Last Active",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    // Messages
    confirmDelete: "Are you sure you want to delete this user?",
    userAdded: "User added successfully",
    userUpdated: "User updated successfully",
    userDeleted: "User deleted successfully",
    error: "An error occurred",
    required: "Required fields are missing",
    passwordMismatch: "Passwords do not match",
    loading: "Loading...",
    noUsers: "No users found"
  },
  rw: {
    title: "Gucunga Abakoresha",
    subtitle: "Gucunga abakoresha ba sisitemu n'uburenganzira",
    searchPlaceholder: "Shakisha abakoresha...",
    addUser: "Ongeraho Umukoresha",
    editUser: "Hindura Umukoresha",
    deleteUser: "Siba Umukoresha",
    cancel: "Hagarika",
    save: "Bika",
    delete: "Siba",
    // Form fields
    name: "Izina ry'umukoresha",
    fullName: "Amazina yose",
    email: "Imeyili",
    phone: "Telefoni",
    address: "Aderesi",
    role: "Uruhare",
    password: "Ijambo banga",
    confirmPassword: "Emeza ijambo banga",
    // Roles
    admin: "Umuyobozi",
    vet: "Muganga w'itungo",
    owner: "Nyir'itungo",
    // Table
    actions: "Ibikorwa",
    joined: "Yiyandikishije",
    lastActive: "Aheruka",
    status: "Imiterere",
    active: "Arakora",
    inactive: "Ntarakora",
    // Messages
    confirmDelete: "Uremeza ko ushaka gusiba uyu mukoresha?",
    userAdded: "Umukoresha yongeyeho neza",
    userUpdated: "Umukoresha yahinduwe neza",
    userDeleted: "Umukoresha yasibye neza",
    error: "Habaye ikosa",
    required: "Ibisabwa ntibuzuye",
    passwordMismatch: "Amagambo banga ntahura",
    loading: "Biragenda...",
    noUsers: "Nta mukoresha ubonetse"
  }
}

const UserModal = ({ isOpen, onClose, user, mode, onSuccess }: UserModalProps) => {
  const [currentLang, setCurrentLang] = useState<'en' | 'rw'>('en')
  const [formData, setFormData] = useState({
    name: '',
    full_name: '',
    email: '',
    phone: '',
    address: '',
    role: 'owner',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const t = translations[currentLang]

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        name: user.name || '',
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        role: user.role || 'owner',
        password: '',
        confirmPassword: ''
      })
    }
  }, [user, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.email || !formData.role) {
      setError(t.required)
      return
    }

    if (mode === 'add' && (!formData.password || formData.password !== formData.confirmPassword)) {
      setError(mode === 'add' && !formData.password ? t.required : t.passwordMismatch)
      return
    }

    if (mode === 'edit' && formData.password && formData.password !== formData.confirmPassword) {
      setError(t.passwordMismatch)
      return
    }

    setLoading(true)
    
    try {
      const endpoint = '/api/auth/reg'
      const method = mode === 'add' ? 'POST' : 'PUT'
      
      const payload = {
        ...(mode === 'edit' && { id: user?.id }),
        name: formData.name,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        role: formData.role,
        ...(formData.password && { password: formData.password })
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

      alert(mode === 'add' ? t.userAdded : t.userUpdated)
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
      full_name: '',
      email: '',
      phone: '',
      address: '',
      role: 'owner',
      password: '',
      confirmPassword: ''
    })
    setError('')
    onClose()
  }

  

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'add' ? t.addUser : t.editUser}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {t.fullName}
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.email} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.phone}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="+250xxxxxxxxx"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.address}
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.role} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="owner">{t.owner}</option>
                <option value="vet">{t.vet}</option>
                {user?.role === 'admin' && <option value="admin">{t.admin}</option>}
              </select>
            </div>

            {(mode === 'add' || mode === 'edit') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.password} {mode === 'add' && <span className="text-red-500">*</span>}
                    {mode === 'edit' && <span className="text-sm text-gray-500">(leave blank to keep current)</span>}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required={mode === 'add'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.confirmPassword} {mode === 'add' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required={mode === 'add' || formData.password !== ''}
                  />
                </div>
              </>
            )}
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [currentLang, setCurrentLang] = useState<'en' | 'rw'>('en')
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [showModal, setShowModal] = useState(false)

  const t = translations[currentLang]

  useEffect(() => {
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
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.vets || [])
      } else {
        console.error('Failed to load users')
      }
    } catch (err) {
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleDelete = async (user: User) => {
    if (confirm(t.confirmDelete)) {
      try {
        const response = await fetch(`/api/users?id=${user.id}`, {
          method: 'DELETE',
          credentials: 'include'
        })

        if (response.ok) {
          alert(t.userDeleted)
          loadUsers()
        } else {
          const data = await response.json()
          alert(data.error || t.error)
        }
      } catch (err) {
        console.error('Error deleting user:', err)
        alert(t.error)
      }
    }
  }

  const handleAdd = () => {
    setSelectedUser(null)
    setModalMode('add')
    setShowModal(true)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

   // Helper functions that were missing
   const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatRole = (role: string) => {
    const roleMap: { [key: string]: string } = {
      admin: t.admin,
      vet: t.vet,
      owner: t.owner
    }
    return roleMap[role] || role
  }

  const getRoleColor = (role: string) => {
    const colorMap: { [key: string]: string } = {
      admin: 'bg-red-100 text-red-800',
      vet: 'bg-blue-100 text-blue-800',
      owner: 'bg-green-100 text-green-800'
    }
    return colorMap[role] || 'bg-gray-100 text-gray-800'
  }

  const handleModalSuccess = () => {
    loadUsers()
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
                <i className='bi bi-plus-lg'></i> {t.addUser}
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
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Roles</option>
              <option value="vet">{t.vet}</option>
              <option value="owner">{t.owner}</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">👤</div>
              <p className="text-gray-500">{t.noUsers}</p>
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
                      {t.email}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.role}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.joined}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.lastActive}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-green-600 font-medium text-sm">
                                {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name || user.name}
                            </div>
                            <div className="text-sm text-gray-500">@{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {formatRole(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.last_login ? formatDate(user.last_login) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
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

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
            <div className="text-sm text-gray-500">Total Users</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-red-600">{users.filter(u => u.role === 'admin').length}</div>
            <div className="text-sm text-gray-500">{t.admin}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'vet').length}</div>
            <div className="text-sm text-gray-500">{t.vet}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">{users.filter(u => u.role === 'owner').length}</div>
            <div className="text-sm text-gray-500">{t.owner}</div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <UserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        user={selectedUser}
        mode={modalMode}
        onSuccess={handleModalSuccess}
      />
    </div>
  )

 
}