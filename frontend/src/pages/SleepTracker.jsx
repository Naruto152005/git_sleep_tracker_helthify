import { useState, useEffect, useCallback } from 'react'
import { sleepAPI } from '../services/api'

const SleepTracker = ({ userId }) => {
  // Calculate default dates (sleep today, wake tomorrow)
  const getDefaultDates = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return {
      sleep_date: today.toISOString().split('T')[0],
      wake_date: tomorrow.toISOString().split('T')[0]
    }
  }
  
  const defaultDates = getDefaultDates()
  
  const [formData, setFormData] = useState({
    sleep_date: defaultDates.sleep_date,
    sleep_time: '23:00',
    sleep_period: 'PM',
    wake_date: defaultDates.wake_date,
    wake_time: '07:00',
    wake_period: 'AM',
    mood: 3,
    sleep_quality: 3,
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [predictedQuality, setPredictedQuality] = useState(null)
  const [sleepDuration, setSleepDuration] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Convert 12-hour time to 24-hour format and create ISO datetime
      const sleepDateTime = convertTo24Hour(formData.sleep_date, formData.sleep_time, formData.sleep_period)
      const wakeDateTime = convertTo24Hour(formData.wake_date, formData.wake_time, formData.wake_period)
      
      await sleepAPI.createLog({
        user_id: userId,
        sleep_time: sleepDateTime,
        wake_time: wakeDateTime,
        mood: parseInt(formData.mood),
        sleep_quality: parseInt(formData.sleep_quality),
        notes: formData.notes
      })
      
      setSuccess(true)
      // Reset form
      const newDates = getDefaultDates()
      setFormData({
        sleep_date: newDates.sleep_date,
        sleep_time: '23:00',
        sleep_period: 'PM',
        wake_date: newDates.wake_date,
        wake_time: '07:00',
        wake_period: 'AM',
        mood: 3,
        sleep_quality: 3,
        notes: ''
      })
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to log sleep data')
    } finally {
      setLoading(false)
    }
  }

  const convertTo24Hour = useCallback((date, time, period) => {
    let [hours, minutes] = time.split(':')
    hours = parseInt(hours)
    
    // Normalize to 0-11 if the browser provided a 24h value
    // e.g., if value is 23 (11 PM) and user selected PM, 23 % 12 = 11, then 11 + 12 = 23.
    // e.g., if value is 23 (11 PM) and user selected AM, 23 % 12 = 11, then 11 + 0 = 11 (Correct AM).
    hours = hours % 12
    
    if (period === 'PM') {
      hours += 12
    }
    
    return `${date}T${hours.toString().padStart(2, '0')}:${minutes}:00`
  }, [])

  const calculateSleepDuration = useCallback(() => {
    try {
      const sleepDateTime = new Date(convertTo24Hour(formData.sleep_date, formData.sleep_time, formData.sleep_period))
      const wakeDateTime = new Date(convertTo24Hour(formData.wake_date, formData.wake_time, formData.wake_period))
      
      // Check if dates are valid
      if (isNaN(sleepDateTime.getTime()) || isNaN(wakeDateTime.getTime())) {
        return null
      }
      
      let durationMs = wakeDateTime - sleepDateTime
      
      // If duration is negative, assume sleep spans across midnight on the same day input
      if (durationMs < 0) {
        durationMs += 24 * 60 * 60 * 1000
      }
      
      // If duration is > 24h, it's likely a date logic issue (defaults). 
      // We'll calculate it as if it's within a 24h cycle for the suggestion if it makes more sense.
      if (durationMs > 24 * 60 * 60 * 1000) {
        durationMs %= (24 * 60 * 60 * 1000)
      }
      
      const hours = durationMs / (1000 * 60 * 60)
      
      // Safety check for display
      if (isNaN(hours) || hours <= 0) {
        return null
      }
      
      return Math.round(hours * 10) / 10 // Round to 1 decimal
    } catch (error) {
      console.error('Error calculating sleep duration:', error)
      return null
    }
  }, [formData.sleep_date, formData.sleep_time, formData.sleep_period, 
      formData.wake_date, formData.wake_time, formData.wake_period, convertTo24Hour])

  const predictSleepQuality = useCallback((hours) => {
    // Research-based sleep quality prediction
    // Optimal sleep: 7-9 hours
    // Quality factors: duration, sleep onset time
    
    if (hours < 4) return 1 // Very poor
    if (hours < 6) return 2 // Poor
    if (hours >= 7 && hours <= 9) return 5 // Excellent (optimal range)
    if (hours >= 6 && hours < 7) return 4 // Good
    if (hours > 9 && hours <= 10) return 4 // Good (slightly oversleeping)
    if (hours > 10) return 3 // Fair (oversleeping)
    return 3 // Default to fair
  }, [])

  // Calculate sleep duration and predict quality
  useEffect(() => {
    const duration = calculateSleepDuration()
    setSleepDuration(duration)
    
    if (duration !== null && !isNaN(duration) && duration > 0) {
      const predicted = predictSleepQuality(duration)
      setPredictedQuality(predicted)
    } else {
      setPredictedQuality(null)
    }
  }, [calculateSleepDuration, predictSleepQuality])

  const applySuggestedQuality = () => {
    if (predictedQuality !== null) {
      setFormData(prev => ({
        ...prev,
        sleep_quality: predictedQuality
      }))
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
      <h1 className="text-3xl font-display font-bold text-white mb-6">Sleep Tracker</h1>

      <div className="glass-card p-8 border-white/5 shadow-2xl shadow-[#0B0F19]/50">
        <h2 className="text-2xl font-display font-semibold text-white mb-6">Log Your Sleep</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sleep Date */}
          <div>
            <label htmlFor="sleep_date" className="block text-sm font-medium text-slate-300 mb-2">
              Sleep Date
            </label>
            <input
              type="date"
              id="sleep_date"
              name="sleep_date"
              required
              value={formData.sleep_date}
              onChange={handleChange}
              className="input-premium"
            />
          </div>

          {/* Sleep Time */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Sleep Time
            </label>
            <div className="flex gap-2">
              <input
                type="time"
                id="sleep_time"
                name="sleep_time"
                required
                value={formData.sleep_time}
                onChange={handleChange}
                className="input-premium flex-1"
              />
              <select
                name="sleep_period"
                value={formData.sleep_period}
                onChange={handleChange}
                className="input-premium w-24"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          {/* Wake Date */}
          <div>
            <label htmlFor="wake_date" className="block text-sm font-medium text-slate-300 mb-2">
              Wake Date
            </label>
            <input
              type="date"
              id="wake_date"
              name="wake_date"
              required
              value={formData.wake_date}
              onChange={handleChange}
              className="input-premium"
            />
          </div>

          {/* Wake Time */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Wake Time
            </label>
            <div className="flex gap-2">
              <input
                type="time"
                id="wake_time"
                name="wake_time"
                required
                value={formData.wake_time}
                onChange={handleChange}
                className="input-premium flex-1"
              />
              <select
                name="wake_period"
                value={formData.wake_period}
                onChange={handleChange}
                className="input-premium w-24"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          {/* Sleep Duration Preview */}
          {sleepDuration !== null && (
            <div className="bg-[#0B0F19]/50 rounded-xl p-5 border border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium tracking-wide uppercase text-xs">Estimated Duration</span>
                <span className="text-white font-display font-bold text-xl">{sleepDuration} <span className="text-slate-400 text-sm font-normal">hours</span></span>
              </div>
              
              {predictedQuality !== null && (
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-slate-400 font-medium tracking-wide uppercase text-xs">Suggested Quality Rating</span>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-display font-bold text-xl flex items-center gap-1">
                      {predictedQuality}
                      <span className="text-yellow-500 text-sm">★</span>
                    </span>
                    <button
                      type="button"
                      onClick={applySuggestedQuality}
                      className="text-xs font-semibold px-3 py-1.5 bg-primary-600/20 hover:bg-primary-600 border border-primary-500/50 text-primary-300 hover:text-white rounded-md transition-all duration-300"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Morning Mood (1-5)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, mood: value }))}
                  className={`flex-1 py-3 rounded-xl transition-all duration-200 font-medium ${
                    formData.mood === value
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 ring-2 ring-primary-500 ring-offset-2 ring-offset-[#0B0F19]'
                      : 'bg-[#0B0F19] text-slate-400 hover:bg-white/5 border border-white/5 hover:border-white/10 hover:text-white'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Sleep Quality */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Sleep Quality (1-5)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, sleep_quality: value }))}
                  className={`flex-1 py-3 rounded-xl transition-all duration-200 font-medium ${
                    formData.sleep_quality === value
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 ring-2 ring-purple-500 ring-offset-2 ring-offset-[#0B0F19]'
                      : 'bg-[#0B0F19] text-slate-400 hover:bg-white/5 border border-white/5 hover:border-white/10 hover:text-white'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Anything notable about your sleep? (e.g., woke up multiple times, had caffeine late, etc.)"
              className="input-premium resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-lg shadow-xl"
            >
              {loading ? 'Logging Data...' : 'Log Sleep Data'}
            </button>
          </div>

          {/* Status Messages */}
          {success && (
            <div className="mt-4 p-4 bg-green-900/30 border border-green-800 rounded-md">
              <p className="text-green-400 text-center">Sleep data logged successfully!</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-900/30 border border-red-800 rounded-md">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default SleepTracker
