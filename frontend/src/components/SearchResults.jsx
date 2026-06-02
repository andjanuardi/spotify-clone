import { motion } from 'framer-motion'
import SongCard from './SongCard'

export default function SearchResults({ results }) {
  if (!results || results.length === 0) return null

  return (
    <motion.div
      className="search-results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.05 }}
    >
      {results.map((song, i) => (
        <motion.div
          key={song.video_id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
        >
          <SongCard song={song} />
        </motion.div>
      ))}
    </motion.div>
  )
}
