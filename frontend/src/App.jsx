import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { lazy, Suspense, useEffect } from 'react'
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
  const showQueue = usePlayerStore((s) => s.showQueue)
  const setFavorites = usePlayerStore((s) => s.setFavorites)
  const setPlaylists = usePlayerStore((s) => s.setPlaylists)

  useEffect(() => {
    api.getFavorites().then((d) => setFavorites(d.favorites)).catch(() => {})
    api.getPlaylists().then((d) => setPlaylists(d.playlists)).catch(() => {})
  }, [])

  return (
    <div className="app-layout">
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
    </div>
  )
}
