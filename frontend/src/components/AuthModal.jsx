import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const AuthModal = ({ darkMode, onAuth, onClose }) => {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const payload = mode === 'login' ? { email: form.email, password: form.password } : form
      const { data } = await axios.post(`${API_URL}${endpoint}`, payload)
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify({ name: data.name, email: data.email }))
      onAuth({ name: data.name, email: data.email, token: data.token })
      toast.success(`Welcome${mode === 'register' ? '' : ' back'}, ${data.name}!`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Authentication failed')
    }
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className={`w-full max-w-md rounded-3xl p-8 shadow-2xl ${darkMode ? 'bg-gray-900 border border-purple-500/30' : 'bg-white border border-gray-200'}`}
      >
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔐</div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {mode === 'login' ? 'Sign in to track your progress' : 'Save resumes & track your growth'}
          </p>
        </div>

        <div className={`flex rounded-xl p-1 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          {['login', 'register'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === m ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow' : darkMode ? 'text-gray-400' : 'text-gray-600'}`}
            >
              {m === 'login' ? '🔑 Login' : '✨ Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence>
            {mode === 'register' && (
              <motion.input
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all ${darkMode ? 'bg-gray-800 text-white border-gray-700 focus:border-purple-500' : 'bg-gray-50 text-gray-800 border-gray-200 focus:border-blue-500'}`}
              />
            )}
          </AnimatePresence>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
            className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all ${darkMode ? 'bg-gray-800 text-white border-gray-700 focus:border-purple-500' : 'bg-gray-50 text-gray-800 border-gray-200 focus:border-blue-500'}`}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
            className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all ${darkMode ? 'bg-gray-800 text-white border-gray-700 focus:border-purple-500' : 'bg-gray-50 text-gray-800 border-gray-200 focus:border-blue-500'}`}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg disabled:opacity-50"
          >
            {loading ? '⏳ Please wait...' : mode === 'login' ? '🚀 Login' : '✨ Create Account'}
          </motion.button>
        </form>

        <button onClick={onClose} className={`w-full mt-4 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'} hover:underline`}>
          Continue without account
        </button>
      </motion.div>
    </motion.div>
  )
}

export default AuthModal
