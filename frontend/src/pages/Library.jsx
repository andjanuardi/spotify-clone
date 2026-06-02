import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SongCard from '../components/SongCard'
import * as api from '../api'
import usePlayerStore from '../store/playerStore'

export default function Library() {
  const favorites = usePlayerStore((s) => s.favorites)
  const playlists = usePlayerStore((s) => s.playlists)
  const setFavorites = usePlayerStore((s) => s.setFavorites)
  const setPlaylists = usePlayerStore((s) => s.setPlaylists)
  const [playlistName, setPlaylistName] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) return
    setCreating(true)
    try {
      await api.createPlaylist(playlistName.trim())
      setPlaylistName('')
      const data = await api.getPlaylists()
      setPlaylists(data.playlists)
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  const handleRemoveFavorite = async (videoId) => {
    try {
      await api.removeFavorite(videoId)
      const data = await api.getFavorites()
      setFavorites(data.favorites)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeletePlaylist = async (id) => {
    try {
      await api.deletePlaylist(id)
      const data = await api.getPlaylists()
      setPlaylists(data.playlists)
    } catch (err) {
      console.error(err)
    }
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="page-header">
        <h1 className="page-title">Library</h1>
        <p className="page-subtitle">Your saved music and playlists</p>
      </div>

      <div className="page-section">
        <div className="section-header">
          <h2 className="section-title">Playlists</h2>
        </div>

        <div className="playlist-create">
          <input
            className="playlist-create-input"
            type="text"
            placeholder="New playlist name..."
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
          />
          <button
            className="playlist-create-btn"
            onClick={handleCreatePlaylist}
            disabled={!playlistName.trim() || creating}
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>

        {playlists.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z" />
            </svg>
            <div className="empty-state-text">No playlists yet</div>
          </div>
        ) : (
          <div className="section-grid">
            <AnimatePresence>
              {playlists.map((pl) => (
                <motion.div
                  key={pl.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  style={{ position: 'relative' }}
                >
                  <Link to={`/playlist/${pl.id}`}>
                    <div className="playlist-card">
                      <div className="playlist-card-icon">♪</div>
                      <div className="playlist-card-title">{pl.name}</div>
                      <div className="playlist-card-desc">
                        {pl.song_count || 0} songs
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleDeletePlaylist(pl.id)}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      padding: 4,
                      borderRadius: '50%',
                      color: 'var(--text-tertiary)',
                      fontSize: 16,
                    }}
                    title="Delete playlist"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="page-section">
        <div className="section-header">
          <h2 className="section-title">Favorites</h2>
        </div>

        {favorites.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <div className="empty-state-text">No favorites yet</div>
          </div>
        ) : (
          <div className="track-list">
            <AnimatePresence>
              {favorites.map((song) => (
                <motion.div
                  key={song.video_id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <SongCard song={song} compact />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}
