import { motion } from 'framer-motion'
import usePlayerStore from '../store/playerStore'
import * as api from '../api'

export default function SongCard({ song, compact }) {
  const playTrack = usePlayerStore((s) => s.playTrack)
  const favorites = usePlayerStore((s) => s.favorites)
  const playlists = usePlayerStore((s) => s.playlists)
  const setFavorites = usePlayerStore((s) => s.setFavorites)

  const isFav = favorites.some((f) => f.video_id === song.video_id)
  const durationStr = song.duration
    ? `${Math.floor(song.duration / 60)}:${(song.duration % 60)
        .toString()
        .padStart(2, '0')}`
    : '?'

  const toggleFav = async (e) => {
    e.stopPropagation()
    try {
      if (isFav) {
        await api.removeFavorite(song.video_id)
      } else {
        await api.addFavorite(song)
      }
      const data = await api.getFavorites()
      setFavorites(data.favorites)
    } catch (err) {
      console.error(err)
    }
  }

  const addToPlaylist = (e, playlistId) => {
    e.stopPropagation()
    api.addSongToPlaylist(playlistId, song).catch(console.error)
  }

  if (compact) {
    return (
      <motion.div
        className="song-row"
        onClick={() => playTrack(song)}
        whileTap={{ scale: 0.98 }}
        layout
      >
        <img
          className="song-row-thumb"
          src={song.thumbnail || ''}
          alt=""
          onError={(e) => { e.target.style.display = 'none' }}
        />
        <div className="song-row-info">
          <div className="song-row-title">{song.title}</div>
          <div className="song-row-artist">{song.artist}</div>
        </div>
        <div className="song-row-actions">
          <button
            className={`favorite-btn${isFav ? ' active' : ''}`}
            onClick={toggleFav}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
          {playlists.length > 0 && (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const menu = e.currentTarget.nextSibling
                  menu.style.display = menu.style.display === 'block' ? 'none' : 'block'
                }}
                title="Add to playlist"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14m-7-7h14" />
                </svg>
              </button>
              <div
                style={{
                  display: 'none',
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  padding: 4,
                  zIndex: 50,
                  minWidth: 140,
                }}
              >
                {playlists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={(e) => addToPlaylist(e, pl.id)}
                    style={{
                      padding: '6px 12px',
                      fontSize: 13,
                      cursor: 'pointer',
                      borderRadius: 4,
                    }}
                    onMouseEnter={(e) => (e.target.style.background = 'var(--bg-highlight)')}
                    onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                  >
                    {pl.name}
                  </div>
                ))}
              </div>
            </div>
          )}
          <span className="song-row-duration">{durationStr}</span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="song-card"
      onClick={() => playTrack(song)}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.96 }}
      layout
    >
      <img
        className="song-card-thumb"
        src={song.thumbnail || ''}
        alt={song.title}
        onError={(e) => {
          e.target.style.display = 'none'
          e.target.parentElement.style.background = 'var(--accent-gradient)'
          e.target.parentElement.style.display = 'flex'
          e.target.parentElement.style.alignItems = 'center'
          e.target.parentElement.style.justifyContent = 'center'
          e.target.parentElement.textContent = '♪'
          e.target.parentElement.style.fontSize = '48px'
        }}
      />
      <div className="song-card-title">{song.title}</div>
      <div className="song-card-artist">{song.artist}</div>
      <motion.div
        className="song-card-play"
        whileHover={{ scale: 1.1 }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </motion.div>
    </motion.div>
  )
}
