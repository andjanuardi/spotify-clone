import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import usePlayerStore from '../store/playerStore'

const navItems = [
  {
    to: '/',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3L4 9v12h5v-7h6v7h5V9z" />
      </svg>
    ),
  },
  {
    to: '/search',
    label: 'Search',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
      </svg>
    ),
  },
  {
    to: '/library',
    label: 'Library',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z" />
      </svg>
    ),
  },
]

export default function Sidebar({ mobileMenuOpen, onClose }) {
  const playlists = usePlayerStore((s) => s.playlists)

  const handleNavClick = () => {
    if (onClose) onClose()
  }

  return (
    <motion.aside
      className={`sidebar${mobileMenuOpen ? ' open' : ''}`}
      initial={mobileMenuOpen !== undefined ? false : { x: -240 }}
      animate={mobileMenuOpen !== undefined ? {} : { x: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
    >
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">♪</div>
        <span>Music</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-nav-item${isActive ? ' active' : ''}`
            }
            onClick={handleNavClick}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div>
        <div className="sidebar-section-title">Playlists</div>
        <div style={{ marginTop: 8 }}>
          {playlists.length === 0 && (
            <div
              style={{
                padding: '8px 12px',
                fontSize: 13,
                color: 'var(--text-tertiary)',
              }}
            >
              No playlists yet
            </div>
          )}
          {playlists.map((pl) => (
            <NavLink
              key={pl.id}
              to={`/playlist/${pl.id}`}
              className={({ isActive }) =>
                `sidebar-playlist-item${isActive ? ' active' : ''}`
              }
              onClick={handleNavClick}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ opacity: 0.6, flexShrink: 0 }}
              >
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
              <span>{pl.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </motion.aside>
  )
}
