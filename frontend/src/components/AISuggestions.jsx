import { motion, AnimatePresence } from 'framer-motion'

const AISuggestions = ({ suggestions, rewriteData, onRewrite, loadingRewrite, darkMode }) => {
  if (!suggestions) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-3xl p-6 shadow-xl mt-6 ${darkMode ? 'border-yellow-500/30' : 'border-white/50'}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">💡</span>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>AI Improvement Suggestions</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRewrite}
          disabled={loadingRewrite}
          className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 text-sm"
        >
          {loadingRewrite ? '⏳ Rewriting...' : '✨ Improve My Resume'}
        </motion.button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className={`font-bold mb-3 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>🔥 Priority Fixes</p>
          <div className="space-y-2">
            {suggestions.priority_fixes?.map((fix, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex gap-2 p-3 rounded-xl ${darkMode ? 'bg-yellow-900/20 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'}`}
              >
                <span className="text-yellow-500 font-bold shrink-0">{i + 1}.</span>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{fix}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <p className={`font-bold mb-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>📌 All Suggestions</p>
          <div className="space-y-2">
            {suggestions.suggestions?.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex gap-2 p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
              >
                <span className="text-blue-500 shrink-0">→</span>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{s}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {suggestions.keywords_to_add?.length > 0 && (
        <div className={`rounded-2xl p-4 ${darkMode ? 'bg-purple-900/20 border border-purple-500/20' : 'bg-purple-50 border border-purple-200'}`}>
          <p className={`font-bold mb-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>🏷️ Keywords to Add</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.keywords_to_add.map((kw, i) => (
              <span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-500 rounded-full text-sm font-medium">{kw}</span>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {rewriteData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mt-6 rounded-2xl p-5 ${darkMode ? 'bg-green-900/20 border border-green-500/30' : 'bg-green-50 border border-green-200'}`}
          >
            <p className="font-bold text-green-500 text-lg mb-4">✨ Rewritten Resume Bullets</p>
            <div className="space-y-2 mb-4">
              {rewriteData.improved_bullets?.map((bullet, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`p-3 rounded-xl text-sm ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'} shadow-sm`}
                >
                  {bullet}
                </motion.div>
              ))}
            </div>
            {rewriteData.tips?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {rewriteData.tips.map((tip, i) => (
                  <span key={i} className={`text-xs px-3 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>💡 {tip}</span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default AISuggestions
