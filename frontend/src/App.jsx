import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useUser, useAuth, SignIn } from '@clerk/react'
import { setTokenProvider } from './services/api'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import SleepTracker from './pages/SleepTracker'
import ProductivityTracker from './pages/ProductivityTracker'
import AICoach from './pages/AICoach'
import DietTracker from './pages/DietTracker'
import LandingPage from './pages/LandingPage'
import './App.css'

function App() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { signOut, getToken } = useAuth()
  const [showLanding, setShowLanding] = useState(true)
  const [supabaseUserId, setSupabaseUserId] = useState(null)

  useEffect(() => {
    setTokenProvider(getToken)
    
    // Sync user with backend
    const syncUser = async () => {
      if (isSignedIn && user) {
        try {
          const token = await getToken()
          const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              email: user.primaryEmailAddress?.emailAddress,
              name: user.fullName || user.username
            })
          })
          
          if (response.ok) {
            const data = await response.json();
            setSupabaseUserId(data.user_id);
          }
        } catch (e) {
          console.error("Failed to sync user", e)
        }
      }
    }
    syncUser()
  }, [getToken, isSignedIn, user])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!isSignedIn) {
    if (showLanding) {
      return <LandingPage onGetStarted={() => setShowLanding(false)} />
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="flex w-full max-w-[1200px] min-h-[700px] glass-card border-white/5 overflow-hidden mx-4 relative z-10">
          {/* Left Side - Auth Form */}
          <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 md:p-16 bg-[#0B0F19]/80 backdrop-blur-md">
            <div className="w-full max-w-md mx-auto">
              <div className="flex items-center gap-3 mb-10 justify-center sm:justify-start">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <span className="text-2xl">🌙</span>
                </div>
                <span className="text-2xl font-display font-bold text-white tracking-tight">Helthify</span>
              </div>
              
              <div className="space-y-2 mb-10 text-center sm:text-left">
                <h2 className="text-4xl font-display font-black tracking-tight text-white leading-tight">
                  Welcome back
                </h2>
                <p className="text-slate-400 text-lg">
                  Sign in to continue your wellness journey.
                </p>
              </div>

              <div className="glass-card p-4 border-white/10 bg-white/5 shadow-2xl">
                <SignIn routing="hash" appearance={{
                  elements: {
                    formButtonPrimary: 'bg-primary-600 hover:bg-primary-500 text-sm normal-case h-11 rounded-xl shadow-lg shadow-primary-500/20 transition-all duration-300',
                    card: 'bg-transparent shadow-none w-full border-none p-0',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    socialButtonsBlockButton: 'border-white/10 text-white hover:bg-white/5 rounded-xl h-11',
                    socialButtonsBlockButtonText: 'text-white font-medium',
                    dividerLine: 'bg-white/10',
                    dividerText: 'text-slate-400 text-xs uppercase tracking-widest',
                    formFieldLabel: 'text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2',
                    formFieldInput: 'bg-[#0B0F19] border-white/10 text-white focus:border-primary-500 h-11 rounded-xl',
                    footerActionText: 'text-slate-400',
                    footerActionLink: 'text-primary-400 hover:text-primary-300 font-bold',
                    rootBox: 'w-full'
                  }
                }} />
              </div>
            </div>
          </div>
          
          {/* Right Side - Premium Graphic/Gradient */}
          <div className="hidden lg:flex flex-1 relative items-center justify-center bg-gradient-to-br from-primary-900/30 to-[#0B0F19] overflow-hidden p-16">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-20 grayscale mix-blend-overlay" />
            <div className="relative z-10 text-center max-w-md">
              <div className="mb-8 inline-block">
                <div className="w-20 h-20 bg-white/5 rounded-3xl backdrop-blur-xl border border-white/10 flex items-center justify-center text-4xl animate-pulse-slow">
                  ✨
                </div>
              </div>
              <h2 className="text-5xl font-display font-black text-white mb-6 leading-tight">
                Quality Sleep <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">
                  Better Results.
                </span>
              </h2>
              <p className="text-lg text-slate-300/80 leading-relaxed">
                Join thousands of students and professionals using AI to optimize their daily performance and well-being.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // We must wait until Supabase UUID is retrieved so queries don't fail
  if (!supabaseUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-xl">Syncing your data...</div>
      </div>
    )
  }

  const appUser = {
    id: supabaseUserId, // passing the REAL supersonic postgres UUID down!
    name: user.fullName || user.username || user.primaryEmailAddress?.emailAddress
  }

  return (
    <Router>
      <Layout user={appUser} onLogout={() => signOut()}>
        <Routes>
          <Route path="/" element={<Dashboard userId={appUser.id} />} />
          <Route path="/sleep" element={<SleepTracker userId={appUser.id} />} />
          <Route path="/productivity" element={<ProductivityTracker userId={appUser.id} />} />
          <Route path="/coach" element={<AICoach userId={appUser.id} />} />
          <Route path="/diet" element={<DietTracker userId={appUser.id} />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App