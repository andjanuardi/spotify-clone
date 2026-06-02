const BASE = '/api'

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export const search = (query, max = 10) =>
  fetchJSON(`${BASE}/search?q=${encodeURIComponent(query)}&max=${max}`)

export const getVideoInfo = (videoId) =>
  fetchJSON(`${BASE}/info/${videoId}`)

export const getStreamUrl = (videoId) => `${BASE}/stream/${videoId}`

export const getFavorites = () => fetchJSON(`${BASE}/favorites`)

export const addFavorite = (track) =>
  fetchJSON(`${BASE}/favorites`, {
    method: 'POST',
    body: JSON.stringify(track),
  })

export const removeFavorite = (videoId) =>
  fetchJSON(`${BASE}/favorites/${videoId}`, { method: 'DELETE' })

export const getPlaylists = () => fetchJSON(`${BASE}/playlists`)

export const createPlaylist = (name, description = '') =>
  fetchJSON(`${BASE}/playlists`, {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  })

export const deletePlaylist = (id) =>
  fetchJSON(`${BASE}/playlists/${id}`, { method: 'DELETE' })

export const getPlaylistSongs = (playlistId) =>
  fetchJSON(`${BASE}/playlists/${playlistId}/songs`)

export const addSongToPlaylist = (playlistId, track) =>
  fetchJSON(`${BASE}/playlists/${playlistId}/songs`, {
    method: 'POST',
    body: JSON.stringify(track),
  })

export const removeSongFromPlaylist = (playlistId, songId) =>
  fetchJSON(`${BASE}/playlists/${playlistId}/songs/${songId}`, {
    method: 'DELETE',
  })
