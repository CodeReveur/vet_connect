'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from './components/app/lang'

const steps = [
  { icon: "📝", titleKey: "step_register", descKey: "step_register_desc" },
  { icon: "🔐", titleKey: "step_login", descKey: "step_login_desc" },
  { icon: "🤝", titleKey: "step_connect", descKey: "step_connect_desc" },
  { icon: "📅", titleKey: "step_book", descKey: "step_book_desc" },
  { icon: "💬", titleKey: "step_chat", descKey: "step_chat_desc" },
  { icon: "📊", titleKey: "step_manage", descKey: "step_manage_desc" },
  { icon: "⭐", titleKey: "step_rate", descKey: "step_rate_desc" },
  { icon: "🛠️", titleKey: "step_admin", descKey: "step_admin_desc" }
]

const farmerFeatures = [
  { titleKey: "instant_vet_access", descKey: "instant_vet_access_desc" },
  { titleKey: "health_records", descKey: "health_records_desc" },
  { titleKey: "vaccination_reminders", descKey: "vaccination_reminders_desc" }
]

const vetFeatures = [
  { titleKey: "efficient_scheduling", descKey: "efficient_scheduling_desc" },
  { titleKey: "digital_records", descKey: "digital_records_desc" },
  { titleKey: "expand_practice", descKey: "expand_practice_desc" }
]

export default function HomePage() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('farmers')
  const [showBackToTop, setShowBackToTop] = useState(false)

  const [vetCount, setVetCount] = useState(0)
  const [farmerCount, setFarmerCount] = useState(0)
  const [appointmentCount, setAppointmentCount] = useState(1)

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, appointmentsRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/appointments')
        ])

        if (usersRes.ok) {
          const usersData = await usersRes.json()
          const users = usersData.vets || usersData.users || []

          setVetCount(users.filter((u: any) => u.role === 'vet').length)
          setFarmerCount(users.filter((u: any) => u.role === 'owner' || u.role === 'farmer').length)
        }

        if (appointmentsRes.ok) {
          const appointmentsData = await appointmentsRes.json()
          const appointments = appointmentsData.appointments || []
          const completed = appointments.filter((a: any) => a.status === 'completed').length
          setAppointmentCount(completed || 1)
        }
      } catch (err) {
        console.error('Error fetching stats:', err)
      }
    }

    fetchStats()
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
     {/* Hero Section */}
      <section className="relative py-28 overflow-hidden bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url(/cow.jpg)'}}>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-white hidden bg-opacity-40"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
              {t('hero_title')}
            </h1>
            <p className="text-xl text-white mb-8 drop-shadow-md">
              {t('hero_description')}
            </p>
            <Link href="/register" className="inline-flex items-center bg-green-700 text-white px-8 py-3 rounded-lg hover:bg-green-800 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl">
              {t('get_started')}
              <i className="bi bi-arrow-right ml-2"></i>
            </Link>
          </div>
        </div>
        
        {/* Optional: Keep decorative elements or remove them since you have a real cow image */}
        <div className="absolute top-10 right-10 text-6xl opacity-20 text-white drop-shadow-lg">🐄</div>
        <div className="absolute bottom-10 left-10 text-6xl opacity-20 text-white drop-shadow-lg">🐑</div>
      </section>

      {/* Dynamic Stats Section */}
      <section className="bg-white py-12 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group hover:scale-105 transition-transform">
              <div className="text-4xl font-bold text-green-700">{vetCount}+</div>
              <div className="text-gray-600 mt-2">{t('active_vets')}</div>
            </div>
            <div className="group hover:scale-105 transition-transform">
              <div className="text-4xl font-bold text-green-700">{farmerCount}+</div>
              <div className="text-gray-600 mt-2">{t('registered_farmers')}</div>
            </div>
            <div className="group hover:scale-105 transition-transform">
              <div className="text-4xl font-bold text-green-700">{appointmentCount}+</div>
              <div className="text-gray-600 mt-2">{t('animals_treated')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            {t('how_it_works')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{t(step.titleKey)}</h3>
                <p className="text-gray-600 text-sm">{t(step.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setActiveTab('farmers')}
              className={`px-6 py-3 rounded-l-lg font-semibold transition-colors ${
                activeTab === 'farmers' 
                  ? 'bg-green-700 text-white' 
                  : 'bg-white text-green-700 hover:bg-green-100'
              }`}
            >
              {t('for_farmers')}
            </button>
            <button
              onClick={() => setActiveTab('vets')}
              className={`px-6 py-3 rounded-r-lg font-semibold transition-colors ${
                activeTab === 'vets' 
                  ? 'bg-green-700 text-white' 
                  : 'bg-white text-green-700 hover:bg-green-100'
              }`}
            >
              {t('for_vets')}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {(activeTab === 'farmers' ? farmerFeatures : vetFeatures).map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow">
                <h3 className="font-semibold text-xl mb-3 text-green-800">{t(feature.titleKey)}</h3>
                <p className="text-gray-600">{t(feature.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('ready_transform')}</h2>
          <p className="text-xl mb-8 text-green-100">{t('join_thousands')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-white text-green-700 px-8 py-3 rounded-lg hover:bg-green-50 transition-colors font-semibold inline-flex items-center justify-center">
              {t('get_started_now')}
              <i className="bi bi-arrow-right ml-2"></i>
            </Link>
            <Link href="/login" className="border-2 border-white px-8 py-3 rounded-lg hover:bg-white hover:text-green-700 transition-colors font-semibold inline-flex items-center justify-center">
              {t('watch_demo')}
              <i className="bi bi-check-circle ml-2"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-green-700 text-white w-12 h-12 rounded-full shadow-lg hover:bg-green-800 transition-colors flex items-center justify-center z-40"
          aria-label="Back to top"
        >
          <i className="bi bi-arrow-up text-xl"></i>
        </button>
      )}
    </>
  )
}
