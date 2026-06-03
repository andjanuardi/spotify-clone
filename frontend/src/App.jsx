import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { lazy, Suspense, useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import NowPlayingBar from './components/NowPlayingBar'
import QueueDrawer from './components/QueueDrawer'
import usePlayerStore from './store/playerStore'
import * as api from './api'

const Home = lazy(() => import('./pages/Home'))
const Search = lazy(() => import('./pages/Search'))
const Library = lazy(() => import('./pages/Library'))
const PlaylistPage = lazy(() => import('./pages/Playlist'))

function Loading() {
  return (
    <div className="loading-spinner">
      <div className="spinner" />
    </div>
  )
}

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const showQueue = usePlayerStore((s) => s.showQueue)
  const setFavorites = usePlayerStore((s) => s.setFavorites)
  const setPlaylists = usePlayerStore((s) => s.setPlaylists)

  useEffect(() => {
    api.getFavorites().then((d) => setFavorites(d.favorites)).catch(() => {})
    api.getPlaylists().then((d) => setPlaylists(d.playlists)).catch(() => {})
  }, [])

  return (
    <div className="app-layout">
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          {mobileMenuOpen ? (
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          ) : (
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          )}
        </svg>
      </button>
      {mobileMenuOpen && <div className="mobile-backdrop" onClick={() => setMobileMenuOpen(false)} />}
      <Sidebar mobileMenuOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="main-content">
        <div className="main-content-inner">
          <Suspense fallback={<Loading />}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/library" element={<Library />} />
                <Route path="/playlist/:id" element={<PlaylistPage />} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </div>
      </div>
      <NowPlayingBar />
      {showQueue && <QueueDrawer />}
    </div>
  )
}
