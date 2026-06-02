import usePlayerStore from '../store/playerStore'

export default function Controls() {
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const isShuffled = usePlayerStore((s) => s.isShuffled)
  const repeatMode = usePlayerStore((s) => s.repeatMode)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const nextTrack = usePlayerStore((s) => s.nextTrack)
  const prevTrack = usePlayerStore((s) => s.prevTrack)
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat)

  const repeatIcons = {
    off: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
      </svg>
    ),
    all: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
      </svg>
    ),
    one: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z" />
      </svg>
    ),
  }

  return (
    <div className="nowplaying-controls">
      <button
        className={`control-btn${isShuffled ? ' active' : ''}`}
        onClick={toggleShuffle}
        title="Shuffle"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
        </svg>
      </button>

      <button className="control-btn" onClick={prevTrack} title="Previous">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </svg>
      </button>

      <button
        className="control-btn play-btn"
        onClick={togglePlay}
        disabled={!currentTrack}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <button className="control-btn" onClick={nextTrack} title="Next">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </svg>
      </button>

      <button
        className={`control-btn${repeatMode !== 'off' ? ' active' : ''}`}
        onClick={cycleRepeat}
        title={`Repeat: ${repeatMode}`}
        style={{ position: 'relative' }}
      >
        {repeatIcons[repeatMode]}
        {repeatMode === 'one' && (
          <span
            style={{
              position: 'absolute',
              fontSize: 9,
              fontWeight: 700,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            1
          </span>
        )}
      </button>
    </div>
  )
}
