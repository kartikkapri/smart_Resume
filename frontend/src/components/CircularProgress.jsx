import { useEffect, useState } from 'react'

const CircularProgress = ({ percentage }) => {
  const [progress, setProgress] = useState(0)
  const radius = 70
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    const timer = setTimeout(() => setProgress(percentage), 100)
    return () => clearTimeout(timer)
  }, [percentage])

  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="transform -rotate-90 w-48 h-48">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="#e0e7ff"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="url(#gradient)"
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {Math.round(progress)}%
          </div>
          <div className="text-sm text-gray-600 mt-1 font-semibold">Ready</div>
        </div>
      </div>
    </div>
  )
}

export default CircularProgress
