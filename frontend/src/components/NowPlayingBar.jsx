import { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import usePlayerStore from '../store/playerStore'
import { getStreamUrl } from '../api'
import Controls from './Controls'
import ProgressBar from './ProgressBar'

export default function NowPlayingBar() {
  const audioRef = useRef(null)
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const volume = usePlayerStore((s) => s.volume)
  const setPlaying = usePlayerStore((s) => s.setPlaying)
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime)
  const setDuration = usePlayerStore((s) => s.setDuration)
  const setAudioRef = usePlayerStore((s) => s.setAudioRef)
  const nextTrack = usePlayerStore((s) => s.nextTrack)
  const setVolume = usePlayerStore((s) => s.setVolume)

  useEffect(() => {
    setAudioRef(audioRef)
    return () => setAudioRef(null)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onDurationChange = () => setDuration(audio.duration || 0)
    const onEnded = () => {
      const store = usePlayerStore.getState()
      if (store.repeatMode === 'one') {
        audio.currentTime = 0
        audio.play()
      } else {
        nextTrack()
      }
    }
    const onPlaying = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onError = () => setPlaying(false)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('error', onError)
    }
  }, [currentTrack])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const handleCanPlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    const state = usePlayerStore.getState()
    if (state.isPlaying) {
      audio.play().catch(() => state.setPlaying(false))
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    if (isPlaying) {
      if (audio.readyState >= 2) {
        audio.play().catch(() => setPlaying(false))
      }
    } else {
      audio.pause()
    }
  }, [isPlaying, currentTrack])

  const handleVolumeChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const vol = Math.max(0, Math.min(1, x))
    setVolume(vol)
  }

  const volumePercent = volume * 100

  return (
    <motion.div
      className="nowplaying-bar"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
    >
      <audio
        ref={audioRef}
        src={currentTrack ? getStreamUrl(currentTrack.video_id) : undefined}
        preload="auto"
        onCanPlay={handleCanPlay}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentTrack?.video_id || 'empty'}
          className="nowplaying-left"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {currentTrack ? (
            <>
              <img
                className="nowplaying-thumb"
                src={currentTrack.thumbnail || ''}
                alt={currentTrack.title}
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              <div className="nowplaying-info">
                <div className="nowplaying-title">{currentTrack.title}</div>
                <div className="nowplaying-artist">{currentTrack.artist}</div>
              </div>
            </>
          ) : (
            <div className="nowplaying-info">
              <div className="nowplaying-title" style={{ color: 'var(--text-tertiary)' }}>
                No track selected
              </div>
              <div className="nowplaying-artist">Search and play a song</div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="nowplaying-center">
        <Controls />
        <ProgressBar />
      </div>

      <div className="nowplaying-right">
        <button
          className="btn-icon"
          onClick={() => usePlayerStore.getState().toggleShowQueue()}
          title="Queue"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
          </svg>
        </button>

        <div className="volume-container">
          <button className="volume-btn" title="Volume">
            {volume === 0 ? (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : volume < 0.5 ? (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>
          <div className="volume-slider" onClick={handleVolumeChange}>
            <div className="volume-fill" style={{ width: `${volumePercent}%` }} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
