import { motion } from 'framer-motion'

const ScoreBar = ({ label, score, color, darkMode }) => (
  <div className="mb-4">
    <div className="flex justify-between mb-1">
      <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
      <span className={`text-sm font-bold ${score >= 70 ? 'text-green-500' : score >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>{score}%</span>
    </div>
    <div className={`h-2.5 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8 }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  </div>
)

const ATSScore = ({ atsData, darkMode }) => {
  if (!atsData) return null
  const { ats_score, formatting_score, section_score, keyword_score, formatting_issues, sections, keywords } = atsData

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-3xl p-6 shadow-xl mt-6 ${darkMode ? 'border-cyan-500/30' : 'border-white/50'}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🤖</span>
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>ATS Score Simulation</h2>
        <div className={`ml-auto text-4xl font-black ${ats_score >= 70 ? 'text-green-500' : ats_score >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
          {ats_score}%
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <ScoreBar label="📝 Formatting" score={formatting_score} color="bg-gradient-to-r from-blue-500 to-cyan-500" darkMode={darkMode} />
        <ScoreBar label="📋 Section Completeness" score={section_score} color="bg-gradient-to-r from-purple-500 to-pink-500" darkMode={darkMode} />
        <ScoreBar label="🔑 Keyword Density" score={keyword_score} color="bg-gradient-to-r from-orange-500 to-red-500" darkMode={darkMode} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {formatting_issues.length > 0 && (
          <div className={`rounded-2xl p-4 ${darkMode ? 'bg-red-900/30 border border-red-500/30' : 'bg-red-50 border border-red-200'}`}>
            <p className="font-bold text-red-500 mb-2">⚠️ Formatting Issues</p>
            <ul className="space-y-1">
              {formatting_issues.map((issue, i) => (
                <li key={i} className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>• {issue}</li>
              ))}
            </ul>
          </div>
        )}

        <div className={`rounded-2xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <p className="font-bold text-green-500 mb-2">✅ Sections Found</p>
          <div className="flex flex-wrap gap-1">
            {sections.found.map((s, i) => (
              <span key={i} className="px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full text-xs">{s}</span>
            ))}
          </div>
          {sections.missing.length > 0 && (
            <>
              <p className="font-bold text-red-400 mt-3 mb-1">❌ Missing Sections</p>
              <div className="flex flex-wrap gap-1">
                {sections.missing.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">{s}</span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className={`rounded-2xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <p className="font-bold text-yellow-500 mb-2">🔑 Missing Keywords</p>
          <div className="flex flex-wrap gap-1">
            {keywords.missing_keywords.slice(0, 8).map((kw, i) => (
              <span key={i} className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded-full text-xs">{kw}</span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ATSScore
