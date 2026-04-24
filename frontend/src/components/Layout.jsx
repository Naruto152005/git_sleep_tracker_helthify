import { Link, useLocation } from 'react-router-dom'
import { 
  HomeIcon, 
  MoonIcon, 
  ChartBarIcon, 
  SparklesIcon,
  ShoppingBagIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline'

const Layout = ({ children, user, onLogout }) => {
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Sleep Tracker', href: '/sleep', icon: MoonIcon },
    { name: 'Productivity', href: '/productivity', icon: ChartBarIcon },
    { name: 'AI Coach', href: '/coach', icon: SparklesIcon },
    { name: 'Diet', href: '/diet', icon: ShoppingBagIcon },
  ]

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      {/* Premium Glass Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0B0F19]/80 border-b border-white/5" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <MoonIcon className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <span className="ml-3 text-xl font-display font-bold text-white tracking-tight">Helthify</span>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-2 sm:items-center">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${isActive 
                          ? 'bg-primary-500/10 text-primary-400' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }
                      `}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className={`h-4 w-4 mr-2 ${isActive ? 'text-primary-400' : 'text-slate-400'}`} aria-hidden="true" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-slate-300">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
                <span className="text-sm font-medium text-slate-300">{user.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-white/10"
                aria-label="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 md:mr-2" aria-hidden="true" />
                <span className="hidden md:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {children}
      </main>
    </div>
  )
}

export default Layout