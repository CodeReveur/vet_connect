import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface NavBarProps {
  onNavigate?: (page: string) => void;
}

interface UserInfo {
  id: string;
  name: string;
  full_name: string;
  email: string;
  role: 'owner' | 'vet' | 'admin';
}

const translations: any = {
  en: {
    welcome: "Welcome",
    dashboard: "Dashboard",
    myAnimals: "My Animals", 
    appointments: "Appointments",
    healthRecords: "Health Records",
    findVets: "Find Vets",
    messages: "Messages",
    vetDashboard: "Vet Dashboard",
    myClients: "My Clients",
    schedule: "Schedule",
    adminPanel: "Admin Panel",
    users: "Users",
    reports: "Reports",
    settings: "Settings",
    profile: "Profile",
    logout: "Logout",
    owner: "Animal Owner",
    vet: "Veterinarian",
    admin: "Administrator"
  },
  rw: {
    welcome: "Murakaza neza",
    dashboard: "Ikibanza",
    myAnimals: "Amatungo yanjye",
    appointments: "Ibihe by'ubuvuzi",
    healthRecords: "Inyandiko z'ubuzima",
    findVets: "Shaka umuvuzi",
    messages: "Ubutumwa",
    vetDashboard: "Ikibanza cy'umuvuzi",
    myClients: "Abakiriya banjye",
    schedule: "Gahunda",
    adminPanel: "Ubuyobozi",
    users: "Abakoresha",
    reports: "Raporo",
    settings: "Igenamiterere",
    profile: "Umwirondoro",
    logout: "Sohoka",
    owner: "Nyir'itungo",
    vet: "Umuvuzi w'amatungo",
    admin: "Umuyobozi"
  }
}

const VetConnectSidebar = ({ onNavigate }: NavBarProps) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState('en');
  const pathname = usePathname();
  const t = translations[lang];

  useEffect(() => {
    // Get user info from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUserInfo(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user info:', error);
      }
    } else {
        window.location.assign("/login")
    }

    // Get language preference
    const savedLang = localStorage.getItem('language') || 'en';
    setLang(savedLang);
  }, []);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('vet-sidebar');
      const toggleBtn = document.getElementById('toggle-sidebar');
      
      if (isOpen && sidebar && !sidebar.contains(event.target as Node) && 
          toggleBtn && !toggleBtn.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Role-based menu items
  const getMenuItems = () => {
    if (!userInfo) return [];

    switch (userInfo.role) {
      case 'owner':
        return [
          { name: t.dashboard, url: "/dashboard", icon: "bi bi-grid" },
          { name: t.myAnimals, url: "/dashboard/owner/animals", icon: "bi bi-piggy-bank" },
          { name: t.appointments, url: "/dashboard/owner/appointments", icon: "bi bi-calendar-check" },
          { name: t.healthRecords, url: "/dashboard/owner/health-records", icon: "bi bi-file-medical" },
          { name: t.findVets, url: "/dashboard/owner/find-vets", icon: "bi bi-search" },
          { name: t.messages, url: "/dashboard/owner/messages", icon: "bi bi-chat-dots" },
        ];
      case 'vet':
        return [
          { name: t.vetDashboard, url: "/dashboard", icon: "bi bi-grid" },
          { name: t.myClients, url: "/dashboard/vet/clients", icon: "bi bi-people" },
          { name: t.appointments, url: "/dashboard/vet/appointments", icon: "bi bi-calendar-week" },
          { name: t.healthRecords, url: "/dashboard/vet/medical-records", icon: "bi bi-file-medical" },
          { name: t.messages, url: "/dashboard/vet/messages", icon: "bi bi-chat-dots" },
        ];
      case 'admin':
        return [
          { name: t.adminPanel, url: "/dashboard/admin/", icon: "bi bi-speedometer2" },
          { name: t.users, url: "/dashboard/admin/users", icon: "bi bi-people-fill" },
          { name: t.myAnimals, url: "/dashboard/admin/animals", icon: "bi bi-piggy-bank" },
          { name: t.appointments, url: "/dashboard/admin/appointments", icon: "bi bi-calendar3" },
          { name: t.messages, url: "/dashboard/admin/messages", icon: "bi bi-chat-dots" },
        ];
      default:
        return [];
    }
  };

  const userActions = [
    { name: t.profile, url: `/dashboard/profile`, icon: "bi bi-person-circle" },
    { name: t.logout, url: "#", icon: "bi bi-box-arrow-left", action: 'logout' },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/login', { method: 'DELETE', credentials: 'include' });
      localStorage.removeItem('user');
      window.location.assign('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'rw' : 'en';
    setLang(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <>
      {/* Toggle Button - Mobile */}
      <button
        id="toggle-sidebar"
        className="lg:hidden fixed top-4 left-4 z-50 bg-green-600 text-white p-3 rounded-lg shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className={`bi ${isOpen ? 'bi-x-lg' : 'bi-list'} text-xl`}></i>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        id="vet-sidebar"
        className={`fixed top-0 left-0 h-screen w-72 bg-white border-r border-gray-200 shadow-xl z-40 transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Link href="/" className="flex items-center text-green-700 text-2xl font-bold">
                <span className="text-3xl mr-2">🐾</span>
                VetConnect
              </Link>
              
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="text-gray-600 hover:text-green-600 transition-colors"
                title={lang === 'en' ? 'Switch to Kinyarwanda' : 'Switch to English'}
              >
                <span className="text-sm font-medium">{lang === 'en' ? 'RW' : 'EN'}</span>
              </button>
            </div>

            {/* User Profile */}
            {userInfo && (
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.replace("/dashboard/profile")}>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <i className={`bi ${userInfo.role === 'vet' ? 'bi-heart-pulse' : 'bi-person'} text-green-600 text-xl`}></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{t.welcome}</p>
                  <h3 className="font-semibold text-gray-900 truncate">
                    {userInfo.full_name || userInfo.name}
                  </h3>
                  <p className="text-xs text-green-600 font-medium">
                    {t[userInfo.role]}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {getMenuItems().map((item, index) => (
                <li key={index}>
                  <Link href={item.url}>
                    <div
                      onClick={() => {
                        onNavigate?.(item.name);
                        setIsOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                        ${pathname === item.url
                          ? "bg-green-50 text-green-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      <i className={`${item.icon} text-lg`}></i>
                      <span>{item.name}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200">
            <ul className="space-y-1">
              {userActions.map((item, index) => (
                <li key={index}>
                  {item.action === 'logout' ? (
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                      <i className={`${item.icon} text-lg`}></i>
                      <span>{item.name}</span>
                    </button>
                  ) : (
                    <Link href={item.url}>
                      <div
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                          ${pathname === item.url
                            ? "bg-green-50 text-green-700 font-medium"
                            : "text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        <i className={`${item.icon} text-lg`}></i>
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
};

export default VetConnectSidebar;