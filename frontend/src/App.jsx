import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { lazy, Suspense, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import NowPlayingBar from './components/NowPlayingBar'
import QueueDrawer from './components/QueueDrawer'
import ParticleField from './three/ParticleField'
import AudioVisualizer from './three/AudioVisualizer'
import VinylDisc from './three/VinylDisc'
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
  const showQueue = usePlayerStore((s) => s.showQueue)
  const setFavorites = usePlayerStore((s) => s.setFavorites)
  const setPlaylists = usePlayerStore((s) => s.setPlaylists)

  useEffect(() => {
    api.getFavorites().then((d) => setFavorites(d.favorites)).catch(() => {})
    api.getPlaylists().then((d) => setPlaylists(d.playlists)).catch(() => {})
  }, [])

  return (
    <div className="app-layout">
      <ParticleField />
      <AudioVisualizer />
      <VinylDisc />
      <Sidebar />
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
      <button
        className="visualizer-toggle"
        onClick={() => usePlayerStore.getState().toggleVisualizer()}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
        Visualizer
      </button>
    </div>
  )
}
