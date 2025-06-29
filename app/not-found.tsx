'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const translations: any = {
  en: {
    title: "Page Not Found",
    subtitle: "Oops! The page you're looking for doesn't exist.",
    description: "The page might have been moved, deleted, or you entered the wrong URL.",
    homeButton: "Go Home",
    backButton: "Go Back",
    searchLabel: "Search for something else:",
    searchPlaceholder: "Search veterinarians, services...",
    searchButton: "Search",
    quickLinks: "Quick Links",
    findVet: "Find a Veterinarian",
    services: "Our Services",
    contact: "Contact Us",
    help: "Help & Support"
  },
  rw: {
    title: "Urupapuro Ntiruboneka",
    subtitle: "Ihangane! Urupapuro ushaka ntirubaho.",
    description: "Urupapuro rushobora kuba rwarimutse, rwasibwe, cyangwa wanditse link itari yo.",
    homeButton: "Garuka Ahabanza",
    backButton: "Garuka Inyuma",
    searchLabel: "Shakisha ikindi kintu:",
    searchPlaceholder: "Shakisha abaganga b'inyamaswa, serivise...",
    searchButton: "Shakisha",
    quickLinks: "Amakuru Yihuse",
    findVet: "Shakisha Umuganga w'Inyamaswa",
    services: "Serivise Zacu",
    contact: "Twandikire",
    help: "Ubufasha"
  }
}

export default function NotFound() {
  const router = useRouter()
  const [lang, setLang] = useState('en')
  const [searchQuery, setSearchQuery] = useState('')
  
  const t = translations[lang]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <div>
      {/* Header */}
      <header className="">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-end">
           
            
            {/* Language Selector */}
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="bg-white border border-green-200 text-gray-700 px-3 py-2 rounded-lg text-sm"
            >
              <option value="en">🌐 English</option>
              <option value="rw">🇷🇼 Kinyarwanda</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-green-100 rounded-full mb-6">
              <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            {/* 404 Number */}
            <div className="text-8xl font-bold text-green-600 mb-4 leading-none">
              404
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{t.title}</h1>
            <p className="text-xl text-gray-600 mb-2">{t.subtitle}</p>
            <p className="text-gray-500">{t.description}</p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-green-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 VetConnect. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}