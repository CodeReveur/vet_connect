'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from './lang'

export default function Navbar() {
  const { lang, setLang, t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-green-700 text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🐾</span>
            <span className="font-bold text-xl">VetConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#how-it-works" className="hover:text-green-200 transition-colors">
              {t('how_it_works')}
            </Link>
            <Link href="/benefits" className="hover:text-green-200 transition-colors">
              {t('benefits')}
            </Link>
            
            {/* Language Selector */}
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="bg-green-600 text-white px-3 py-1 rounded border border-green-500 hover:bg-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              <option value="en">🌐 English</option>
              <option value="rw">🇷🇼 Kinyarwanda</option>
            </select>
            
            <Link href="/login" className="hover:text-green-200 transition-colors">
              {t('login')}
            </Link>
            <Link href="/register" className="bg-white text-green-700 px-4 py-2 rounded-md hover:bg-green-50 transition-colors font-semibold">
              {t('register')}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-green-600 transition-colors"
          >
            <i className={`bi ${mobileMenuOpen ? 'bi-x' : 'bi-list'} text-2xl`}></i>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-green-600">
            <div className="flex flex-col space-y-3">
              <Link href="#how-it-works" className="hover:text-green-200 transition-colors py-2">
                {t('how_it_works')}
              </Link>
              <Link href="/benefits" className="hover:text-green-200 transition-colors py-2">
                {t('benefits')}
              </Link>
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                className="bg-green-600 text-white px-3 py-2 rounded border border-green-500"
              >
                <option value="en">🌐 English</option>
                <option value="rw">🇷🇼 Kinyarwanda</option>
              </select>
              <Link href="/login" className="hover:text-green-200 transition-colors py-2">
                {t('login')}
              </Link>
              <Link href="/register" className="bg-white text-green-700 px-4 py-2 rounded-md hover:bg-green-50 transition-colors font-semibold text-center">
                {t('register')}
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}