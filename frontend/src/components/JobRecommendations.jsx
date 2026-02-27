import { motion } from 'framer-motion'

const JobRecommendations = ({ jobs, darkMode }) => {
  if (!jobs || jobs.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8"
    >
      <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        🎯 Recommended Jobs for You
      </h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className={`glass rounded-2xl p-6 shadow-xl ${darkMode ? 'border-blue-500/30' : 'border-white/50'} relative overflow-hidden`}
          >
            {/* Match Score Badge */}
            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
              job.match_score >= 75 ? 'bg-green-500' : job.match_score >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
            } text-white`}>
              {job.match_score}% Match
            </div>

            {/* Company Logo Placeholder */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl font-bold text-white mb-4">
              {job.company[0]}
            </div>

            {/* Job Details */}
            <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {job.title}
            </h3>
            <p className={`text-lg font-semibold mb-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {job.company}
            </p>

            <div className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💼</span>
                <span>{job.experience}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💰</span>
                <span className="font-semibold text-green-600">{job.salary}</span>
              </div>
            </div>

            {/* Skills Required */}
            <div className="mt-4">
              <p className={`text-xs font-semibold mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Required Skills:
              </p>
              
              <div className="space-y-2">
                {job.skills.map((skill, i) => {
                  const hasSkill = job.matched_skills?.includes(skill)
                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                        hasSkill 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <span className={`text-sm font-medium ${
                        hasSkill ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {skill}
                      </span>
                      <span className="text-lg">
                        {hasSkill ? '✓' : '✗'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Apply Button */}
            <motion.a
              href={job.apply_link}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="block mt-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Apply Now →
            </motion.a>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default JobRecommendations
