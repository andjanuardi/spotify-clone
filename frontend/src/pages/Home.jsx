import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SongCard from '../components/SongCard'
import { getTrending, getFavorites, getPlaylists } from '../api'
import usePlayerStore from '../store/playerStore'

export default function Home() {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const favorites = usePlayerStore((s) => s.favorites)
  const playlists = usePlayerStore((s) => s.playlists)
  const setFavorites = usePlayerStore((s) => s.setFavorites)
  const setPlaylists = usePlayerStore((s) => s.setPlaylists)

  useEffect(() => {
    getTrending()
      .then((d) => setSuggestions(d.results))
      .catch(() => {})
      .finally(() => setLoading(false))

    getFavorites().then((d) => setFavorites(d.favorites)).catch(() => {})
    getPlaylists().then((d) => setPlaylists(d.playlists)).catch(() => {})
  }, [])

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="page-header">
        <h1 className="page-title">Home</h1>
        <p className="page-subtitle">Discover and play your favorite music</p>
      </div>

      <motion.div
        className="page-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="section-header">
          <h2 className="section-title">Trending</h2>
          <Link to="/search" className="section-link">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        ) : (
          <div className="section-grid">
            {suggestions.map((song) => (
              <SongCard key={song.video_id} song={song} />
            ))}
          </div>
        )}
      </motion.div>

      {favorites.length > 0 && (
        <motion.div
          className="page-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="section-header">
            <h2 className="section-title">Favorites</h2>
            <Link to="/library" className="section-link">
              View all
            </Link>
          </div>
          <div className="track-list">
            {favorites.slice(0, 5).map((song) => (
              <SongCard key={song.video_id} song={song} compact />
            ))}
          </div>
        </motion.div>
      )}

      {playlists.length > 0 && (
        <motion.div
          className="page-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="section-header">
            <h2 className="section-title">Your Playlists</h2>
            <Link to="/library" className="section-link">
              View all
            </Link>
          </div>
          <div className="section-grid">
            {playlists.slice(0, 4).map((pl) => (
              <Link key={pl.id} to={`/playlist/${pl.id}`}>
                <div className="playlist-card">
                  <div className="playlist-card-icon">♪</div>
                  <div className="playlist-card-title">{pl.name}</div>
                  <div className="playlist-card-desc">
                    {pl.song_count || 0} songs
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {!loading && suggestions.length === 0 && (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
          <div className="empty-state-text">
            Try searching for a song to get started
          </div>
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
            Go to Search
          </Link>
        </div>
      )}
    </motion.div>
  )
}
