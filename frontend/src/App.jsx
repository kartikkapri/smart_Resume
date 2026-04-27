import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import CircularProgress from './components/CircularProgress'
import RoadmapDisplay from './components/RoadmapDisplay'
import SkillsChart from './components/SkillsChart'
import JobRecommendations from './components/JobRecommendations'
import Dashboard from './components/Dashboard'
import ATSScore from './components/ATSScore'
import AISuggestions from './components/AISuggestions'
import AuthModal from './components/AuthModal'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [currentView, setCurrentView] = useState('analyzer')
  const [file, setFile] = useState(null)
  const [role, setRole] = useState('SDE')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [roadmap, setRoadmap] = useState(null)
  const [loadingRoadmap, setLoadingRoadmap] = useState(false)
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode') || 'false'))
  const [showJDCompare, setShowJDCompare] = useState(false)
  const [jobDescription, setJobDescription] = useState('')
  const [jdResult, setJdResult] = useState(null)
  const [extractedSkills, setExtractedSkills] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [jobRecommendations, setJobRecommendations] = useState(null)
  const [analysisHistory, setAnalysisHistory] = useState(() => JSON.parse(localStorage.getItem('analysisHistory') || '[]'))
  const [atsData, setAtsData] = useState(null)
  const [suggestions, setSuggestions] = useState(null)
  const [rewriteData, setRewriteData] = useState(null)
  const [loadingRewrite, setLoadingRewrite] = useState(false)
  const [resumeText, setResumeText] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('auth_user') || 'null'))

  const roles = [
    { id: 'SDE', name: 'Software Dev', icon: '💻', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'AI-ML', name: 'AI/ML Engineer', icon: '🤖', gradient: 'from-purple-500 to-pink-500' },
    { id: 'DevOps', name: 'DevOps', icon: '⚙️', gradient: 'from-orange-500 to-red-500' },
    { id: 'DS', name: 'Data Scientist', icon: '📊', gradient: 'from-green-500 to-teal-500' },
    { id: 'Frontend', name: 'Frontend Dev', icon: '🎨', gradient: 'from-pink-500 to-rose-500' },
    { id: 'Data Analyst', name: 'Data Analyst', icon: '📈', gradient: 'from-indigo-500 to-blue-500' },
  ]

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory))
  }, [analysisHistory])

  const saveAnalysis = (data) => {
    const entry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      role,
      score: data.readiness_score,
      matched: data.matched_skills.length,
      missing: data.missing_skills.length,
      fileName: file?.name || 'Unknown'
    }
    setAnalysisHistory(prev => [entry, ...prev].slice(0, 20))
  }

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) { setFile(e.dataTransfer.files[0]); toast.success('Resume uploaded!') }
  }

  const handleAnalyze = async () => {
    if (!file) { toast.error('Please upload a resume first!'); return }
    setLoading(true)
    setResult(null); setRoadmap(null); setJdResult(null); setAtsData(null); setSuggestions(null); setRewriteData(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('target_role', role)

    const headers = {}
    const token = localStorage.getItem('auth_token')
    if (token) headers['Authorization'] = `Bearer ${token}`

    try {
      const { data } = await axios.post(`${API_URL}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', ...headers }
      })
      setResult(data)
      setResumeText(data.resume_text || '')
      setExtractedSkills([...data.matched_skills, ...data.missing_skills])
      saveAnalysis(data)
      toast.success('Analysis complete!')

      // Parallel: ATS score + AI suggestions + job recommendations
      const [atsRes, suggestRes, jobsRes] = await Promise.allSettled([
        axios.post(`${API_URL}/ats-score`, { resume_text: data.resume_text || '', target_role: role }),
        axios.post(`${API_URL}/ai-suggestions`, { resume_text: data.resume_text || '', target_role: role, missing_skills: data.missing_skills }),
        axios.post(`${API_URL}/job-recommendations`, { user_skills: [...data.matched_skills, ...data.missing_skills], target_role: role })
      ])

      if (atsRes.status === 'fulfilled') setAtsData(atsRes.value.data)
      if (suggestRes.status === 'fulfilled') setSuggestions(suggestRes.value.data)
      if (jobsRes.status === 'fulfilled') setJobRecommendations(jobsRes.value.data.jobs)
    } catch (error) {
      toast.error('Failed to analyze resume')
    }
    setLoading(false)
  }

  const handleGenerateRoadmap = async () => {
    if (!result?.missing_skills) return
    setLoadingRoadmap(true)
    try {
      const { data } = await axios.post(`${API_URL}/generate-roadmap`, { missing_skills: result.missing_skills, target_role: role })
      setRoadmap(data.roadmap)
      toast.success('Roadmap generated!')
    } catch { toast.error('Failed to generate roadmap') }
    setLoadingRoadmap(false)
  }

  const handleCompareJD = async () => {
    if (!jobDescription || !extractedSkills.length) { toast.error('Please enter job description'); return }
    try {
      const { data } = await axios.post(`${API_URL}/compare-jd`, { resume_skills: extractedSkills, job_description: jobDescription })
      setJdResult(data)
      toast.success('Comparison complete!')
    } catch { toast.error('Failed to compare') }
  }

  const handleRewrite = async () => {
    if (!resumeText) { toast.error('No resume text available'); return }
    setLoadingRewrite(true)
    try {
      const { data } = await axios.post(`${API_URL}/rewrite-resume`, { resume_text: resumeText, target_role: role })
      setRewriteData(data)
      toast.success('Resume rewritten!')
    } catch { toast.error('Failed to rewrite') }
    setLoadingRewrite(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setUser(null)
    toast.success('Logged out')
  }

  if (currentView === 'dashboard') {
    return <Dashboard darkMode={darkMode} setDarkMode={setDarkMode} analysisHistory={analysisHistory} setCurrentView={setCurrentView} user={user} onLogout={handleLogout} />
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} py-8 px-4 relative overflow-hidden`}>
      <Toaster position="top-right" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity }}
          className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-purple-500' : 'bg-blue-400'}`} />
        <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }} transition={{ duration: 25, repeat: Infinity }}
          className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-pink-500' : 'bg-purple-400'}`} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="text-4xl">🎯</motion.div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>ResumeAI</h1>
            </div>
            <div className="flex gap-2">
              {['analyzer', 'dashboard'].map(v => (
                <motion.button key={v} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentView(v)}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${currentView === v ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'}`}
                >{v === 'analyzer' ? '🔍 Analyzer' : '📊 Dashboard'}</motion.button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold px-3 py-2 rounded-xl ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'}`}>👤 {user.name}</span>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLogout}
                  className={`px-3 py-2 rounded-xl text-sm ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>🚪</motion.button>
              </div>
            ) : (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-sm shadow-lg">
                🔐 Login / Sign Up
              </motion.button>
            )}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm shadow-lg ${darkMode ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900' : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white'}`}>
              {darkMode ? '☀️' : '🌙'}
            </motion.button>
          </div>
        </motion.div>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center mb-10">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-7xl mb-4">🚀</motion.div>
          <h2 className="text-5xl font-black mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Smart Resume Analyzer
          </h2>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>AI-Powered Career Intelligence Platform</p>
        </motion.div>

        {/* Upload + Role + Analyze */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
          className={`glass rounded-3xl p-8 shadow-2xl mb-6 ${darkMode ? 'border-purple-500/30' : 'border-white/50'}`}
        >
          <div className="space-y-6">
            <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-10 transition-all ${dragActive ? 'border-blue-500 bg-blue-500/10 scale-105' : darkMode ? 'border-purple-500/30 hover:border-purple-500/50' : 'border-blue-300 hover:border-blue-500'}`}
            >
              <input type="file" accept=".pdf" onChange={e => { setFile(e.target.files[0]); toast.success('Resume uploaded!') }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="text-center">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-5xl mb-3">📄</motion.div>
                <p className={`text-lg font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-700'}`}>{file ? file.name : 'Drop your resume here'}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>or click to browse (PDF only)</p>
              </div>
            </div>

            <div>
              <label className={`block text-base font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Select Target Role</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {roles.map(r => (
                  <motion.button key={r.id} whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }} onClick={() => setRole(r.id)}
                    className={`p-4 rounded-2xl transition-all shadow-md ${role === r.id ? `bg-gradient-to-br ${r.gradient} text-white scale-105` : darkMode ? 'glass text-white' : 'bg-white text-gray-700'}`}
                  >
                    <div className="text-3xl mb-1">{r.icon}</div>
                    <div className="text-xs font-bold leading-tight">{r.name}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAnalyze}
              disabled={!file || loading}
              className="w-full py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl font-bold text-xl shadow-2xl hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>⚡</motion.span>
                  Analyzing...
                </span>
              ) : '🚀 Analyze Resume'}
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="space-y-6">
              {/* Score Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <motion.div whileHover={{ scale: 1.05, rotate: 2 }} className={`glass rounded-3xl p-8 shadow-xl ${darkMode ? 'border-blue-500/30' : 'border-white/50'}`}>
                  <CircularProgress percentage={result.readiness_score} darkMode={darkMode} />
                  <p className={`text-center text-base mt-3 font-bold ${darkMode ? 'text-white' : 'text-gray-700'}`}>Readiness Score</p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05, rotate: -2 }} className={`glass rounded-3xl p-8 shadow-xl ${darkMode ? 'border-purple-500/30' : 'border-white/50'}`}>
                  <SkillsChart matched={result.matched_skills.length} missing={result.missing_skills.length} />
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className={`glass rounded-3xl p-8 shadow-xl ${darkMode ? 'border-pink-500/30' : 'border-white/50'} flex flex-col justify-center`}>
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

              {/* Matched / Missing Skills */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className={`glass rounded-2xl p-5 ${darkMode ? 'border-green-500/20' : 'border-white/50'}`}>
                  <p className="font-bold text-green-500 mb-3">✅ Matched Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {result.matched_skills.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm">{s}</span>
                    ))}
                  </div>
                </div>
                <div className={`glass rounded-2xl p-5 ${darkMode ? 'border-red-500/20' : 'border-white/50'}`}>
                  <p className="font-bold text-red-400 mb-3">❌ Missing Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {result.missing_skills.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid md:grid-cols-2 gap-4">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setShowJDCompare(!showJDCompare)}
                  className="py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold shadow-lg"
                >
                  {showJDCompare ? '❌ Close JD Compare' : '📄 Compare with Job Description'}
                </motion.button>
                {result.missing_skills.length > 0 && (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleGenerateRoadmap} disabled={loadingRoadmap}
                    className="py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-bold shadow-lg disabled:opacity-50"
                  >
                    {loadingRoadmap ? '⏳ Generating...' : '🗺️ Generate Learning Roadmap'}
                  </motion.button>
                )}
              </div>

              {/* JD Compare */}
              <AnimatePresence>
                {showJDCompare && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className={`glass rounded-3xl p-6 shadow-xl ${darkMode ? 'border-purple-500/30' : 'border-white/50'}`}
                  >
                    <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>📄 Job Description Match</h3>
                    <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)}
                      placeholder="Paste job description here..."
                      className={`w-full h-36 px-4 py-3 rounded-xl border-2 focus:outline-none transition-all resize-none ${darkMode ? 'bg-gray-800 text-white border-purple-500/30' : 'bg-white text-gray-800 border-purple-200'}`}
                    />
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCompareJD}
                      className="w-full mt-3 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold"
                    >🔍 Compare Now</motion.button>
                    {jdResult && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-5 grid md:grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{jdResult.match_percentage}%</div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>JD Match Score</p>
                        </div>
                        <div>
                          <p className="font-bold text-green-500 mb-1 text-sm">✅ Matched</p>
                          <div className="flex flex-wrap gap-1 justify-center">
                            {jdResult.matched_skills.slice(0, 5).map((s, i) => <span key={i} className="px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full text-xs">{s}</span>)}
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-red-400 mb-1 text-sm">❌ Missing</p>
                          <div className="flex flex-wrap gap-1 justify-center">
                            {jdResult.missing_skills.slice(0, 5).map((s, i) => <span key={i} className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">{s}</span>)}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ATS Score */}
              <ATSScore atsData={atsData} darkMode={darkMode} />

              {/* AI Suggestions + Rewrite */}
              <AISuggestions suggestions={suggestions} rewriteData={rewriteData} onRewrite={handleRewrite} loadingRewrite={loadingRewrite} darkMode={darkMode} />
            </motion.div>
          )}
        </AnimatePresence>

        {roadmap && <RoadmapDisplay roadmap={roadmap} targetRole={role} darkMode={darkMode} />}
        {jobRecommendations && <JobRecommendations jobs={jobRecommendations} darkMode={darkMode} />}
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal darkMode={darkMode} onAuth={u => { setUser(u); setShowAuthModal(false) }} onClose={() => setShowAuthModal(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
