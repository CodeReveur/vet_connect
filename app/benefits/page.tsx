'use client'
import React, { useEffect, useState } from 'react'
import 'bootstrap-icons/font/bootstrap-icons.css'

const translations = {
  en: {
    title: "Transform Your Veterinary Practice",
    subtitle: "Discover how our system revolutionizes pet care and streamlines operations.",
    whyTitle: "Why Choose Our Veterinary System?",
    whySubtitle: "Experience the future of care with our innovative features.",
    stats: ["Client Satisfaction", "Time Saved", "Data Security", "Average Rating"],
    cta: "Ready to Get Started?",
    ctaSub: "Join thousands of professionals who trust our system.",
    trial: "Start Free Trial",
    demo: "Schedule Demo",
    back: "Back to Home",
    benefits: [
      ["bi-calendar-event", "Easy Appointment Scheduling", "Streamlined booking system for pet owners."],
      ["bi-file-earmark-medical", "Digital Health Records", "Track full animal history and vaccinations."],
      ["bi-bell", "Smart Reminders", "Get automated reminders for appointments."],
      ["bi-people", "Efficient Management", "Reduce manual workload for vets."],
      ["bi-bar-chart", "Admin Analytics", "Gain insights with comprehensive analytics."],
      ["bi-chat-dots", "Enhanced Communication", "Stay in touch with pet owners easily."],
      ["bi-graph-up", "Data-Driven Decisions", "Make smarter choices with data insights."]
    ],
    statsIcons: ["bi-heart-fill", "bi-clock-fill", "bi-shield-lock-fill", "bi-star-fill"]
  },
  rw: {
    title: "Hindura Serivisi za Vetirinari",
    subtitle: "Menya uburyo sisitemu yacu ituma serivisi z’ibitungo zoroshywa kandi zigenda neza.",
    whyTitle: "Impamvu Uhitamo Sisitemu Yacu",
    whySubtitle: "Menya ejo hazaza h'ubuvuzi bw’amatungo ukoresheje ibiranga byihariye.",
    stats: ["Ibyishimo by'abakiriya", "Igihe cyazigamye", "Umutekano w'amakuru", "Isuzuma ryo hejuru"],
    cta: "Witeguye Gutangira?",
    ctaSub: "Injira mu bihumbi by’ababikoresha bizeye sisitemu yacu.",
    trial: "Tangira Ubuntu",
    demo: "Saba Gushishikarizwa",
    back: "Subira ku rubuga",
    benefits: [
      ["bi-calendar-event", "Gutanga Amatariki Byoroshye", "Sisitemu yoroshye yo gutanga gahunda."],
      ["bi-file-earmark-medical", "Inyandiko Z'ubuzima Zikomeye", "Kubika neza amateka y’itungo n’inkingo."],
      ["bi-bell", "Inyibutsa Zikora Zenyine", "Menyeshwa gahunda z'ubuvuzi mu gihe nyacyo."],
      ["bi-people", "Gucunga Neza Ibikorwa", "Kugabanya akazi gakorwa intoki."],
      ["bi-bar-chart", "Isesengura ry'Ubuyobozi", "Kumenya amakuru yose y’ingirakamaro."],
      ["bi-chat-dots", "Itumanaho Ryanozwe", "Guhuza vuba n’abatunze amatungo."],
      ["bi-graph-up", "Ibyemezo Bishingiye ku Makuru", "Fata ibyemezo byiza uhereye ku makuru."]
    ],
    statsIcons: ["bi-heart-fill", "bi-clock-fill", "bi-shield-lock-fill", "bi-star-fill"]
  }
}

export default function BenefitsPage() {
    const [lang, setLang] = useState<'en' | 'rw'>('en')

    // Load language preference from localStorage on mount
    useEffect(() => {
      const savedLang = localStorage.getItem('preferred-language')
      if (savedLang && (savedLang === 'en' || savedLang === 'rw')) {
        setLang(savedLang)
      }
    }, [])
  
  const t = translations[lang]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-cyan-50">

      {/* Hero */}
      <div className="bg-gradient-to-r from-green-600 to-purple-700 text-white py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <i className="bi bi-heart-fill text-5xl mb-4 block" />
          <h1 className="text-4xl font-bold">{t.title}</h1>
          <p className="mt-4 text-lg">{t.subtitle}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto px-6 py-12">
        {t.stats.map((label, idx) => (
          <div key={idx} className="bg-white text-center p-6 rounded-lg shadow border">
            <div className="mb-4 text-green-600 text-3xl">
              <i className={`bi ${t.statsIcons[idx]}`} />
            </div>
            <div className="text-3xl font-bold">
              {["98%", "50%", "99.9%", "4.9"][idx]}
            </div>
            <div className="text-gray-600">{label}</div>
          </div>
        ))}
      </div>

      {/* Benefits */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-center text-3xl font-bold mb-6">
          {t.whyTitle}
        </h2>
        <p className="text-center text-gray-600 mb-12">{t.whySubtitle}</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.benefits.map(([icon, title, desc], i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-all border">
              <div className="text-green-600 text-4xl mb-4">
                <i className={`bi ${icon}`} />
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
