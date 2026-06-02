import { motion, AnimatePresence } from 'framer-motion'
import usePlayerStore from '../store/playerStore'
import SongCard from './SongCard'

export default function QueueDrawer() {
  const queue = usePlayerStore((s) => s.queue)
  const queueIndex = usePlayerStore((s) => s.queueIndex)
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue)
  const clearQueue = usePlayerStore((s) => s.clearQueue)
  const setShowQueue = usePlayerStore((s) => s.setShowQueue)

  return (
    <motion.div
      className="queue-drawer"
      initial={{ x: 360 }}
      animate={{ x: 0 }}
      exit={{ x: 360 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="queue-header">
        <div className="queue-title">Queue</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {queue.length > 0 && (
            <button className="btn-icon" onClick={clearQueue} title="Clear queue">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z" />
              </svg>
            </button>
          )}
          <button
            className="btn-icon"
            onClick={() => setShowQueue(false)}
            title="Close"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="queue-list">
        <AnimatePresence mode="popLayout">
          {queue.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
              </svg>
              <div className="empty-state-text">Queue is empty</div>
            </div>
          ) : (
            queue.map((track, idx) => (
              <motion.div
                key={`${track.video_id}-${idx}`}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 0',
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: idx === queueIndex ? 'var(--accent)' : 'var(--text-tertiary)',
                    minWidth: 24,
                    textAlign: 'center',
                    fontWeight: idx === queueIndex ? 700 : 400,
                  }}
                >
                  {idx === queueIndex ? '▶' : idx + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <SongCard song={track} compact />
                </div>
                <button
                  className="btn-icon"
                  onClick={() => removeFromQueue(idx)}
                  style={{ flexShrink: 0 }}
                  title="Remove"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
