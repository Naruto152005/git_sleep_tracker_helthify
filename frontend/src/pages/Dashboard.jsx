import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { sleepAPI, productivityAPI, coachAPI } from '../services/api'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { StarIcon, FaceSmileIcon } from '@heroicons/react/24/solid'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const Dashboard = ({ userId }) => {
  const [sleepAnalytics, setSleepAnalytics] = useState(null)
  const [sleepLogs, setSleepLogs] = useState([])
  const [productivityLogs, setProductivityLogs] = useState([])
  const [recommendation, setRecommendation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState(7) // Default 7 days
  const [showClearModal, setShowClearModal] = useState(false)
  const [clearLoading, setClearLoading] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [userId, dateRange])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch analytics and logs in parallel
      const [analyticsRes, logsRes, prodLogsRes] = await Promise.all([
        sleepAPI.getAnalytics(userId, dateRange).catch(err => {
          console.error('Analytics error:', err)
          return { data: { analytics: null } }
        }),
        sleepAPI.getLogs(userId, dateRange).catch(err => {
          console.error('Logs error:', err)
          return { data: { logs: [] } }
        }),
        productivityAPI.getLogs(userId, dateRange).catch(err => {
          console.error('Productivity logs error:', err)
          return { data: { logs: [] } }
        })
      ])

      console.log('Analytics:', analyticsRes.data.analytics)
      console.log('Logs:', logsRes.data.logs)
      console.log('Logs with dates:', logsRes.data.logs.map(log => ({ date: log.date, created_at: log.created_at })))

      setSleepAnalytics(analyticsRes.data.analytics)
      setSleepLogs(logsRes.data.logs || [])
      setProductivityLogs(prodLogsRes.data.logs || [])
      
      // Fetch recommendation independently so it doesn't block the dashboard UI
      coachAPI.getRecommendation(userId)
        .then(recRes => setRecommendation(recRes.data.recommendation))
        .catch(() => setRecommendation('Welcome! Start tracking your sleep to get personalized recommendations.'))
        
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = {
    labels: sleepLogs.slice().reverse().map(log => {
      // Use the actual date field from the log, or fall back to created_at
      const dateStr = log.date || log.created_at
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: 'Sleep Duration (hours)',
        data: sleepLogs.slice().reverse().map(log => log.duration_hours),
        backgroundColor: 'rgba(14, 165, 233, 0.7)',
        borderColor: 'rgb(14, 165, 233)',
        borderWidth: 2,
      },
      {
        label: 'Sleep Quality (1-5)',
        data: sleepLogs.slice().reverse().map(log => log.sleep_quality),
        backgroundColor: 'rgba(139, 92, 246, 0.7)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: { 
          color: '#cbd5e1',
          padding: 20,
          font: { family: 'Inter', size: 13, weight: '500' }
        }
      },
      title: {
        display: true,
        text: `Last ${dateRange} Days Sleep Trends`,
        color: '#f8fafc',
        font: { family: 'Outfit', size: 20, weight: '600' },
        padding: { top: 10, bottom: 30 }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 16,
        cornerRadius: 12,
        titleFont: { family: 'Outfit', size: 14, weight: '600' },
        bodyFont: { family: 'Inter', size: 13 },
        displayColors: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        border: { display: false },
        ticks: { 
          color: '#64748b',
          font: { family: 'Inter', size: 12 },
          padding: 10
        },
        grid: { 
          color: 'rgba(255,255,255,0.05)',
          drawBorder: false,
        }
      },
      x: {
        border: { display: false },
        ticks: { 
          color: '#64748b',
          font: { family: 'Inter', size: 12 },
          padding: 10
        },
        grid: { 
          display: false,
          drawBorder: false
        }
      }
    },
    elements: {
      bar: {
        borderRadius: 6,
        borderSkipped: false,
      }
    }
  }

  // Update chart options for dark mode
  const updateChartOptionsForTheme = (isDark) => {
    if (isDark) {
      chartOptions.plugins.legend.labels.color = '#94a3b8';
      chartOptions.plugins.title.color = '#e2e8f0';
      chartOptions.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.9)';
      chartOptions.plugins.tooltip.titleColor = '#e2e8f0';
      chartOptions.plugins.tooltip.bodyColor = '#cbd5e1';
      chartOptions.plugins.tooltip.borderColor = '#475569';
      chartOptions.scales.y.ticks.color = '#94a3b8';
      chartOptions.scales.y.grid.color = '#334155';
      chartOptions.scales.x.ticks.color = '#94a3b8';
      chartOptions.scales.x.grid.color = '#334155';
    } else {
      chartOptions.plugins.legend.labels.color = '#64748b';
      chartOptions.plugins.title.color = '#64748b';
      chartOptions.plugins.tooltip.backgroundColor = 'rgba(255, 255, 255, 0.9)';
      chartOptions.plugins.tooltip.titleColor = '#1e293b';
      chartOptions.plugins.tooltip.bodyColor = '#334155';
      chartOptions.plugins.tooltip.borderColor = '#e2e8f0';
      chartOptions.scales.y.ticks.color = '#64748b';
      chartOptions.scales.y.grid.color = '#e2e8f0';
      chartOptions.scales.x.ticks.color = '#64748b';
      chartOptions.scales.x.grid.color = '#e2e8f0';
    }
  };

  // Check for dark mode and update chart options
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    updateChartOptionsForTheme(isDark);
  }, []);

  // Watch for theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      const isDark = document.documentElement.classList.contains('dark');
      updateChartOptionsForTheme(isDark);
      // Force chart re-render
      setSleepLogs(prev => [...prev]);
    };

    // Listen for theme changes
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const handleClearData = async () => {
    try {
      setClearLoading(true)
      
      // Clear both sleep and productivity data
      await Promise.all([
        sleepAPI.clearLogs(userId),
        productivityAPI.clearLogs(userId)
      ])
      
      // Refresh dashboard data
      await fetchDashboardData()
      
      setShowClearModal(false)
      alert('All data cleared successfully!')
    } catch (error) {
      console.error('Error clearing data:', error)
      alert('Failed to clear data. Please try again.')
    } finally {
      setClearLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Selector Skeleton */}
            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-300 bg-slate-700 rounded animate-pulse h-6 w-12"></div>
              <div className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-md animate-pulse h-10 w-32"></div>
            </div>
            
            {/* Clear Data Button Skeleton */}
            <div className="px-4 py-2 bg-slate-700 rounded-md animate-pulse h-10 w-32"></div>
          </div>
        </div>

        {/* Recommendation Card Skeleton */}
        <div className="bg-gradient-to-r from-primary-600/30 to-purple-600/30 rounded-lg p-6 shadow-lg animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-slate-700 rounded w-full"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="glass-card p-6 animate-pulse border-white/5">
              <div className="h-4 bg-slate-700/50 rounded w-2/3 mb-4"></div>
              <div className="h-8 bg-slate-700/50 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-slate-700/50 rounded w-1/3"></div>
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 animate-pulse">
          <div className="h-64 bg-slate-700 rounded w-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-300">Date Range:</span>
            <select
              id="dateRange"
              value={dateRange}
              onChange={(e) => setDateRange(Number(e.target.value))}
              className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
          
          {/* Clear Data Button */}
          {sleepLogs.length > 0 && (
            <button
              onClick={() => setShowClearModal(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors flex items-center gap-2"
            >
              <span>🗑️</span>
              <span>Clear All Data</span>
            </button>
          )}
        </div>
      </div>

      {/* AI Recommendation Card */}
      {recommendation ? (
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg p-6 shadow-lg transition-all duration-500 ease-in-out">
          <h2 className="text-xl font-semibold text-white mb-2 flex items-center">
            <span className="mr-2">✨</span>
            Today's AI Recommendation
          </h2>
          <p className="text-white text-lg">{recommendation}</p>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-primary-600/30 to-purple-600/30 rounded-lg p-6 shadow-lg animate-pulse">
          <div className="h-6 bg-slate-700/50 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-slate-700/50 rounded w-full"></div>
        </div>
      )}

      {/* Stats Grid */}
      {sleepAnalytics && sleepAnalytics.total_entries > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card glass-card-hover p-6 border-white/5 flex flex-col justify-center">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Average Sleep Duration</h3>
            <div className="flex items-end gap-3 mt-2">
              <p className="text-4xl font-display font-bold text-white leading-none">{sleepAnalytics.average_duration}</p>
              <span className="text-slate-400 text-lg mb-1">hours</span>
            </div>
            <p className="text-sm text-primary-400 mt-3 flex items-center gap-1"><span>📈</span> Last {dateRange} days</p>
          </div>

          <div className="glass-card glass-card-hover p-6 border-white/5 flex flex-col justify-center">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Average Sleep Quality</h3>
            <div className="flex items-end gap-3 mt-2">
              <p className="text-4xl font-display font-bold text-white leading-none">{sleepAnalytics.average_quality}</p>
              <span className="text-slate-400 text-lg mb-1">/ 5</span>
            </div>
            <p className="text-sm text-primary-400 mt-3 flex items-center gap-1"><span>⭐</span> Quality rating</p>
          </div>

          <div className="glass-card glass-card-hover p-6 border-white/5 flex flex-col justify-center">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Consistency Score</h3>
            <div className="flex items-end gap-3 mt-2">
              <p className="text-4xl font-display font-bold text-white leading-none">{sleepAnalytics.consistency_score}</p>
              <span className="text-slate-400 text-lg mb-1">%</span>
            </div>
            <p className="text-sm text-primary-400 mt-3 flex items-center gap-1"><span>🎯</span> Based on variance</p>
          </div>
        </div>
      )}

      {/* Sleep Trends Chart */}
      {sleepLogs.length > 0 ? (
        <div className="glass-card p-6 border-white/5 shadow-2xl shadow-[#0B0F19]/50">
          <Bar data={chartData} options={chartOptions} />
        </div>
      ) : (
        <div className="glass-card p-12 border-white/5 flex flex-col items-center justify-center text-center">
          <div className="text-6xl mb-6">📊</div>
          <h3 className="text-2xl font-display font-semibold text-white mb-3">No Sleep Data Yet</h3>
          <p className="text-slate-400 mb-8 max-w-sm">
            Start tracking your sleep to see beautiful trends and receive personalized AI insights.
          </p>
          <Link
            to="/sleep"
            className="btn-primary"
          >
            Log Sleep Data
          </Link>
        </div>
      )}

      {/* Sleep Logs Table */}
      {sleepLogs.length > 0 && (
        <div className="glass-card overflow-hidden border-white/5">
          <div className="px-6 py-5 border-b border-white/10 bg-white/5">
            <h2 className="text-xl font-display font-semibold text-white">Recent Sleep Logs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5">
              <thead className="bg-[#0B0F19]/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Duration</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Quality</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Mood</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-transparent">
                {sleepLogs.slice().reverse().slice(0, 5).map((log) => (
                  <tr key={log._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-medium">
                      {new Date(log.date || log.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {log.duration_hours}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      <div className="flex items-center">
                        <span className="mr-2">{log.sleep_quality}/5</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${
                                i < log.sleep_quality
                                  ? 'text-primary-400 fill-current'
                                  : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      <div className="flex items-center">
                        <span className="mr-2">{log.mood}/5</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <FaceSmileIcon
                              key={i}
                              className={`h-4 w-4 ${
                                i < log.mood
                                  ? 'text-purple-400 fill-current'
                                  : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-[#0B0F19]/50 border-t border-white/5">
            <Link
              to="/sleep"
              className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1"
            >
              View all sleep logs <span>→</span>
            </Link>
          </div>
        </div>
      )}

      {/* Productivity & Diet Logs Table */}
      {productivityLogs.length > 0 && (
        <div className="glass-card overflow-hidden border-white/5">
          <div className="px-6 py-5 border-b border-white/10 bg-white/5">
            <h2 className="text-xl font-display font-semibold text-white">Recent Productivity & Diet Logs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5">
              <thead className="bg-[#0B0F19]/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Score</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Focus</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Diet / Meals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-transparent">
                {productivityLogs.slice().reverse().slice(0, 5).map((log) => (
                  <tr key={log._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-medium">
                      {new Date(log.date || log.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {log.productivity_score}/10
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      <div className="flex items-center">
                        <span className="mr-2">{log.focus_level}/5</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${
                                i < log.focus_level
                                  ? 'text-primary-400 fill-current'
                                  : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 max-w-xs truncate">
                      {log.diet_notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-[#0B0F19]/50 border-t border-white/5">
            <Link
              to="/productivity"
              className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1"
            >
              View all productivity logs <span>→</span>
            </Link>
          </div>
        </div>
      )}

      {/* Clear Data Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full dark:bg-slate-800">
            <h3 className="text-lg font-medium text-slate-800 mb-4 dark:text-white">Clear All Data</h3>
            <p className="text-slate-600 mb-6 dark:text-slate-300">
              Are you sure you want to clear all sleep and productivity data? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                disabled={clearLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {clearLoading ? 'Clearing...' : 'Clear Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
