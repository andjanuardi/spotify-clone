import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import usePlayerStore from '../store/playerStore'

function VisualizerBars({ barCount = 48 }) {
  const meshRef = useRef()
  const analyserNode = usePlayerStore((s) => s.analyserNode)

  const { positions, scales } = useMemo(() => {
    const pos = new Float32Array(barCount * 3)
    const sc = new Float32Array(barCount)
    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2
      const radius = 4
      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = Math.sin(angle) * radius
      pos[i * 3 + 2] = 0
      sc[i] = 0.5
    }
    return { positions: pos, scales: sc }
  }, [barCount])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(() => {
    if (!meshRef.current) return

    if (analyserNode) {
      const data = new Uint8Array(analyserNode.frequencyBinCount)
      analyserNode.getByteFrequencyData(data)

      const step = Math.floor(data.length / barCount)
      for (let i = 0; i < barCount; i++) {
        const val = data[i * step] / 255
        const height = 0.3 + val * 4
        dummy.position.set(
          positions[i * 3],
          positions[i * 3 + 1],
          positions[i * 3 + 2]
        )
        dummy.lookAt(0, 0, 0)
        dummy.scale.set(0.3, height, 0.3)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)
      }
    } else {
      for (let i = 0; i < barCount; i++) {
        dummy.position.set(
          positions[i * 3],
          positions[i * 3 + 1],
          positions[i * 3 + 2]
        )
        dummy.lookAt(0, 0, 0)
        dummy.scale.set(0.3, 0.5, 0.3)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, barCount]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="#667eea"
        emissive="#764ba2"
        emissiveIntensity={0.3}
        toneMapped={false}
      />
    </instancedMesh>
  )
}

function VisualizerCenter() {
  const meshRef = useRef()
  const analyserNode = usePlayerStore((s) => s.analyserNode)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()

    if (analyserNode) {
      const data = new Uint8Array(analyserNode.frequencyBinCount)
      analyserNode.getByteFrequencyData(data)
      const avg = data.reduce((a, b) => a + b, 0) / data.length / 255
      const scale = 0.5 + avg * 1.5
      meshRef.current.scale.set(scale, scale, scale)
    }

    meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.3
    meshRef.current.rotation.y = Math.sin(t * 0.5) * 0.3
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[0.8, 1]} />
      <meshStandardMaterial
        color="#764ba2"
        wireframe
        transparent
        opacity={0.6}
      />
    </mesh>
  )
}

export default function AudioVisualizer() {
  const showVisualizer = usePlayerStore((s) => s.showVisualizer)
  const currentTrack = usePlayerStore((s) => s.currentTrack)

  if (!showVisualizer || !currentTrack) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 'var(--sidebar-width)',
        right: 0,
        bottom: 'var(--nowplaying-height)',
        zIndex: 1,
        pointerEvents: 'none',
        opacity: 0.2,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <VisualizerBars />
        <VisualizerCenter />
      </Canvas>
    </div>
  )
}
