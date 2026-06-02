import { useRef, useCallback } from 'react'
import usePlayerStore from '../store/playerStore'

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function ProgressBar() {
  const currentTime = usePlayerStore((s) => s.currentTime)
  const duration = usePlayerStore((s) => s.duration)
  const audioRef = usePlayerStore((s) => s.audioRef)
  const barRef = useRef(null)

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleSeek = useCallback(
    (e) => {
      if (!barRef.current || !audioRef?.current || !duration) return
      const rect = barRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const time = x * duration
      audioRef.current.currentTime = time
    },
    [audioRef, duration]
  )

  return (
    <div className="progress-container">
      <span className="progress-time">{formatTime(currentTime)}</span>
      <div
        ref={barRef}
        className="progress-bar"
        onClick={handleSeek}
      >
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <span className="progress-time">{formatTime(duration)}</span>
    </div>
  )
}
