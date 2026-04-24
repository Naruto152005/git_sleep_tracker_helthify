import { useState } from 'react'
import { productivityAPI } from '../services/api'

const ProductivityTracker = ({ userId }) => {
  const [formData, setFormData] = useState({
    productivity_score: 5,
    focus_level: 3,
    tasks_completed: 0,
    energy_level: 3,
    notes: '',
    diet_notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      await productivityAPI.createLog({
        user_id: userId,
        ...formData
      })
      
      setSuccess(true)
      setFormData({
        productivity_score: 5,
        focus_level: 3,
        tasks_completed: 0,
        energy_level: 3,
        notes: '',
        diet_notes: ''
      })
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to log productivity data')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-white mb-6">Productivity Tracker</h1>

      <div className="glass-card p-8 border-white/5 shadow-2xl shadow-[#0B0F19]/50">
        <h2 className="text-2xl font-display font-semibold text-white mb-6">Log Your Productivity</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Productivity Score */}
          <div>
            <label htmlFor="productivity_score" className="block text-sm font-medium text-slate-300 mb-2">
              Productivity Score: {formData.productivity_score}/10
            </label>
            <input
              type="range"
              id="productivity_score"
              name="productivity_score"
              min="1"
              max="10"
              value={formData.productivity_score}
              onChange={handleChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1 dark:text-slate-400">
              <span>Very Low</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Focus Level */}
          <div>
            <label htmlFor="focus_level" className="block text-sm font-medium text-slate-300 mb-2">
              Focus Level: {formData.focus_level}/5
            </label>
            <input
              type="range"
              id="focus_level"
              name="focus_level"
              min="1"
              max="5"
              value={formData.focus_level}
              onChange={handleChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1 dark:text-slate-400">
              <span>Distracted</span>
              <span>Highly Focused</span>
            </div>
          </div>

          {/* Tasks Completed */}
          <div>
            <label htmlFor="tasks_completed" className="block text-sm font-medium text-slate-300 mb-2">
              Tasks Completed Today
            </label>
            <input
              type="number"
              id="tasks_completed"
              name="tasks_completed"
              min="0"
              value={formData.tasks_completed}
              onChange={handleChange}
              className="input-premium"
            />
          </div>

          {/* Energy Level */}
          <div>
            <label htmlFor="energy_level" className="block text-sm font-medium text-slate-300 mb-2">
              Energy Level: {formData.energy_level}/5
            </label>
            <input
              type="range"
              id="energy_level"
              name="energy_level"
              min="1"
              max="5"
              value={formData.energy_level}
              onChange={handleChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1 dark:text-slate-400">
              <span>⚡ Exhausted</span>
              <span>🔋 Energized</span>
            </div>
          </div>

          {/* Diet Notes */}
          <div>
            <label htmlFor="diet_notes" className="block text-sm font-medium text-slate-300 mb-2">
              Diet / Meals (Optional)
            </label>
            <textarea
              id="diet_notes"
              name="diet_notes"
              rows="2"
              value={formData.diet_notes}
              onChange={handleChange}
              placeholder="What did you eat today? (e.g., Heavy lunch, lots of coffee, balanced dinner)"
              className="input-premium resize-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-300 mb-2">
              General Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              placeholder="What affected your productivity today?"
              className="input-premium resize-none"
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-900/50 border border-red-700 p-3">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-900/50 border border-green-700 p-3">
              <p className="text-sm text-green-200">Productivity data logged successfully!</p>
            </div>
          )}

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-lg shadow-xl"
            >
              {loading ? 'Logging Data...' : 'Log Productivity Data'}
            </button>
          </div>
        </form>
      </div>

      {/* Tips Card */}
      <div className="mt-6 glass-card p-6 border-white/5 bg-gradient-to-br from-primary-900/20 to-purple-900/20">
        <h3 className="text-lg font-display font-semibold text-white mb-3">📊 Productivity Tracking Tips</h3>
        <ul className="space-y-2 text-slate-300 text-sm">
          <li className="flex gap-2"><span>•</span><span>Track daily to identify patterns between sleep and productivity</span></li>
          <li className="flex gap-2"><span>•</span><span>Be realistic about your scores - honesty helps the AI better</span></li>
          <li className="flex gap-2"><span>•</span><span>Note factors like caffeine, exercise, or stress levels</span></li>
          <li className="flex gap-2"><span>•</span><span>Review correlations with your sleep patterns regularly</span></li>
        </ul>
      </div>
    </div>
  )
}

export default ProductivityTracker
