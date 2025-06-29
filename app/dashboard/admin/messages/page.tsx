'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

interface User {
  id: number
  name: string
  full_name?: string
  email: string
  role: string
  profile_picture?: string
  last_seen?: string
  is_online?: boolean
}

interface Message {
  id: number
  sender_id: number
  receiver_id: number
  content: string
  timestamp: string
  is_read: boolean
  read_status: string
  sender_name?: string
  sender_full_name?: string
  receiver_name?: string
  receiver_full_name?: string
}

interface Conversation {
  user: User
  lastMessage?: Message
  unreadCount: number
  isTyping?: boolean
}

interface SupportTicket {
  id: number
  user_id: number
  user_name: string
  user_full_name?: string
  user_email: string
  user_role: string
  user_profile_picture?: string
  subject: string
  priority: string
  category: string
  status: string
  created_at: string
  description?: string
}

const translations = {
  en: {
    title: "Admin Messages",
    searchPlaceholder: "Search conversations...",
    typeMessage: "Type a message...",
    send: "Send",
    online: "Online",
    offline: "Offline",
    typing: "typing...",
    lastSeen: "Last seen",
    noMessages: "No messages yet",
    startConversation: "Select a conversation to start messaging",
    admins: "Administrators",
    users: "Users",
    staff: "Staff Members",
    customers: "Customers",
    all: "All",
    today: "Today",
    yesterday: "Yesterday",
    delivered: "Delivered",
    read: "Read",
    newConversation: "New Conversation",
    selectUser: "Select a user to start chatting",
    noConversations: "No conversations yet",
    startNewChat: "Start a new chat with a user or staff member",
    supportTickets: "Support Tickets",
    startChatWith: "Start chat with",
    submittedTicket: "Submitted a support ticket:",
    priority: "Priority",
    category: "Category",
    status: "Status",
    noSupportTickets: "No support tickets found",
    newChatTemplate: "New Chat",
    backToConversations: "Back to Conversations",
    high: "High",
    medium: "Medium",
    low: "Low",
    open: "Open",
    inProgress: "In Progress",
    resolved: "Resolved",
    closed: "Closed",
    technical: "Technical",
    billing: "Billing",
    general: "General",
    account: "Account",
    feature: "Feature Request"
  },
  rw: {
    title: "Ubutumwa bw'Ubuyobozi",
    searchPlaceholder: "Shakisha ikiganiro...",
    typeMessage: "Andika ubutumwa...",
    send: "Ohereza",
    online: "Ari kuri interineti",
    offline: "Ntari kuri interineti",
    typing: "ariko arandika...",
    lastSeen: "Yaheruka kuboneka",
    noMessages: "Nta butumwa buhari",
    startConversation: "Hitamo ikiganiro utangire kuganira",
    admins: "Abayobozi",
    users: "Abakoresha",
    staff: "Abakozi",
    customers: "Abakiriya",
    all: "Byose",
    today: "Uyu munsi",
    yesterday: "Ejo",
    delivered: "Bwageze",
    read: "Bwasomwe",
    newConversation: "Ikiganiro gishya",
    selectUser: "Hitamo umuntu uganire nawe",
    noConversations: "Nta biganiro bihari",
    startNewChat: "Tangira ikiganiro gishya n'umukoresha cyangwa umukozi",
    supportTickets: "Ibisabwa by'Ubufasha",
    startChatWith: "Tangira ikiganiro na",
    submittedTicket: "Yohereje icyifuzo cy'ubufasha:",
    priority: "Ibanze",
    category: "Icyiciro",
    status: "Uko bimeze",
    noSupportTickets: "Nta bisabwa by'ubufasha bibonetse",
    newChatTemplate: "Ikiganiro Gishya",
    backToConversations: "Garuka ku biganiro",
    high: "Byihutirwa",
    medium: "Byiciriritse",
    low: "Bidafite ubwihuse",
    open: "Bifunguye",
    inProgress: "Birakozwe",
    resolved: "Byakemuwe",
    closed: "Bifunze",
    technical: "Ikoranabuhanga",
    billing: "Kwishyura",
    general: "Rusange",
    account: "Konti",
    feature: "Gusaba ibiranga"
  }
}

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<User | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [currentLang, setCurrentLang] = useState<'en' | 'rw'>('en')
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'admins' | 'staff' | 'users'>('all')
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set())
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set())
  const [showNewChatTemplate, setShowNewChatTemplate] = useState(false)
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([])
  const [loadingTickets, setLoadingTickets] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<{ [key: number]: NodeJS.Timeout }>({})
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)

  const t = translations[currentLang]

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css'
    document.head.appendChild(link)
    
    loadUserAndConversations()
    
    // Set up polling for real-time updates
    pollingIntervalRef.current = setInterval(() => {
      if (selectedConversation) {
        fetchMessages(selectedConversation.id)
      }
      updateOnlineStatus()
    }, 3000) // Poll every 3 seconds
    
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      Object.values(typingTimeoutRef.current).forEach(timeout => clearTimeout(timeout))
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadUserAndConversations = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) return

      const user = JSON.parse(userData)
      setCurrentUser(user)
      
      await fetchConversations(user.id)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchConversations = async (userId: number) => {
    try {
      // Fetch all messages for the current user
      const response = await fetch(`/api/messages?user_id=${userId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        const messages = data.messages || []
        
        // Group messages by conversation partner
        const conversationMap = new Map<number, Conversation>()
        
        messages.forEach((msg: Message) => {
          const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
          const partnerName = msg.sender_id === userId ? msg.receiver_name : msg.sender_name
          const partnerFullName = msg.sender_id === userId ? msg.receiver_full_name : msg.sender_full_name
          
          if (!conversationMap.has(partnerId)) {
            conversationMap.set(partnerId, {
              user: {
                id: partnerId,
                name: partnerName || 'Unknown User',
                full_name: partnerFullName,
                email: '',
                role: '',
                is_online: onlineUsers.has(partnerId)
              },
              lastMessage: msg,
              unreadCount: 0
            })
          } else {
            const conv = conversationMap.get(partnerId)!
            // Update last message if this one is newer
            if (new Date(msg.timestamp) > new Date(conv.lastMessage!.timestamp)) {
              conv.lastMessage = msg
            }
          }
          
          // Count unread messages
          if (msg.receiver_id === userId && !msg.is_read) {
            const conv = conversationMap.get(partnerId)!
            conv.unreadCount++
          }
        })
        
        // Convert map to array and sort by last message time
        const conversationsList = Array.from(conversationMap.values())
          .sort((a, b) => {
            const timeA = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0
            const timeB = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0
            return timeB - timeA
          })
        
        setConversations(conversationsList)
        
        // Also fetch user details for better display
        await fetchUserDetails(conversationsList.map(c => c.user.id))
        
        // If no conversations, show new chat template
        if (conversationsList.length === 0) {
          setShowNewChatTemplate(true)
          await fetchSupportTickets(userId)
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err)
    }
  }

  const fetchUserDetails = async (userIds: number[]) => {
    try {
      const response = await fetch('/api/users', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        const users = data.users || []
        
        // Update conversation users with user details
        setConversations(prev => prev.map(conv => {
          const user = users.find((u: any) => u.id === conv.user.id)
          if (user) {
            return {
              ...conv,
              user: {
                ...conv.user,
                email: user.email,
                role: user.role,
                profile_picture: user.profile_picture,
                full_name: user.full_name
              }
            }
          }
          return conv
        }))
      }
    } catch (err) {
      console.error('Error fetching user details:', err)
    }
  }

  const fetchSupportTickets = async (userId: number) => {
    setLoadingTickets(true)
    try {
      const response = await fetch(`/api/users?admin_id=${userId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        const tickets = data.vets || []
        
        // Transform ticket data to include user info
        const supportTickets: SupportTicket[] = tickets.map((ticket: any) => ({
          id: ticket.id,
          user_id: ticket.id,
          user_name: ticket.name || 'Unknown User',
          user_full_name: ticket.user_full_name,
          user_email: ticket.user_email || '',
          user_role: ticket.role || 'user',
          user_profile_picture: ticket.user_profile_picture,
          subject: ticket.subject || 'Start new chat',
          priority: ticket.priority || 'medium',
          category: ticket.category || 'general',
          status: ticket.status || 'open',
          created_at: ticket.created_at,
          description: ticket.description
        }))
        
        setSupportTickets(supportTickets)
      }
    } catch (err) {
      console.error('Error fetching support tickets:', err)
    } finally {
      setLoadingTickets(false)
    }
  }

  const fetchMessages = async (partnerId: number) => {
    if (!currentUser) return
    
    try {
      const response = await fetch(`/api/messages?user_id=${currentUser.id}&conversation_with=${partnerId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Sort messages by timestamp in ascending order (oldest first)
        const sortedMessages = (data.messages || []).sort((a: any, b: any) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        
        setMessages(sortedMessages)
        
        // Mark messages as read
        const unreadMessages = sortedMessages.filter(
          (msg: Message) => msg.receiver_id === currentUser.id && !msg.is_read
        )
        
        if (unreadMessages.length > 0) {
          markMessagesAsRead(partnerId)
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
    }
  }

  const markMessagesAsRead = async (senderId: number) => {
    if (!currentUser) return
    
    try {
      await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_id: currentUser.id,
          sender_id: senderId,
          mark_as_read: true
        }),
        credentials: 'include'
      })
      
      // Update local state
      setConversations(prev => prev.map(conv => 
        conv.user.id === senderId ? { ...conv, unreadCount: 0 } : conv
      ))
    } catch (err) {
      console.error('Error marking messages as read:', err)
    }
  }

  const startNewConversation = (ticket: SupportTicket) => {
    const user: User = {
      id: ticket.user_id,
      name: ticket.user_name,
      full_name: ticket.user_full_name,
      email: ticket.user_email,
      role: ticket.user_role,
      profile_picture: ticket.user_profile_picture,
      is_online: onlineUsers.has(ticket.user_id)
    }
    
    setSelectedConversation(user)
    setMessages([])
    setShowNewChatTemplate(false)
    
    // Set a default message template
    const priorityText = currentLang === 'en' ? ticket.priority : t[ticket.priority as keyof typeof t]
    const statusText = currentLang === 'en' ? ticket.status : t[ticket.status as keyof typeof t]
    
    const defaultMessage = currentLang === 'en' 
      ? `Hello! I received your support ticket: "${ticket.subject}". Priority: ${priorityText}, Status: ${statusText}. How can I assist you today?`
      : `Muraho! Nahawe icyifuzo cyawe cy'ubufasha: "${ticket.subject}". ${t.priority}: ${priorityText}, ${t.status}: ${statusText}. Nshobora kugufasha gute?`
    
    setMessageText(defaultMessage)
    
    // Focus on message input
    setTimeout(() => {
      messageInputRef.current?.focus()
    }, 100)
  }

  const sendMessage = async () => {
    if (!messageText.trim() || !currentUser || !selectedConversation || sending) return
    
    setSending(true)
    const tempMessage: Message = {
      id: Date.now(),
      sender_id: currentUser.id,
      receiver_id: selectedConversation.id,
      content: messageText,
      timestamp: new Date().toISOString(),
      is_read: false,
      read_status: 'sent',
      sender_name: currentUser.name
    }
    
    setMessages(prev => [...prev, tempMessage])
    const currentMessageText = messageText
    setMessageText('')
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: currentUser.id,
          receiver_id: selectedConversation.id,
          content: currentMessageText
        }),
        credentials: 'include'
      })
      
      if (response.ok) {
        // Refresh messages to get the actual message from server
        await fetchMessages(selectedConversation.id)
      }
    } catch (err) {
      console.error('Error sending message:', err)
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id))
      setMessageText(currentMessageText)
    } finally {
      setSending(false)
    }
  }

  const handleTyping = () => {
    if (!currentUser || !selectedConversation) return
    
    // Simulate typing indicator (in real app, use WebSocket)
    if (typingTimeoutRef.current[selectedConversation.id]) {
      clearTimeout(typingTimeoutRef.current[selectedConversation.id])
    }
    
    setTypingUsers(prev => new Set(prev).add(selectedConversation.id))
    
    typingTimeoutRef.current[selectedConversation.id] = setTimeout(() => {
      setTypingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(selectedConversation.id)
        return newSet
      })
    }, 3000)
  }

  const updateOnlineStatus = () => {
    // Simulate online status (in real app, use WebSocket or presence system)
    setOnlineUsers(new Set([...Array(10)].map(() => Math.floor(Math.random() * 100))))
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return t.yesterday
    } else {
      return date.toLocaleDateString()
    }
  }

  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return ''
    const date = new Date(lastSeen)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60) // minutes
    
    if (diff < 1) return 'just now'
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return formatTime(lastSeen)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'text-green-600 bg-green-100'
      case 'in progress': return 'text-orange-600 bg-orange-100'
      case 'resolved': return 'text-green-600 bg-green-100'
      case 'closed': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bi-shield-check'
      case 'staff': return 'bi-person-badge'
      case 'user': return 'bi-person'
      default: return 'bi-person'
    }
  }

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filter === 'all') return matchesSearch
    if (filter === 'admins') return matchesSearch && conv.user.role === 'admin'
    if (filter === 'users') return matchesSearch && ['user', 'customer'].includes(conv.user.role)
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <i className="bi bi-shield-check text-green-600"></i>
              {showNewChatTemplate ? t.newChatTemplate : t.title}
            </h1>
            <div className="flex items-center gap-2">
              {showNewChatTemplate && conversations.length > 0 && (
                <button
                  onClick={() => setShowNewChatTemplate(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title={t.backToConversations}
                >
                  <i className="bi bi-arrow-left text-gray-600"></i>
                </button>
              )}
              <button
                onClick={() => setCurrentLang(currentLang === 'en' ? 'rw' : 'en')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <i className="bi bi-translate text-gray-600"></i>
              </button>
            </div>
          </div>
          
          {!showNewChatTemplate && (
            <>
              {/* Search */}
              <div className="relative mb-4">
                <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              {/* Filter Tabs */}
              <div className="flex gap-2 flex-wrap">
                {['all', 'admins', 'users'].map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType as any)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === filterType
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t[filterType as keyof typeof t]}
                  </button>
                ))}
              </div>
              
              {/* New Chat Button */}
              {conversations.length > 0 && (
                <button
                  onClick={() => {
                    setShowNewChatTemplate(true)
                    fetchSupportTickets(currentUser?.id || 0)
                  }}
                  className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-green-600 to-indigo-600 text-white rounded-lg hover:shadow-md transition-all"
                >
                  <i className="bi bi-plus-circle mr-2"></i>
                  {t.newConversation}
                </button>
              )}
            </>
          )}
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {showNewChatTemplate ? (
            // Support Tickets Template
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i className="bi bi-life-preserver text-green-600"></i>
                {t.supportTickets}
              </h3>
              
              {loadingTickets ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-green-600 border-t-transparent rounded-full"></div>
                </div>
              ) : supportTickets.length === 0 ? (
                <div className="text-center py-8">
                  <i className="bi bi-ticket-perforated text-gray-300 text-4xl mb-4 block"></i>
                  <p className="text-gray-500">{t.noSupportTickets}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {supportTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => startNewConversation(ticket)}
                      className="p-4 bg-gray-50 hover:bg-green-50 rounded-lg cursor-pointer transition-colors border border-gray-200 hover:border-green-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {ticket.user_profile_picture ? (
                              <img src={ticket.user_profile_picture} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              ticket.user_name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 p-1 rounded-full text-xs ${getRoleIcon(ticket.user_role)}`}>
                            <i className={`bi ${getRoleIcon(ticket.user_role)} text-gray-600`}></i>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {ticket.user_full_name || ticket.user_name}
                            </h4>
                            <div className="flex gap-1">
                              <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                                {t[ticket.priority as keyof typeof t] || ticket.priority}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {ticket.subject}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                              {t[ticket.status as keyof typeof t] || ticket.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(ticket.created_at)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <i className="bi bi-chat-dots text-green-600 text-lg"></i>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Conversations List
            <>
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <i className="bi bi-chat-square-dots text-gray-300 text-5xl mb-4 block"></i>
                  <p className="text-gray-500">{t.noConversations}</p>
                  <p className="text-gray-400 text-sm mt-2">{t.startNewChat}</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.user.id}
                    onClick={() => {
                      setSelectedConversation(conv.user)
                      fetchMessages(conv.user.id)
                      setShowNewChatTemplate(false)
                    }}
                    className={`p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${
                      selectedConversation?.id === conv.user.id ? 'bg-green-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {conv.user.profile_picture ? (
                            <img src={conv.user.profile_picture} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            conv.user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        {onlineUsers.has(conv.user.id) && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                        <div className="absolute -top-1 -right-1">
                          <i className={`bi ${getRoleIcon(conv.user.role)} text-xs text-gray-600`}></i>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {conv.user.full_name || conv.user.name}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {conv.lastMessage && formatTime(conv.lastMessage.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">
                            {typingUsers.has(conv.user.id) ? (
                              <span className="text-green-600 italic">{t.typing}</span>
                            ) : (
                              conv.lastMessage?.content || 'No messages'
                            )}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedConversation.profile_picture ? (
                        <img src={selectedConversation.profile_picture} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        selectedConversation.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    {onlineUsers.has(selectedConversation.id) && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                      {selectedConversation.full_name || selectedConversation.name}
                      <i className={`bi ${getRoleIcon(selectedConversation.role)} text-sm text-gray-500`}></i>
                    </h2>
                    <p className="text-xs text-gray-500">
                      {typingUsers.has(selectedConversation.id) ? (
                        <span className="text-green-600">{t.typing}</span>
                      ) : onlineUsers.has(selectedConversation.id) ? (
                        <span className="text-green-600">{t.online}</span>
                      ) : (
                        `${t.lastSeen} ${formatLastSeen(selectedConversation.last_seen)}`
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <i className="bi bi-telephone text-gray-600"></i>
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <i className="bi bi-camera-video text-gray-600"></i>
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <i className="bi bi-info-circle text-gray-600"></i>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-hidden overflow-y-visible p-4 bg-gray-50 min-h-[75vh] max-h-[75vh]">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <i className="bi bi-chat-dots text-gray-300 text-5xl mb-4 block"></i>
                  <p className="text-gray-500">{t.noMessages}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isOwn = message.sender_id === currentUser?.id
                    const showDate = index === 0 || 
                      new Date(messages[index - 1].timestamp).toDateString() !== new Date(message.timestamp).toDateString()
                    
                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="text-center my-4">
                            <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
                              {formatTime(message.timestamp) === formatTime(new Date().toISOString()) 
                                ? t.today 
                                : formatTime(message.timestamp)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                            <div className={`px-4 py-2 rounded-2xl ${
                              isOwn 
                                ? 'bg-gradient-to-r from-green-600 to-indigo-600 text-white' 
                                : 'bg-white border border-gray-200 text-gray-900'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-xs text-gray-500">
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isOwn && (
                                <i className={`bi text-xs ${
                                  message.is_read 
                                    ? 'bi-check-all text-green-500' 
                                    : 'bi-check text-gray-400'
                                }`}></i>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-end gap-3">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <i className="bi bi-paperclip text-gray-600"></i>
                </button>
                <div className="flex-1">
                  <textarea
                    ref={messageInputRef}
                    value={messageText}
                    onChange={(e) => {
                      setMessageText(e.target.value)
                      handleTyping()
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    placeholder={t.typeMessage}
                    className="w-full px-4 min-h-[5vh] py-2 bg-gray-100 border-0 rounded-lg resize-none focus:ring-2 focus:ring-green-500 outline-none"
                    rows={1}
                  />
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <i className="bi bi-emoji-smile text-gray-600"></i>
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!messageText.trim() || sending}
                  className="p-2 bg-gradient-to-r from-green-600 to-indigo-600 text-white rounded-lg hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="bi bi-send-fill"></i>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <i className="bi bi-shield-check text-green-600 text-6xl mb-4 block"></i>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.selectUser}</h3>
              <p className="text-gray-500">{t.startConversation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}