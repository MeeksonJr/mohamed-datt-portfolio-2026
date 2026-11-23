'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PointMaterial, Points, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import type { RocketTransitionPhase } from '@/components/studio/PortfolioStoreProvider'

function RocketCraft({
  phase,
  isLight,
}: {
  phase: Exclude<RocketTransitionPhase, 'idle'>
  isLight: boolean
}) {
  const shipRef = useRef<THREE.Group>(null)
  const flameRef = useRef<THREE.Mesh>(null)
  const padRef = useRef<THREE.Mesh>(null)
  const elapsedRef = useRef(0)

  const exhaustPositions = useMemo(() => {
    const count = 240
    const arr = new Float32Array(count * 3)
    let seed = 3317
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rand() - 0.5) * 0.45
      arr[i * 3 + 1] = -rand() * 2.8 - 1.1
      arr[i * 3 + 2] = (rand() - 0.5) * 0.45
    }
    return arr
  }, [])

  useFrame((state, delta) => {
    elapsedRef.current += delta
    const t = elapsedRef.current

    if (shipRef.current) {
      if (phase === 'launch') {
        // 0..0.65s ignition shake, then rapid liftoff
        if (t < 0.65) {
          shipRef.current.position.y = -1.6 + Math.sin(t * 48) * 0.03
          shipRef.current.position.x = Math.cos(t * 52) * 0.03
        } else {
          const climb = Math.pow((t - 0.65) / 1.5, 2.1) * 10.5
          shipRef.current.position.y = -1.6 + climb
          shipRef.current.position.x = 0
          shipRef.current.rotation.y += delta * 0.85
        }
      } else {
        // Landing descent from orbit to pad
        const progress = Math.min(1, t / 1.9)
        const eased = 1 - Math.pow(1 - progress, 3)
        shipRef.current.position.y = 6.2 - eased * 7.8
        shipRef.current.rotation.y = (1 - eased) * 1.4
      }
    }

    if (flameRef.current) {
      const flicker = 0.85 + Math.sin(t * 42) * 0.28
      flameRef.current.scale.set(1, flicker * (phase === 'launch' ? 1.4 : 0.9), 1)
    }

    if (padRef.current) {
      padRef.current.rotation.z += delta * 0.5
    }

    if (state.camera instanceof THREE.PerspectiveCamera) {
      const targetFov = phase === 'launch' && t > 0.7 ? 58 : 46
      state.camera.fov = THREE.MathUtils.damp(state.camera.fov, targetFov, 4, delta)
      state.camera.updateProjectionMatrix()
    }
  })

  return (
    <group>
      {/* Launch / Landing Pad Ring */}
      <mesh ref={padRef} position={[0, -2.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.05, 16, 64]} />
        <meshStandardMaterial color="#E06D43" emissive="#E06D43" emissiveIntensity={1.6} />
      </mesh>
      <mesh position={[0, -2.58, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.9, 48]} />
        <meshBasicMaterial color="#2DD4BF" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      {/* 3D Rocketship */}
      <group ref={shipRef} position={[0, phase === 'launch' ? -1.6 : 6.2, 0]}>
        {/* Main Titanium Fuselage */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.44, 1.85, 24]} />
          <meshPhysicalMaterial
            color={isLight ? '#3B312B' : '#E6DEC8'}
            metalness={0.7}
            roughness={0.2}
            clearcoat={0.8}
          />
        </mesh>

        {/* Terracotta Nose Cone */}
        <mesh position={[0, 1.32, 0]}>
          <coneGeometry args={[0.38, 0.82, 24]} />
          <meshStandardMaterial color="#E06D43" metalness={0.35} roughness={0.3} />
        </mesh>

        {/* Porthole Viewport */}
        <mesh position={[0, 0.35, 0.36]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color="#2DD4BF" emissive="#2DD4BF" emissiveIntensity={1.8} />
        </mesh>

        {/* 4 Swept Fins */}
        {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((rot, idx) => (
          <group key={idx} rotation={[0, rot, 0]}>
            <mesh position={[0.45, -0.62, 0]} rotation={[0, 0, -0.35]}>
              <boxGeometry args={[0.36, 0.68, 0.06]} />
              <meshStandardMaterial color="#C85A32" metalness={0.5} roughness={0.35} />
            </mesh>
          </group>
        ))}

        {/* Thruster Nozzle */}
        <mesh position={[0, -1.04, 0]}>
          <cylinderGeometry args={[0.22, 0.32, 0.28, 16]} />
          <meshStandardMaterial color="#1F243B" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Exhaust Flame Cone */}
        <mesh ref={flameRef} position={[0, -1.65, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.26, 1.15, 16]} />
          <meshBasicMaterial color="#F2A65A" transparent opacity={0.85} />
        </mesh>

        {/* Thruster Exhaust Particle Plume */}
        <Points positions={exhaustPositions} stride={3} frustumCulled={false}>
          <PointMaterial
            transparent
            color="#E06D43"
            size={0.14}
            sizeAttenuation
            depthWrite={false}
            opacity={0.8}
          />
        </Points>
      </group>
    </group>
  )
}

export default function RocketTransitionScene({
  phase,
  isLight,
}: {
  phase: Exclude<RocketTransitionPhase, 'idle'>
  isLight: boolean
}) {
  return (
    <Canvas camera={{ position: [0, 0.4, 6.8], fov: 46 }} dpr={[1, 1.75]}>
      <color attach="background" args={[isLight ? '#DFD5C0' : '#161A2B']} />
      <fogExp2 attach="fog" args={[isLight ? '#DFD5C0' : '#161A2B', 0.045]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[6, 8, 6]} intensity={1.8} color="#FFF6E5" />
      <pointLight position={[0, -2, 3]} intensity={2.5} color="#E06D43" />
      <Sparkles count={120} scale={12} size={2.2} speed={2.5} color="#F2A65A" />
      <RocketCraft phase={phase} isLight={isLight} />
    </Canvas>
  )
}
