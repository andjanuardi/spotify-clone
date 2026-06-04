import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useToastStore from '../store/toastStore'

export default function Toast() {
  const message = useToastStore((s) => s.message)
  const hideToast = useToastStore((s) => s.hideToast)

  useEffect(() => {
    if (message) {
      const timer = setTimeout(hideToast, 2000)
      return () => clearTimeout(timer)
    }
  }, [message, hideToast])

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="toast"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
