import { motion } from 'framer-motion'
import { useState } from 'react'

const Dashboard = ({ darkMode, setDarkMode, analysisHistory, setCurrentView }) => {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'history', name: 'History', icon: '📝' },
    { id: 'progress', name: 'Progress', icon: '📈' }
  ]

  const stats = [
    { label: 'Resumes Analyzed', value: analysisHistory.length, icon: '📄', color: 'blue' },
    { label: 'Avg Score', value: analysisHistory.length > 0 ? Math.round(analysisHistory.reduce((acc, curr) => acc + curr.score, 0) / analysisHistory.length) + '%' : '0%', icon: '⭐', color: 'yellow' },
    { label: 'Skills Found', value: analysisHistory.length > 0 ? analysisHistory[0].matched : 0, icon: '✅', color: 'green' },
    { label: 'To Learn', value: analysisHistory.length > 0 ? analysisHistory[0].missing : 0, icon: '🎯', color: 'purple' }
  ]

  const skillProgress = [
    { skill: 'Python', current: 90, target: 100 },
    { skill: 'React', current: 75, target: 100 },
    { skill: 'Docker', current: 60, target: 100 },
    { skill: 'AWS', current: 45, target: 100 }
  ]

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Welcome back! 👋
            </h1>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Track your career progress and achievements
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentView('analyzer')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg"
            >
              🔍 Back to Analyzer
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className={`px-6 py-3 rounded-xl font-semibold shadow-lg ${darkMode ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900' : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white'}`}
            >
              {darkMode ? '☀️' : '🌙'}
            </motion.button>
          </div>
        </motion.div>

        <div className="flex gap-4 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
              }`}
            >
              {tab.icon} {tab.name}
            </motion.button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className={`glass rounded-2xl p-6 ${darkMode ? 'border-gray-700' : 'border-white'}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{stat.icon}</span>
                    <div className="text-3xl font-bold text-blue-500">
                      {stat.value}
                    </div>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className={`glass rounded-2xl p-6 ${darkMode ? 'border-gray-700' : 'border-white'}`}>
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                📈 Recent Activity
              </h2>
              {analysisHistory.length > 0 ? (
                <div className="space-y-3">
                  {analysisHistory.slice(0, 5).map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ x: 5 }}
                      className={`flex items-center justify-between p-4 rounded-xl ${
                        darkMode ? 'bg-gray-800' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {item.score}
                        </div>
                        <div>
                          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {item.role} Analysis
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.date} • {item.fileName}
                          </p>
                        </div>
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.matched} matched • {item.missing} missing
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  No analysis history yet. Start by analyzing your first resume!
                </p>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'progress' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass rounded-2xl p-6 ${darkMode ? 'border-gray-700' : 'border-white'}`}
          >
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              🎯 Skill Progress Tracker
            </h2>
            <div className="space-y-6">
              {skillProgress.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-2">
                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {item.skill}
                    </span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {item.current}%
                    </span>
                  </div>
                  <div className={`h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.current}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass rounded-2xl p-6 ${darkMode ? 'border-gray-700' : 'border-white'}`}
          >
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              📝 Complete Analysis History
            </h2>
            {analysisHistory.length > 0 ? (
              <div className="space-y-3">
                {analysisHistory.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {item.role} - Score: {item.score}%
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.date} • {item.fileName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-500">✓ {item.matched} matched</p>
                        <p className="text-sm text-red-500">✗ {item.missing} missing</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                No history available
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
