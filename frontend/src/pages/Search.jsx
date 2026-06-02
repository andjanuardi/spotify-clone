import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import SearchBar from '../components/SearchBar'
import SearchResults from '../components/SearchResults'
import { search as searchApi } from '../api'

export default function Search() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [query, setQuery] = useState('')

  const handleSearch = useCallback(async (q) => {
    setQuery(q)
    setLoading(true)
    setHasSearched(true)
    try {
      const data = await searchApi(q)
      setResults(data.results)
    } catch (err) {
      console.error(err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="page-header">
        <h1 className="page-title">Search</h1>
        <p className="page-subtitle">Find millions of songs from YouTube</p>
      </div>

      <SearchBar onSearch={handleSearch} />

      {loading && (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      )}

      {!loading && hasSearched && results.length === 0 && (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <div className="empty-state-text">
            No results found for "{query}"
          </div>
        </motion.div>
      )}

      {!loading && results.length > 0 && <SearchResults results={results} />}
    </motion.div>
  )
}
