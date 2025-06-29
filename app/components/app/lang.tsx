'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface LanguageContextType {
  lang: string
  setLang: (lang: string) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Global translations object
export const translations: Record<string, Record<string, string>> = {
  en: {
    // Navbar
    how_it_works: "How It Works",
    benefits: "Benefits",
    login: "Login",
    register: "Register",
    
    // Homepage
    hero_title: "Connect Farmers with Veterinarians Easily",
    hero_description: "A simple and reliable way for domestic animal owners to request vet support and manage health records.",
    get_started: "Get Started",
    for_farmers: "For Farmers",
    for_vets: "For Veterinarians",
    
    // Common
    submit: "Submit",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    back: "Back",
    next: "Next",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    
    // Stats
    active_vets: "Active Veterinarians",
    registered_farmers: "Registered Farmers",
    animals_treated: "Animals Treated",
    
    // Features
    instant_vet_access: "Instant Vet Access",
    instant_vet_access_desc: "Get immediate help from qualified veterinarians in your area.",
    health_records: "Health Records",
    health_records_desc: "Track all your animals' medical history in one place.",
    vaccination_reminders: "Vaccination Reminders",
    vaccination_reminders_desc: "Never miss important vaccinations with automated alerts.",
    efficient_scheduling: "Efficient Scheduling",
    efficient_scheduling_desc: "Manage appointments and optimize your routes between farms.",
    digital_records: "Digital Records",
    digital_records_desc: "Access complete medical histories and create treatment plans.",
    expand_practice: "Expand Your Practice",
    expand_practice_desc: "Connect with more farmers and grow your veterinary business.",
    
    // CTA
    ready_transform: "Ready to Transform Your Animal Healthcare?",
    join_thousands: "Join thousands of farmers and veterinarians already using VetConnect",
    get_started_now: "Get Started Now",
    watch_demo: "Try login",
    
    // Steps
    step_register: "Register",
    step_register_desc: "Create your account as a vet or animal owner.",
    step_login: "Login",
    step_login_desc: "Login to access your dashboard and manage your activities securely.",
    step_connect: "Connect",
    step_connect_desc: "Animal owners send requests to nearby veterinarians for support.",
    step_book: "Book Appointments",
    step_book_desc: "Select service, date, and time for appointments with available vets.",
    step_chat: "Chat & Notify",
    step_chat_desc: "Communicate with vets or owners through notifications or messaging.",
    step_manage: "Manage",
    step_manage_desc: "Access and update animal health records, vaccination data, and treatments.",
    step_rate: "Rate & Review",
    step_rate_desc: "Owners can leave feedback to help improve vet services.",
    step_admin: "Admin Panel",
    step_admin_desc: "Admins manage users, view reports, and configure system settings."
  },
  rw: {
    // Navbar
    how_it_works: "Uko Bikorwa",
    benefits: "Ibyiza",
    login: "Injira",
    register: "Iyandikishe",
    
    // Homepage
    hero_title: "Huza Abahinzi n'Abaganga b'amatungo byoroshye",
    hero_description: "Uburyo bworoshye kandi bwizewe bwo gusaba ubufasha kuri muganga w'amatungo no gukurikirana amateka y'ubuzima bw'amatungo.",
    get_started: "Tangira",
    for_farmers: "Ku Bahinzi",
    for_vets: "Ku Baganga b'amatungo",
    
    // Common
    submit: "Ohereza",
    cancel: "Hagarika",
    save: "Bika",
    delete: "Siba",
    edit: "Hindura",
    back: "Subira inyuma",
    next: "Komeza",
    loading: "Birimo...",
    error: "Ikosa",
    success: "Byagenze neza",
    
    // Stats
    active_vets: "Abaganga b'amatungo bakora",
    registered_farmers: "Abahinzi biyandikishije",
    animals_treated: "Amatungo yavuwe",
    
    // Features
    instant_vet_access: "Kubona Muganga vuba",
    instant_vet_access_desc: "Kubona ubufasha bwihuse bwa muganga w'amatungo bafite ubushobozi mu karere kawe.",
    health_records: "Inyandiko z'ubuzima",
    health_records_desc: "Kurikirana amateka yose y'ubuvuzi bw'amatungo yawe ahantu hamwe.",
    vaccination_reminders: "Ibibutsa inkingo",
    vaccination_reminders_desc: "Ntuzigere usiba inkingo z'ingenzi ukoresheje ibiganiro byihuse.",
    efficient_scheduling: "Gutegura gahunda neza",
    efficient_scheduling_desc: "Gucunga ibiganiro no kunoza inzira zawe hagati y'ibihinzi.",
    digital_records: "Inyandiko za digitale",
    digital_records_desc: "Kubona amateka yuzuye y'ubuvuzi no gukora gahunda z'ubuvuzi.",
    expand_practice: "Kwagura ubuvuzi bwawe",
    expand_practice_desc: "Huza n'abahinzi benshi kandi uteze imbere ubucuruzi bwawe bw'ubuvuzi bw'amatungo.",
    
    // CTA
    ready_transform: "Witeguye guhindura ubuvuzi bw'amatungo yawe?",
    join_thousands: "Huza n'ibihumbi by'abahinzi n'abaganga b'amatungo basanzwe bakoresha VetConnect",
    get_started_now: "Tangira Nonaha",
    watch_demo: "Gerageza Kwinjira",
    
    // Steps
    step_register: "Iyandikishe",
    step_register_desc: "Kora konti yawe nka muganga w'amatungo cyangwa nyir'amatungo.",
    step_login: "Injira",
    step_login_desc: "Injira kugira ngo ubone dashboard yawe ukanahuza ibikorwa byawe mu buryo bwizewe.",
    step_connect: "Huza",
    step_connect_desc: "Ba nyir'amatungo bohereza ibyifuzo ku baganga b'amatungo bari hafi kugira ngo babone ubufasha.",
    step_book: "Gufata Ibiganiro",
    step_book_desc: "Hitamo serivisi, itariki, n'igihe cy'ibiganiro hamwe n'abaganga b'amatungo baboneka.",
    step_chat: "Ganira & Menyesha",
    step_chat_desc: "Ganira n'abaganga cyangwa ba nyiramatungo binyuze mu biganiro cyangwa ubutumwa.",
    step_manage: "Gucunga",
    step_manage_desc: "Kubona no kuvugurura inyandiko z'ubuzima bw'amatungo, amakuru y'inkingo, n'ubuvuzi.",
    step_rate: "Gutanga amanota",
    step_rate_desc: "Ba nyir'amatungo bashobora gutanga ibitekerezo kugira ngo bafashe kunoza serivisi za muganga.",
    step_admin: "Icyumba cy'ubuyobozi",
    step_admin_desc: "Abayobozi bacunga abakoresha, bareba raporo, kandi bagena igenamiterere rya sisitemu."
  }
}

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [lang, setLang] = useState('en')

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('preferred-language')
    if (savedLang && (savedLang === 'en' || savedLang === 'rw')) {
      setLang(savedLang)
    }
  }, [])

  // Save language preference when it changes
  const handleSetLang = (newLang: string) => {
    setLang(newLang)
    localStorage.setItem('preferred-language', newLang)
  }

  // Translation function
  const t = (key: string): string => {
    return translations[lang]?.[key] || translations['en']?.[key] || key
  }

  const value: LanguageContextType = {
    lang,
    setLang: handleSetLang,
    t
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

// Custom hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Helper function to get all translations for current language
export function useTranslations() {
  const { lang } = useLanguage()
  return translations[lang] || translations['en']
}