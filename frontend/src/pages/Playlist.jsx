import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SongCard from '../components/SongCard'
import * as api from '../api'
import usePlayerStore from '../store/playerStore'

export default function Playlist() {
  const { id } = useParams()
  const [songs, setSongs] = useState([])
  const [playlistInfo, setPlaylistInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const playlists = usePlayerStore((s) => s.playlists)
  const playTrack = usePlayerStore((s) => s.playTrack)

  useEffect(() => {
    setLoading(true)
    const pl = playlists.find((p) => p.id === Number(id))
    setPlaylistInfo(pl || null)

    api
      .getPlaylistSongs(id)
      .then((d) => setSongs(d.songs))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id, playlists])

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playTrack(songs[0])
      const store = usePlayerStore.getState()
      const remaining = songs.slice(1).filter((s) => s.video_id !== songs[0].video_id)
      if (remaining.length > 0) {
        store.setCurrentTrack(songs[0])
        store.setPlaying(true)
        remaining.forEach((s) => {
          if (!store.queue.find((q) => q.video_id === s.video_id)) {
            store.addToQueue(s)
          }
        })
      }
    }
  }

  const handleRemoveSong = async (songId) => {
    try {
      await api.removeSongFromPlaylist(id, songId)
      setSongs((prev) => prev.filter((s) => s.id !== songId))
    } catch (err) {
      console.error(err)
    }
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  if (loading) {
    return (
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-end', gap: 24 }}>
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 64,
            flexShrink: 0,
          }}
        >
          ♪
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Playlist
          </div>
          <h1 className="page-title" style={{ fontSize: 48 }}>
            {playlistInfo?.name || 'Playlist'}
          </h1>
          <p className="page-subtitle" style={{ marginTop: 8 }}>
            {songs.length} songs
          </p>
          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            <button
              onClick={handlePlayAll}
              style={{
                padding: '12px 32px',
                background: 'var(--accent-gradient)',
                borderRadius: 24,
                fontSize: 14,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              disabled={songs.length === 0}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play All
            </button>
            <Link
              to="/library"
              style={{
                padding: '12px 24px',
                border: '1px solid var(--bg-elevated)',
                borderRadius: 24,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Back to Library
            </Link>
          </div>
        </div>
      </div>

      <div className="page-section" style={{ marginTop: 32 }}>
        {songs.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
            <div className="empty-state-text">This playlist is empty</div>
            <Link
              to="/search"
              style={{
                marginTop: 8,
                padding: '10px 24px',
                background: 'var(--accent-gradient)',
                borderRadius: 24,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Find songs
            </Link>
          </div>
        ) : (
          <div className="track-list">
            <AnimatePresence>
              {songs.map((song, idx) => (
                <motion.div
                  key={song.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: 'var(--text-tertiary)',
                      minWidth: 24,
                      textAlign: 'center',
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <SongCard song={song} compact />
                  </div>
                  <button
                    onClick={() => handleRemoveSong(song.id)}
                    className="btn-icon"
                    title="Remove from playlist"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}
