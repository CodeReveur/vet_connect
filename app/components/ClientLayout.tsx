'use client'
import { ReactNode } from 'react'
import Navbar from './app/navbar'
import Footer from './app/footer'
import { LanguageProvider } from './app/lang'
import { usePathname } from 'next/navigation'
import VetConnectSidebar from './app/dashBar'

interface ClientLayoutProps {
  children: ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {

    const pathname = usePathname();
    const isAuth = pathname.startsWith("/login") || pathname.startsWith("/register");
    const isDash = pathname.startsWith("/dashboard");
  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col">
        {!isAuth && !isDash && <Navbar />}
        {isDash && <VetConnectSidebar />}
        {isDash ? 
          <main id="main-content" className="flex-grow lg:ml-72 p-4 bg-slate-50">
            {children}
          </main> 
        : 
          <main id="main-content" className="flex-grow">
            {children}
          </main> 
        }
        {!isAuth && !isDash && <Footer />}
      </div>
    </LanguageProvider>
  )
}