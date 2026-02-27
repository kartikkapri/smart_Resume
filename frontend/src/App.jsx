import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import CircularProgress from './components/CircularProgress'
import RoadmapDisplay from './components/RoadmapDisplay'
import SkillsChart from './components/SkillsChart'
import JobRecommendations from './components/JobRecommendations'
import Dashboard from './components/Dashboard'

const API_URL = 'http://localhost:8000'

function App() {
  const [currentView, setCurrentView] = useState('analyzer') // 'analyzer' or 'dashboard'
  const [file, setFile] = useState(null)
  const [role, setRole] = useState('SDE')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [roadmap, setRoadmap] = useState(null)
  const [loadingRoadmap, setLoadingRoadmap] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })
  const [showJDCompare, setShowJDCompare] = useState(false)
  const [jobDescription, setJobDescription] = useState('')
  const [jdResult, setJdResult] = useState(null)
  const [extractedSkills, setExtractedSkills] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [jobRecommendations, setJobRecommendations] = useState(null)
  const [analysisHistory, setAnalysisHistory] = useState(() => {
    const saved = localStorage.getItem('analysisHistory')
    return saved ? JSON.parse(saved) : []
  })

  const roles = [
    { id: 'SDE', name: 'Software Developer', icon: '💻', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'AI-ML', name: 'AI/ML Engineer', icon: '🤖', gradient: 'from-purple-500 to-pink-500' },
    { id: 'DevOps', name: 'DevOps Engineer', icon: '⚙️', gradient: 'from-orange-500 to-red-500' },
    { id: 'DS', name: 'Data Scientist', icon: '📊', gradient: 'from-green-500 to-teal-500' }
  ]

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory))
  }, [analysisHistory])

  const saveAnalysis = (data) => {
    const analysis = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      role: role,
      score: data.readiness_score,
      matched: data.matched_skills.length,
      missing: data.missing_skills.length,
      fileName: file?.name || 'Unknown'
    }
    setAnalysisHistory(prev => [analysis, ...prev].slice(0, 10))
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      toast.success('Resume uploaded!')
    }
  }

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please upload a resume first!')
      return
    }
    
    setLoading(true)
    setResult(null)
    setRoadmap(null)
    setJdResult(null)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('target_role', role)

    try {
      const { data } = await axios.post(`${API_URL}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(data)
      setExtractedSkills([...data.matched_skills, ...data.missing_skills])
      saveAnalysis(data)
      toast.success('Analysis complete!')
      
      const jobsRes = await axios.post(`${API_URL}/job-recommendations`, {
        user_skills: [...data.matched_skills, ...data.missing_skills],
        target_role: role
      })
      setJobRecommendations(jobsRes.data.jobs)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to analyze resume')
    }
    setLoading(false)
  }

  const handleGenerateRoadmap = async () => {
    if (!result?.missing_skills) return
    
    setLoadingRoadmap(true)
    try {
      const { data } = await axios.post(`${API_URL}/generate-roadmap`, {
        missing_skills: result.missing_skills,
        target_role: role
      })
      setRoadmap(data.roadmap)
      toast.success('Roadmap generated!')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to generate roadmap')
    }
    setLoadingRoadmap(false)
  }

  const handleCompareJD = async () => {
    if (!jobDescription || !extractedSkills.length) {
      toast.error('Please enter job description')
      return
    }
    
    try {
      const { data } = await axios.post(`${API_URL}/compare-jd`, {
        resume_skills: extractedSkills,
        job_description: jobDescription
      })
      setJdResult(data)
      toast.success('Comparison complete!')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to compare')
    }
  }

  if (currentView === 'dashboard') {
    return <Dashboard darkMode={darkMode} setDarkMode={setDarkMode} analysisHistory={analysisHistory} setCurrentView={setCurrentView} />
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} py-8 px-4 relative overflow-hidden`}>
      <Toaster position="top-right" />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-purple-500' : 'bg-blue-400'}`}
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-pink-500' : 'bg-purple-400'}`}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="text-4xl"
              >
                🎯
              </motion.div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                ResumeAI
              </h1>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView('analyzer')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  currentView === 'analyzer'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
                }`}
              >
                🔍 Analyzer
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  currentView === 'dashboard'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
                }`}
              >
                📊 Dashboard
              </motion.button>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDarkMode(!darkMode)}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all shadow-lg ${darkMode ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900' : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white'}`}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </motion.button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-7xl mb-6"
          >
            🚀
          </motion.div>
          <h2 className="text-6xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
            Smart Resume Analyzer
          </h2>
          <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            AI-Powered Career Intelligence Platform
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className={`glass rounded-3xl p-8 shadow-2xl mb-8 ${darkMode ? 'border-purple-500/30' : 'border-white/50'}`}
        >
          <div className="space-y-6">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-3 border-dashed rounded-2xl p-12 transition-all ${
                dragActive 
                  ? 'border-blue-500 bg-blue-500/10 scale-105' 
                  : darkMode ? 'border-purple-500/30 hover:border-purple-500/50' : 'border-blue-300 hover:border-blue-500'
              }`}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  setFile(e.target.files[0])
                  toast.success('Resume uploaded!')
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  📄
                </motion.div>
                <p className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  {file ? file.name : 'Drop your resume here'}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  or click to browse (PDF only)
                </p>
              </div>
            </div>

            <div>
              <label className={`block text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Select Your Target Role
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {roles.map((r) => (
                  <motion.button
                    key={r.id}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setRole(r.id)}
                    className={`p-6 rounded-2xl transition-all shadow-lg ${
                      role === r.id
                        ? `bg-gradient-to-br ${r.gradient} text-white scale-105`
                        : darkMode ? 'glass text-white hover:shadow-xl' : 'bg-white text-gray-700 hover:shadow-xl'
                    }`}
                  >
                    <div className="text-4xl mb-3">{r.icon}</div>
                    <div className="text-sm font-bold">{r.name}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="w-full py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl font-bold text-xl shadow-2xl hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all animate-gradient"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    ⚡
                  </motion.div>
                  Analyzing...
                </span>
              ) : (
                '🚀 Analyze Resume'
              )}
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-3 gap-6">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className={`glass rounded-3xl p-8 shadow-xl ${darkMode ? 'border-blue-500/30' : 'border-white/50'}`}
                >
                  <CircularProgress percentage={result.readiness_score} darkMode={darkMode} />
                  <p className={`text-center text-lg mt-4 font-bold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                    Readiness Score
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, rotate: -2 }}
                  className={`glass rounded-3xl p-8 shadow-xl ${darkMode ? 'border-purple-500/30' : 'border-white/50'}`}
                >
                  <SkillsChart matched={result.matched_skills.length} missing={result.missing_skills.length} />
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`glass rounded-3xl p-8 shadow-xl ${darkMode ? 'border-pink-500/30' : 'border-white/50'} flex flex-col justify-center`}
                >
                  <div className="text-center space-y-4">
                    <div>
                      <div className="text-5xl font-black text-green-500">{result.matched_skills.length}</div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Skills Matched</div>
                    </div>
                    <div>
                      <div className="text-5xl font-black text-red-500">{result.missing_skills.length}</div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Skills to Learn</div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowJDCompare(!showJDCompare)}
                  className="py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold shadow-lg"
                >
                  {showJDCompare ? '❌ Close' : '📄 Compare with Job'}
                </motion.button>

                {result.missing_skills.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerateRoadmap}
                    disabled={loadingRoadmap}
                    className="py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-bold shadow-lg disabled:opacity-50"
                  >
                    {loadingRoadmap ? '⏳ Generating...' : '🗺️ Generate Roadmap'}
                  </motion.button>
                )}
              </div>

              <AnimatePresence>
                {showJDCompare && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`glass rounded-3xl p-6 shadow-xl ${darkMode ? 'border-purple-500/30' : 'border-white/50'}`}
                  >
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste job description here..."
                      className={`w-full h-40 px-4 py-3 rounded-xl border-2 focus:outline-none transition-all ${
                        darkMode ? 'bg-gray-800 text-white border-purple-500/30' : 'bg-white text-gray-800 border-purple-200'
                      }`}
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCompareJD}
                      className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold"
                    >
                      🔍 Compare Now
                    </motion.button>

                    {jdResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 text-center"
                      >
                        <div className="text-6xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {jdResult.match_percentage}%
                        </div>
                        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Match Score</p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {roadmap && <RoadmapDisplay roadmap={roadmap} targetRole={role} darkMode={darkMode} />}
        {jobRecommendations && <JobRecommendations jobs={jobRecommendations} darkMode={darkMode} />}
      </div>
    </div>
  )
}

export default App
