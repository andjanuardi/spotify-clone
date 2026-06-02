import { useRef, useCallback, useState, useEffect } from 'react'
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
  const [buffered, setBuffered] = useState(0)

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  useEffect(() => {
    const audio = audioRef?.current
    if (!audio) return

    const onProgress = () => {
      if (audio.buffered.length > 0) {
        const end = audio.buffered.end(audio.buffered.length - 1)
        setBuffered(audio.duration > 0 ? (end / audio.duration) * 100 : 0)
      }
    }

    audio.addEventListener('progress', onProgress)
    return () => audio.removeEventListener('progress', onProgress)
  }, [audioRef])

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
        <div className="progress-buffer" style={{ width: `${buffered}%` }} />
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <span className="progress-time">{formatTime(duration)}</span>
    </div>
  )
}
