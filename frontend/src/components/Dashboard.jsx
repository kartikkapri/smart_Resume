import { motion } from 'framer-motion'
import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'

const Dashboard = ({ darkMode, setDarkMode, analysisHistory, setCurrentView, user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'history', name: 'History', icon: '📝' },
    { id: 'progress', name: 'Progress', icon: '📈' }
  ]

  const avgScore = analysisHistory.length > 0
    ? Math.round(analysisHistory.reduce((a, c) => a + c.score, 0) / analysisHistory.length)
    : 0

  const stats = [
    { label: 'Resumes Analyzed', value: analysisHistory.length, icon: '📄', color: 'text-blue-500' },
    { label: 'Avg Score', value: `${avgScore}%`, icon: '⭐', color: 'text-yellow-500' },
    { label: 'Best Score', value: analysisHistory.length > 0 ? `${Math.max(...analysisHistory.map(h => h.score))}%` : '0%', icon: '🏆', color: 'text-green-500' },
    { label: 'Skills to Learn', value: analysisHistory.length > 0 ? analysisHistory[0].missing : 0, icon: '🎯', color: 'text-purple-500' }
  ]

  const chartData = [...analysisHistory].reverse().slice(-8).map((h, i) => ({
    name: `#${i + 1}`,
    score: h.score,
    matched: h.matched,
    missing: h.missing,
    role: h.role
  }))

  const roleDistribution = analysisHistory.reduce((acc, h) => {
    acc[h.role] = (acc[h.role] || 0) + 1
    return acc
  }, {})
  const roleData = Object.entries(roleDistribution).map(([role, count]) => ({ role, count }))
  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className={`text-4xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {user ? `Welcome back, ${user.name}! 👋` : 'Dashboard 📊'}
            </h1>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Track your career progress</p>
          </div>
          <div className="flex gap-3">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentView('analyzer')}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg text-sm"
            >🔍 Analyzer</motion.button>
            {user && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'}`}
              >🚪 Logout</motion.button>
            )}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm shadow-lg ${darkMode ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900' : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white'}`}
            >{darkMode ? '☀️' : '🌙'}</motion.button>
          </div>
        </motion.div>

        <div className="flex gap-3 mb-8 overflow-x-auto">
          {tabs.map(tab => (
            <motion.button key={tab.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap text-sm ${activeTab === tab.id ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'}`}
            >{tab.icon} {tab.name}</motion.button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <motion.div key={i} whileHover={{ scale: 1.05, y: -5 }}
                  className={`glass rounded-2xl p-5 ${darkMode ? 'border-gray-700' : 'border-white'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{stat.icon}</span>
                    <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {chartData.length > 1 && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className={`glass rounded-2xl p-5 ${darkMode ? 'border-gray-700' : 'border-white'}`}>
                  <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>📈 Score History</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                      <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} stroke={darkMode ? '#9ca3af' : '#6b7280'} tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: darkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: 12 }} />
                      <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className={`glass rounded-2xl p-5 ${darkMode ? 'border-gray-700' : 'border-white'}`}>
                  <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>🎯 Skills per Analysis</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                      <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} tick={{ fontSize: 12 }} />
                      <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: darkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: 12 }} />
                      <Bar dataKey="matched" fill="#10b981" radius={[4, 4, 0, 0]} name="Matched" />
                      <Bar dataKey="missing" fill="#ef4444" radius={[4, 4, 0, 0]} name="Missing" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {roleData.length > 0 && (
              <div className={`glass rounded-2xl p-5 ${darkMode ? 'border-gray-700' : 'border-white'}`}>
                <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>🏷️ Roles Analyzed</h3>
                <div className="flex flex-wrap gap-3">
                  {roleData.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: `${COLORS[i % COLORS.length]}20` }}>
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{r.role}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 font-bold" style={{ color: COLORS[i % COLORS.length] }}>{r.count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysisHistory.length === 0 && (
              <div className={`glass rounded-2xl p-10 text-center ${darkMode ? 'border-gray-700' : 'border-white'}`}>
                <div className="text-6xl mb-4">📄</div>
                <p className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>No analysis yet</p>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Analyze your first resume to see insights here</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'progress' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`glass rounded-2xl p-6 ${darkMode ? 'border-gray-700' : 'border-white'}`}
          >
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>🎯 Score Progression</h2>
            {analysisHistory.length > 1 ? (
              <>
                <div className="space-y-4">
                  {analysisHistory.slice(0, 8).map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {item.role} — {item.date}
                        </span>
                        <span className={`text-sm font-bold ${item.score >= 70 ? 'text-green-500' : item.score >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {item.score}%
                        </span>
                      </div>
                      <div className={`h-2.5 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.score}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {analysisHistory.length >= 2 && (
                  <div className={`mt-6 p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {analysisHistory[0].score > analysisHistory[analysisHistory.length - 1].score
                        ? `📈 Score improved by ${analysisHistory[0].score - analysisHistory[analysisHistory.length - 1].score}% since first analysis!`
                        : `💪 Keep improving! Analyze more resumes to track growth.`}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Analyze at least 2 resumes to see progress tracking.</p>
            )}
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`glass rounded-2xl p-6 ${darkMode ? 'border-gray-700' : 'border-white'}`}
          >
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>📝 Analysis History</h2>
            {analysisHistory.length > 0 ? (
              <div className="space-y-3">
                {analysisHistory.map((item, i) => (
                  <motion.div key={i} whileHover={{ x: 4 }}
                    className={`flex items-center justify-between p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${item.score >= 70 ? 'bg-green-500' : item.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                        {item.score}%
                      </div>
                      <div>
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{item.role} Analysis</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.date} • {item.fileName}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-green-500">✓ {item.matched} matched</p>
                      <p className="text-red-400">✗ {item.missing} missing</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>No history available</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
