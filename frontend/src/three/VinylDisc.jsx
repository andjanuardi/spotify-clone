import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'
import usePlayerStore from '../store/playerStore'

function Disc({ thumbnail }) {
  const meshRef = useRef()
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const texture = useMemo(() => {
    if (!thumbnail) return null
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = thumbnail
    const tex = new THREE.Texture(img)
    tex.needsUpdate = true
    return tex
  }, [thumbnail])

  useFrame((_, delta) => {
    if (meshRef.current && isPlaying) {
      meshRef.current.rotation.y += delta * 0.8
    }
  })

  return (
    <group ref={meshRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[3, 3, 0.15, 64]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {texture && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
          <cylinderGeometry args={[1, 1, 0.01, 32]} />
          <meshStandardMaterial map={texture} />
        </mesh>
      )}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.02, 16]} />
        <meshStandardMaterial color="#666" />
      </mesh>
    </group>
  )
}

export default function VinylDisc() {
  const currentTrack = usePlayerStore((s) => s.currentTrack)

  if (!currentTrack) return null

  return (
    <div
      style={{
        position: 'fixed',
        right: 40,
        bottom: 'calc(var(--nowplaying-height) + 20px)',
        width: 200,
        height: 200,
        zIndex: 5,
        pointerEvents: 'none',
        opacity: 0.6,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 40 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={0.8} />
        <Disc thumbnail={currentTrack.thumbnail} />
      </Canvas>
    </div>
  )
}
