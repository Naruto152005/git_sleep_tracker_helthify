import { useState, useEffect } from 'react'
import { coachAPI, authAPI } from '../services/api'
import { 
  SparklesIcon, 
  ExclamationTriangleIcon, 
  ClipboardDocumentCheckIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'

const DietTracker = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('recommendation')
  const [dietPlan, setDietPlan] = useState('')
  const [allergies, setAllergies] = useState('')
  const [dietType, setDietType] = useState('non-veg')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchProfile()
  }, [userId])

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile(userId)
      if (response.data && response.data.profile) {
        setAllergies(response.data.profile.allergies || '')
        setDietType(response.data.profile.diet_type || 'non-veg')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleUpdateAllergies = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      await authAPI.updateProfile(userId, {
        profile: { allergies, diet_type: dietType }
      })
      setMessage({ type: 'success', text: 'Dietary preferences updated successfully!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  const generateDietPlan = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })
    try {
      const response = await coachAPI.getDietPlan(userId)
      setDietPlan(response.data.diet_plan)
      setActiveTab('recommendation')
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to generate diet plan' })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPlan = () => {
    if (!dietPlan) return
    
    const blob = new Blob([dietPlan], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const date = new Date().toISOString().split('T')[0]
    a.download = `Helthify_Diet_Plan_${date}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-display font-bold text-white">AI Diet Nutritionist</h1>
        <button
          onClick={generateDietPlan}
          disabled={loading}
          className="btn-primary flex items-center shadow-lg shadow-primary-500/20"
        >
          <SparklesIcon className="h-5 w-5 mr-2" />
          {loading ? 'Analyzing Data...' : 'Generate My Diet Plan'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('recommendation')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'recommendation'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
            }`}
          >
            Diet Recommendation
          </button>
          <button
            onClick={() => setActiveTab('allergies')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'allergies'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
            }`}
          >
            Allergies & Restrictions
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'recommendation' ? (
          <div className="space-y-6">
            {dietPlan ? (
              <div className="glass-card p-8 border-white/5 shadow-xl prose prose-invert max-w-none">
                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3 text-primary-400">
                    <ClipboardDocumentCheckIcon className="h-8 w-8" />
                    <h2 className="text-2xl font-display font-semibold m-0 text-white">Your Personalized Plan</h2>
                  </div>
                  <button
                    onClick={handleDownloadPlan}
                    className="flex items-center gap-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg transition-colors"
                    title="Download plan as text file"
                  >
                    <span>📥</span>
                    <span>Download</span>
                  </button>
                </div>
                <div className="text-slate-300 leading-relaxed font-medium">
                  {dietPlan.split('\n').map((line, idx) => {
                    if (line.trim() === '') return <br key={idx} />;
                    
                    // Render bold text
                    const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
                    
                    // Render list items
                    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                      return (
                        <li key={idx} className="ml-6 mb-2 list-disc marker:text-primary-500" dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[-*]\s+/, '') }} />
                      );
                    }
                    
                    return <p key={idx} className="mb-2" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
                  })}
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 text-sm text-slate-400 italic">
                  Note: This plan is analyzed based on your recent sleep cycles and productivity trends.
                </div>
              </div>
            ) : (
              <div className="glass-card p-16 border-white/5 text-center flex flex-col items-center justify-center">
                <div className="text-7xl mb-6 transform hover:scale-110 transition-transform duration-300">🥗</div>
                <h3 className="text-2xl font-display font-semibold text-white mb-3">No Diet Plan Generated Yet</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto text-lg">
                  Click the button above to let Gemini analyze your sleep and productivity patterns to create a tailored nutrition guide.
                </p>
              </div>
            )}

            {/* Educational Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card glass-card-hover p-6 border-white/5 bg-gradient-to-br from-[#0B0F19] to-[#0B0F19]/50">
                <h3 className="text-lg font-display font-medium text-white mb-3 flex items-center">
                  <span className="text-yellow-500 mr-3 text-xl">💡</span>
                  Sleep & Diet
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Foods rich in tryptophan (like turkey or milk) and complex carbs can help signal your body to produce melatonin for better sleep.
                </p>
              </div>
              <div className="glass-card glass-card-hover p-6 border-white/5 bg-gradient-to-br from-[#0B0F19] to-[#0B0F19]/50">
                <h3 className="text-lg font-display font-medium text-white mb-3 flex items-center">
                  <span className="text-blue-500 mr-3 text-xl">🚀</span>
                  Focus Foods
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Berries, nuts, and healthy fats (Omega-3s) are known to improve cognitive function and sustained focus throughout the day.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 border-white/5 max-w-2xl">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
              <UserCircleIcon className="h-8 w-8 text-primary-400" />
              <h2 className="text-2xl font-display font-semibold text-white m-0">Dietary Preferences</h2>
            </div>
            
            <form onSubmit={handleUpdateAllergies} className="space-y-8">
              {/* Diet Type Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">
                  Diet Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setDietType('veg')}
                    className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                      dietType === 'veg'
                        ? 'border-green-500/50 bg-green-500/10 text-green-400 shadow-lg shadow-green-500/20'
                        : 'border-white/5 bg-[#0B0F19] text-slate-400 hover:border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-2xl transform transition-transform group-hover:scale-110">🍏</span>
                    <span className="font-semibold">Vegetarian</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDietType('non-veg')}
                    className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                      dietType === 'non-veg'
                        ? 'border-red-500/50 bg-red-500/10 text-red-400 shadow-lg shadow-red-500/20'
                        : 'border-white/5 bg-[#0B0F19] text-slate-400 hover:border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-2xl transform transition-transform group-hover:scale-110">🍗</span>
                    <span className="font-semibold">Non-Veg</span>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="allergies" className="block text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">
                  Allergies or Restrictions
                </label>
                <textarea
                  id="allergies"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g., Peanuts, Dairy, Gluten-free, Vegan, No caffeine after 2pm"
                  className="input-premium h-32 resize-none"
                />
                <p className="mt-3 text-sm text-slate-500">
                  The AI Nutritionist will take these into account when generating your plans.
                </p>
              </div>

              {message.text && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${
                  message.type === 'success' ? 'bg-green-900/40 border border-green-700 text-green-200' : 'bg-red-900/40 border border-red-700 text-red-200'
                }`}>
                  {message.type === 'error' && <ExclamationTriangleIcon className="h-5 w-5" />}
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full text-lg shadow-xl"
              >
                {saving ? 'Saving...' : 'Save Dietary Preferences'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default DietTracker
