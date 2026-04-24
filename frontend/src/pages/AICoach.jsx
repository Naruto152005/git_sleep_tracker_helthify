import { useState, useEffect } from 'react'
import { coachAPI } from '../services/api'

const AICoach = ({ userId }) => {
  const [chatQuery, setChatQuery] = useState('')
  const [chatResponse, setChatResponse] = useState(null)
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)
  const [insightsLoading, setInsightsLoading] = useState(false)

  const handleVoiceChatOpen = () => {
    window.open(
      'https://elevenlabs.io/app/talk-to?agent_id=agent_7501ka6f6w8ve3q9z8vtyca5atd2',
      '_blank',
      'width=800,height=600,resizable=yes,scrollbars=yes'
    )
  }

  useEffect(() => {
    fetchInsights()
  }, [userId])

  const fetchInsights = async () => {
    try {
      setInsightsLoading(true)
      const response = await coachAPI.getInsights(userId)
      setInsights(response.data.insights)
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setInsightsLoading(false)
    }
  }

  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!chatQuery.trim()) return

    setLoading(true)
    try {
      const response = await coachAPI.chat({
        query: chatQuery,
        user_id: userId
      })
      setChatResponse(response.data.response)
      setChatQuery('')
    } catch (error) {
      console.error('Error getting chat response:', error)
      setChatResponse('Sorry, I could not process your request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (prediction) => {
    switch (prediction) {
      case 'high':
        return 'text-red-400 border-red-600 bg-red-900/30'
      case 'medium':
        return 'text-yellow-400 border-yellow-600 bg-yellow-900/30'
      case 'low':
        return 'text-green-400 border-green-600 bg-green-900/30'
      case 'preliminary':
        return 'text-blue-400 border-blue-600 bg-blue-900/30'
      default:
        return 'text-slate-400 border-slate-600 bg-slate-900/30'
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-display font-bold text-white">Helthify AI Coach</h1>

      {/* Predictive Insights */}
      <div className="glass-card p-6 border-white/5">
        <h2 className="text-2xl font-display font-semibold text-white mb-4">📊 Predictive Insights</h2>
        
        {insightsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-slate-400">Loading insights...</div>
          </div>
        ) : insights && insights.prediction !== 'insufficient_data' ? (
          <div className="space-y-4">
            <div className={`rounded-lg p-4 border ${getRiskColor(insights.prediction)}`}>
              <h3 className="text-lg font-semibold mb-2">
                Focus Risk Level: {insights.prediction.toUpperCase()}
              </h3>
              <p className="text-sm opacity-90">{insights.message}</p>
            </div>

            {insights.recent_sleep_quality && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-slate-300 text-sm">Recent Sleep Quality</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {insights.recent_sleep_quality}/5
                  </p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-slate-300 text-sm">Recent Sleep Duration</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {insights.recent_sleep_duration}h
                  </p>
                </div>
              </div>
            )}

            {insights.preventive_strategies && insights.preventive_strategies.length > 0 && (
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">💡 Preventive Strategies</h4>
                <ul className="space-y-2">
                  {insights.preventive_strategies.map((strategy, index) => (
                    <li key={index} className="text-slate-300 text-sm flex items-start">
                      <span className="mr-2">•</span>
                      <span>{strategy}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
            <div className="flex items-start space-x-3">
              <div className="text-4xl">📈</div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2">Start Your Journey to Better Insights</h3>
                <p className="text-slate-300 text-sm mb-4">
                  To receive personalized predictive insights, we need a bit more data. Here's how to get started:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-300">
                    <span className="mr-2">1️⃣</span>
                    <span>Track at least <strong className="text-white">3 nights of sleep</strong> in the Sleep Tracker</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <span className="mr-2">2️⃣</span>
                    <span>Log your <strong className="text-white">daily productivity</strong> in the Productivity Tracker</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <span className="mr-2">3️⃣</span>
                    <span>Return here to see <strong className="text-white">AI-powered predictions</strong> about your focus patterns</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-600">
                  <p className="text-xs text-slate-400">
                    💡 Tip: The more data you provide, the more accurate your insights will be!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Assistant */}
      <div className="glass-card p-6 border-white/5">
        <h2 className="text-2xl font-display font-semibold text-white mb-4">💬 Quick-Tip Chat Assistant</h2>
        
        <form onSubmit={handleChatSubmit} className="space-y-4">
          <div>
            <label htmlFor="chat-query" className="sr-only">
              Ask a question
            </label>
            <div className="flex gap-2">
              <input
                id="chat-query"
                type="text"
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                placeholder="Ask me about sleep hygiene, productivity tips, or stress management..."
                className="input-premium flex-1"
              />
              <button
                type="submit"
                disabled={loading || !chatQuery.trim()}
                className="btn-primary"
              >
                {loading ? 'Thinking...' : 'Ask'}
              </button>
            </div>
          </div>

          {chatResponse && (
            <div className="bg-gradient-to-r from-primary-900/50 to-purple-900/50 rounded-lg p-4 border border-primary-600/50">
              <div className="text-white text-sm md:text-base leading-relaxed">
                {chatResponse.split('\n').map((line, idx) => {
                  if (line.trim() === '') return <br key={idx} />;
                  const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
                  if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                    return <li key={idx} className="ml-4 mb-1 list-disc" dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[-*]\s+/, '') }} />;
                  }
                  return <p key={idx} className="mb-2" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
                })}
              </div>
            </div>
          )}
        </form>

        {/* Suggested Questions */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Suggested Questions:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'How can I improve my sleep quality?',
              'What are good bedtime routines?',
              'How to stay focused while studying?',
              'Tips for managing stress?',
            ].map((question, index) => (
              <button
                key={index}
                onClick={() => setChatQuery(question)}
                className="text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-md text-sm text-white transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Voice Coach */}
      <div className="glass-card p-6 border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-display font-semibold text-white flex items-center gap-2">
            <span>🎤</span>
            <span>AI Voice Coach</span>
          </h2>
        </div>
        
        <p className="text-slate-300 text-sm mb-4">
          Talk to our AI sleep coach powered by ElevenLabs. Get personalized sleep advice through natural voice conversation.
        </p>

        <div className="bg-[#0B0F19]/50 rounded-2xl p-8 border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="text-center relative z-10">
            <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-500">🎙️</div>
            <h3 className="text-white font-display font-semibold mb-2 text-xl">Voice-Powered Sleep Guidance</h3>
            <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">
              Have a natural conversation with our AI sleep expert. Click the button below to open the voice chat interface.
            </p>
            
            <button
              onClick={handleVoiceChatOpen}
              className="btn-primary mx-auto flex items-center gap-3 px-8 rounded-full"
            >
              <span className="text-xl">🎙️</span>
              <span className="text-lg">Start Voice Chat</span>
              <span className="opacity-70">↗️</span>
            </button>
            
            <div className="flex flex-wrap justify-center gap-3 mt-8 text-xs text-slate-400">
              <span className="bg-white/5 px-4 py-1.5 rounded-full border border-white/10">✅ Voice Recognition</span>
              <span className="bg-white/5 px-4 py-1.5 rounded-full border border-white/10">✅ Natural Conversation</span>
              <span className="bg-white/5 px-4 py-1.5 rounded-full border border-white/10">✅ Personalized Advice</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sleep Hygiene Tips */}
      <div className="glass-card p-6 border-white/5">
        <h2 className="text-2xl font-display font-semibold text-white mb-6">😴 Sleep Hygiene Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="text-2xl mr-3">🌙</span>
              <div>
                <h4 className="text-white font-semibold">Consistent Schedule</h4>
                <p className="text-slate-300 text-sm">Go to bed and wake up at the same time daily</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">📱</span>
              <div>
                <h4 className="text-white font-semibold">Digital Detox</h4>
                <p className="text-slate-300 text-sm">Avoid screens 1 hour before bedtime</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">🛏️</span>
              <div>
                <h4 className="text-white font-semibold">Optimize Environment</h4>
                <p className="text-slate-300 text-sm">Keep bedroom cool, dark, and quiet</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="text-2xl mr-3">☕</span>
              <div>
                <h4 className="text-white font-semibold">Limit Caffeine</h4>
                <p className="text-slate-300 text-sm">Avoid caffeine after 2 PM</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">🏃</span>
              <div>
                <h4 className="text-white font-semibold">Regular Exercise</h4>
                <p className="text-slate-300 text-sm">Exercise regularly, but not close to bedtime</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">🧘</span>
              <div>
                <h4 className="text-white font-semibold">Relaxation Routine</h4>
                <p className="text-slate-300 text-sm">Practice meditation or deep breathing</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AICoach
