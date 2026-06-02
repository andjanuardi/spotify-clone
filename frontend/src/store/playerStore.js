import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const usePlayerStore = create(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      volume: 0.7,
      currentTime: 0,
      duration: 0,
      queue: [],
      queueIndex: -1,
      isShuffled: false,
      repeatMode: 'off',
      showQueue: false,
      showVisualizer: true,
      audioContext: null,
      analyserNode: null,
      frequencyData: null,
      favorites: [],
      playlists: [],
      audioRef: null,

      setCurrentTrack: (track) => set({ currentTrack: track }),
      setPlaying: (isPlaying) => set({ isPlaying }),
      setVolume: (volume) => set({ volume }),
      setCurrentTime: (currentTime) => set({ currentTime }),
      setDuration: (duration) => set({ duration }),
      setShowQueue: (showQueue) => set({ showQueue }),
      toggleShowQueue: () => set((s) => ({ showQueue: !s.showQueue })),
      toggleVisualizer: () => set((s) => ({ showVisualizer: !s.showVisualizer })),

      setAudioContext: (audioContext) => set({ audioContext }),
      setAnalyserNode: (analyserNode) => set({ analyserNode }),
      setFrequencyData: (frequencyData) => set({ frequencyData }),

      addToQueue: (track) =>
        set((state) => ({ queue: [...state.queue, track] })),

      removeFromQueue: (index) =>
        set((state) => ({
          queue: state.queue.filter((_, i) => i !== index),
        })),

      clearQueue: () => set({ queue: [], queueIndex: -1 }),

      playTrack: (track) => {
        const state = get()
        if (track) {
          const existsInQueue = state.queue.find(
            (t) => t.video_id === track.video_id
          )
          if (!existsInQueue) {
            set({
              currentTrack: track,
              queue: [...state.queue, track],
              queueIndex: state.queue.length,
              isPlaying: true,
            })
          } else {
            const idx = state.queue.findIndex(
              (t) => t.video_id === track.video_id
            )
            set({
              currentTrack: track,
              queueIndex: idx,
              isPlaying: true,
            })
          }
        }
      },

      togglePlay: () =>
        set((state) => {
          if (!state.currentTrack) return state
          return { isPlaying: !state.isPlaying }
        }),

      nextTrack: () => {
        const { queue, queueIndex, isShuffled, repeatMode } = get()
        if (!queue.length) return
        let nextIdx
        if (isShuffled) {
          nextIdx = Math.floor(Math.random() * queue.length)
        } else if (repeatMode === 'one') {
          nextIdx = queueIndex
        } else {
          nextIdx = (queueIndex + 1) % queue.length
        }
        set({
          queueIndex: nextIdx,
          currentTrack: queue[nextIdx],
          isPlaying: true,
        })
      },

      prevTrack: () => {
        const { queue, queueIndex } = get()
        if (!queue.length) return
        const prevIdx = (queueIndex - 1 + queue.length) % queue.length
        set({
          queueIndex: prevIdx,
          currentTrack: queue[prevIdx],
          isPlaying: true,
        })
      },

      toggleShuffle: () => set((s) => ({ isShuffled: !s.isShuffled })),

      cycleRepeat: () =>
        set((state) => {
          const modes = ['off', 'all', 'one']
          const idx = modes.indexOf(state.repeatMode)
          return { repeatMode: modes[(idx + 1) % modes.length] }
        }),

      setFavorites: (favorites) => set({ favorites }),
      setPlaylists: (playlists) => set({ playlists }),
      setAudioRef: (ref) => set({ audioRef: ref }),
    }),
    {
      name: 'spotify-clone-storage',
      partialize: (state) => ({
        volume: state.volume,
        queue: state.queue,
        queueIndex: state.queueIndex,
        currentTrack: state.currentTrack,
        favorites: state.favorites,
        playlists: state.playlists,
        isShuffled: state.isShuffled,
        repeatMode: state.repeatMode,
      }),
    }
  )
)

export default usePlayerStore
