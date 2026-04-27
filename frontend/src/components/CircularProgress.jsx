import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const CircularProgress = ({ percentage, darkMode }) => {
  const [progress, setProgress] = useState(0)
  const [displayNum, setDisplayNum] = useState(0)
  const radius = 70
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    const timer = setTimeout(() => setProgress(percentage), 200)
    return () => clearTimeout(timer)
  }, [percentage])

  useEffect(() => {
    let start = 0
    const end = Math.round(percentage)
    if (start === end) return
    const step = Math.ceil(end / 60)
    const counter = setInterval(() => {
      start += step
      if (start >= end) { setDisplayNum(end); clearInterval(counter) }
      else setDisplayNum(start)
    }, 20)
    return () => clearInterval(counter)
  }, [percentage])

  const offset = circumference - (progress / 100) * circumference

  const getColor = (p) => {
    if (p >= 70) return { stroke: 'url(#greenGrad)', text: 'text-emerald-400', label: 'Excellent', glow: 'rgba(16,185,129,0.6)' }
    if (p >= 40) return { stroke: 'url(#yellowGrad)', text: 'text-yellow-400', label: 'Good', glow: 'rgba(234,179,8,0.6)' }
    return { stroke: 'url(#redGrad)', text: 'text-red-400', label: 'Needs Work', glow: 'rgba(239,68,68,0.6)' }
  }

  const color = getColor(percentage)

  return (
    <div className="relative w-48 h-48 mx-auto">
      <motion.div
        animate={{ boxShadow: [`0 0 20px ${color.glow}`, `0 0 50px ${color.glow}`, `0 0 20px ${color.glow}`] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 rounded-full"
      />
      <svg className="transform -rotate-90 w-48 h-48">
        <defs>
          <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx="96" cy="96" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
        <circle cx="96" cy="96" r={radius} stroke="rgba(255,255,255,0.03)" strokeWidth="16" fill="none" />
        <circle
          cx="96" cy="96" r={radius}
          stroke={color.stroke}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter="url(#glow)"
          className="transition-all duration-1500 ease-out"
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className={`text-4xl font-black ${color.text}`}
            style={{ textShadow: `0 0 20px ${color.glow}` }}
          >
            {displayNum}%
          </motion.div>
          <div className="text-xs text-gray-400 mt-1 font-mono tracking-widest uppercase">{color.label}</div>
        </div>
      </div>
    </div>
  )
}

export default CircularProgress
