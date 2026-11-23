'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Float,
  Line,
  MeshDistortMaterial,
  OrbitControls,
  PointMaterial,
  Points,
  RoundedBox,
  Sparkles,
} from '@react-three/drei'
import * as THREE from 'three'
import type { PlanetDefinition, PlanetMoonNode } from '@/lib/content/planets'
import type { AvatarMode, AvatarMood } from '@/lib/content/types'

export interface OdysseyWorldSceneProps {
  planets: PlanetDefinition[]
  activeSector: number
  isWarping: boolean
  selectedNodeId: string | null
  mode: AvatarMode
  mood: AvatarMood
  audioLevel: number
  isLight: boolean
  freeLook: boolean
  hologramHidden: boolean
  wireframe: boolean
  onSelectPlanet: (index: number) => void
  onSelectMoonNode: (nodeId: string) => void
  onTelemetryTick?: (camPos: [number, number, number]) => void
}

const MOOD_ACCENTS: Record<AvatarMood, { primary: string; secondary: string }> = {
  idle: { primary: '#E06D43', secondary: '#2DD4BF' },
  listening: { primary: '#2DD4BF', secondary: '#F2A65A' },
  speaking: { primary: '#F2A65A', secondary: '#38BDF8' },
  coding: { primary: '#38BDF8', secondary: '#E06D43' },
  celebrating: { primary: '#F59E0B', secondary: '#E6DEC8' },
}

function SpriteBadge({
  label,
  color,
  selected,
  hovered,
  position = [0, 0.28, 0],
  onHover,
  onClick,
}: {
  label: string
  color: string
  selected?: boolean
  hovered?: boolean
  position?: [number, number, number]
  onHover?: (h: boolean) => void
  onClick?: () => void
}) {
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 300
    canvas.height = 68
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = selected ? 'rgba(224, 109, 67, 0.92)' : 'rgba(22, 26, 44, 0.88)'
    ctx.strokeStyle = selected ? '#F5EFE2' : color
    ctx.lineWidth = selected ? 3.5 : 2.5

    ctx.beginPath()
    ctx.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 22)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#F8FAFC'
    ctx.font = 'bold 21px ui-monospace, SFMono-Regular, Menlo, monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, canvas.width / 2, canvas.height / 2 + 1)

    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [label, color, selected])

  useEffect(() => {
    return () => texture?.dispose()
  }, [texture])

  if (!texture) return null

  return (
    <sprite
      position={position}
      scale={selected || hovered ? [1.34, 0.31, 1] : [1.14, 0.26, 1]}
      onPointerOver={(e) => {
        e.stopPropagation()
        onHover?.(true)
      }}
      onPointerOut={() => onHover?.(false)}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
    >
      <spriteMaterial map={texture} transparent depthTest={false} />
    </sprite>
  )
}

function ActivePlanetMoons({
  moons,
  selectedNodeId,
  onSelectMoonNode,
}: {
  moons: PlanetMoonNode[]
  selectedNodeId: string | null
  onSelectMoonNode: (id: string) => void
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const refs = useRef<Array<THREE.Group | null>>([])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    moons.forEach((moon, idx) => {
      const node = refs.current[idx]
      if (!node) return
      const angle = t * moon.speed + moon.offset
      node.position.set(
        Math.cos(angle) * moon.radius,
        moon.y + Math.sin(t * 1.1 + idx) * 0.14,
        Math.sin(angle) * moon.radius * 0.78
      )
    })
  })

  return (
    <group>
      {moons.map((moon, idx) => {
        const isSelected = selectedNodeId === moon.id
        const isHovered = hoveredId === moon.id
        return (
          <group
            key={moon.id}
            ref={(el) => {
              refs.current[idx] = el
            }}
          >
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation()
                setHoveredId(moon.id)
              }}
              onPointerOut={() => setHoveredId(null)}
              onClick={(e) => {
                e.stopPropagation()
                onSelectMoonNode(moon.id)
              }}
            >
              <octahedronGeometry args={[isSelected ? 0.2 : 0.145, 0]} />
              <meshStandardMaterial
                color={moon.color}
                emissive={moon.color}
                emissiveIntensity={isSelected ? 2.8 : isHovered ? 2.2 : 1.2}
              />
            </mesh>
            <SpriteBadge
              label={moon.label}
              color={moon.color}
              selected={isSelected}
              hovered={isHovered}
              onHover={(h) => setHoveredId(h ? moon.id : null)}
              onClick={() => onSelectMoonNode(moon.id)}
            />
          </group>
        )
      })}
    </group>
  )
}

function PrimePlanetVisual({
  mode,
  mood,
  audioLevel,
  wireframe,
  isLight,
}: {
  mode: AvatarMode
  mood: AvatarMood
  audioLevel: number
  wireframe: boolean
  isLight: boolean
}) {
  const headGroup = useRef<THREE.Group>(null)
  const ringA = useRef<THREE.Mesh>(null)
  const ringB = useRef<THREE.Mesh>(null)
  const eqRefs = useRef<Array<THREE.Mesh | null>>([])
  const coreRef = useRef<THREE.Mesh>(null)

  const palette = MOOD_ACCENTS[mood]
  const energy = Math.min(1, Math.max(0, audioLevel))

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (headGroup.current) {
      headGroup.current.rotation.y = THREE.MathUtils.lerp(
        headGroup.current.rotation.y,
        state.pointer.x * 0.42,
        delta * 5
      )
      headGroup.current.rotation.x = THREE.MathUtils.lerp(
        headGroup.current.rotation.x,
        -state.pointer.y * 0.25,
        delta * 5
      )
      headGroup.current.position.y = 0.65 + Math.sin(t * 2) * 0.05
    }
    if (ringA.current && ringB.current) {
      ringA.current.rotation.z += delta * (0.3 + energy)
      ringB.current.rotation.y -= delta * 0.25
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * (0.4 + energy)
    }
    eqRefs.current.forEach((bar, idx) => {
      if (!bar) return
      const amp =
        mood === 'speaking'
          ? 0.45 + Math.abs(Math.sin(t * 14 + idx * 0.9)) * (0.9 + energy * 1.4)
          : 0.24 + Math.abs(Math.sin(t * 2.5 + idx)) * 0.16
      bar.scale.y = THREE.MathUtils.lerp(bar.scale.y, amp, delta * 12)
    })
  })

  if (mode === 'neural') {
    return (
      <group>
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[1.05, 4]} />
          <MeshDistortMaterial
            color={palette.primary}
            emissive={palette.secondary}
            emissiveIntensity={0.65 + energy}
            distort={0.3 + energy * 0.35}
            speed={2.2}
            roughness={0.22}
            metalness={0.55}
            wireframe={wireframe}
          />
        </mesh>
        <mesh ref={ringA} rotation={[Math.PI / 2.4, 0.25, 0]}>
          <torusGeometry args={[1.68, 0.05, 16, 96]} />
          <meshStandardMaterial color="#F2A65A" emissive="#E06D43" emissiveIntensity={1.6} />
        </mesh>
        <mesh ref={ringB} rotation={[Math.PI / 3.1, -0.35, 0]}>
          <torusGeometry args={[2.0, 0.025, 16, 96]} />
          <meshStandardMaterial color={palette.secondary} emissive={palette.secondary} emissiveIntensity={1.4} />
        </mesh>
      </group>
    )
  }

  if (mode === 'workstation') {
    return (
      <group>
        <mesh ref={coreRef}>
          <sphereGeometry args={[1.18, 36, 36]} />
          <meshStandardMaterial color="#B8502B" roughness={0.7} metalness={0.2} wireframe={wireframe} />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.2, 24, 18]} />
          <meshBasicMaterial color="#F2A65A" wireframe transparent opacity={0.24} />
        </mesh>
        <mesh ref={ringA} rotation={[Math.PI / 2.2, 0.2, 0]}>
          <torusGeometry args={[1.72, 0.025, 16, 80]} />
          <meshStandardMaterial color={palette.secondary} emissive={palette.secondary} emissiveIntensity={1.5} />
        </mesh>
      </group>
    )
  }

  return (
    <group>
      <mesh position={[0, -0.1, -0.6]}>
        <boxGeometry args={[1.1, 2.6, 0.22]} />
        <meshPhysicalMaterial
          color={isLight ? '#2D2522' : '#1E2336'}
          metalness={0.82}
          roughness={0.18}
          wireframe={wireframe}
        />
      </mesh>
      <mesh ref={ringA} rotation={[Math.PI / 2.3, 0.1, 0]}>
        <torusGeometry args={[1.65, 0.022, 16, 80]} />
        <meshStandardMaterial color={palette.primary} emissive={palette.primary} emissiveIntensity={1.4 + energy} />
      </mesh>
      <mesh ref={ringB} rotation={[0.45, 0.2, 0.5]}>
        <torusGeometry args={[1.92, 0.016, 16, 80]} />
        <meshStandardMaterial color={palette.secondary} emissive={palette.secondary} emissiveIntensity={1.2} />
      </mesh>
      <group ref={headGroup} position={[0, 0.65, 0.15]}>
        <RoundedBox args={[0.96, 0.74, 0.82]} radius={0.2} smoothness={4}>
          <meshPhysicalMaterial
            color={isLight ? '#3B312B' : '#252B42'}
            metalness={0.72}
            roughness={0.22}
            wireframe={wireframe}
          />
        </RoundedBox>
        <RoundedBox args={[0.82, 0.4, 0.14]} radius={0.09} position={[0, 0.02, 0.38]}>
          <meshPhysicalMaterial color="#111524" roughness={0.08} transparent opacity={0.92} />
        </RoundedBox>
        <mesh position={[-0.19, 0.1, 0.46]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color={palette.secondary} emissive={palette.secondary} emissiveIntensity={2.5} />
        </mesh>
        <mesh position={[0.19, 0.1, 0.46]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color={palette.secondary} emissive={palette.secondary} emissiveIntensity={2.5} />
        </mesh>
        {[-0.18, -0.09, 0, 0.09, 0.18].map((xPos, idx) => (
          <mesh
            key={xPos}
            ref={(el) => {
              eqRefs.current[idx] = el
            }}
            position={[xPos, -0.09, 0.46]}
          >
            <boxGeometry args={[0.045, 0.14, 0.02]} />
            <meshStandardMaterial color={palette.primary} emissive={palette.primary} emissiveIntensity={2.2} />
          </mesh>
        ))}
      </group>
      <group position={[0, -0.25, 0.15]}>
        <RoundedBox args={[0.82, 0.74, 0.54]} radius={0.16}>
          <meshPhysicalMaterial
            color={isLight ? '#4A3D35' : '#20263B'}
            metalness={0.68}
            roughness={0.26}
            wireframe={wireframe}
          />
        </RoundedBox>
        <mesh position={[0, 0.04, 0.29]}>
          <octahedronGeometry args={[0.16, 1]} />
          <meshStandardMaterial color={palette.primary} emissive={palette.primary} emissiveIntensity={1.9 + energy * 2} />
        </mesh>
      </group>
    </group>
  )
}

function DistinctPlanetBody({
  station,
  isActive,
  selectedNodeId,
  wireframe,
  isLight,
  mode,
  mood,
  audioLevel,
  onSelectPlanet,
  onSelectMoonNode,
}: {
  station: PlanetDefinition
  isActive: boolean
  selectedNodeId: string | null
  wireframe: boolean
  isLight: boolean
  mode: AvatarMode
  mood: AvatarMood
  audioLevel: number
  onSelectPlanet: () => void
  onSelectMoonNode: (id: string) => void
}) {
  const spinRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((_, delta) => {
    if (spinRef.current) {
      spinRef.current.rotation.y += delta * (isActive ? 0.22 : 0.12)
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.18
    }
  })

  // Render tailored 3D planet anatomy per sector
  const renderPlanetCore = () => {
    if (station.index === 0) {
      return (
        <PrimePlanetVisual
          mode={mode}
          mood={mood}
          audioLevel={audioLevel}
          wireframe={wireframe}
          isLight={isLight}
        />
      )
    }

    if (station.index === 1) {
      // Planet 02: Terra Origin Globe with trajectory arcs
      return (
        <group ref={spinRef}>
          <mesh>
            <sphereGeometry args={[1.28, 36, 36]} />
            <meshStandardMaterial
              color={isLight ? '#2C7A7B' : '#1E4E68'}
              roughness={0.55}
              metalness={0.25}
              wireframe={wireframe}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[1.31, 20, 14]} />
            <meshBasicMaterial color="#F2A65A" wireframe transparent opacity={0.22} />
          </mesh>
          <mesh ref={ringRef} rotation={[Math.PI / 2.2, 0.25, 0]}>
            <torusGeometry args={[1.75, 0.025, 16, 80]} />
            <meshStandardMaterial color="#F2A65A" emissive="#E06D43" emissiveIntensity={1.5} />
          </mesh>
        </group>
      )
    }

    if (station.index === 2) {
      // Planet 03: Forge Nexus Ringed Planet
      return (
        <group ref={spinRef}>
          <mesh>
            <icosahedronGeometry args={[1.2, 2]} />
            <meshStandardMaterial
              color="#B8502B"
              roughness={0.45}
              metalness={0.45}
              wireframe={wireframe}
            />
          </mesh>
          <mesh ref={ringRef} rotation={[Math.PI / 2.4, 0.35, 0]}>
            <torusGeometry args={[1.88, 0.08, 12, 80]} />
            <meshStandardMaterial color="#F2A65A" emissive="#E06D43" emissiveIntensity={1.3} />
          </mesh>
          <mesh rotation={[Math.PI / 2.4, 0.35, 0]}>
            <torusGeometry args={[2.15, 0.025, 12, 80]} />
            <meshStandardMaterial color="#2DD4BF" emissive="#2DD4BF" emissiveIntensity={1.4} />
          </mesh>
        </group>
      )
    }

    if (station.index === 3) {
      // Planet 04: Biomedical Pulsar (reacts to calm / pacing / prodrome scenario)
      const pulsarColor =
        selectedNodeId === 'prodrome'
          ? '#E06D43'
          : selectedNodeId === 'pacing'
            ? '#F2A65A'
            : '#2DD4BF'
      return (
        <group ref={spinRef}>
          <mesh>
            <sphereGeometry args={[1.15, 36, 36]} />
            <MeshDistortMaterial
              color={pulsarColor}
              emissive={pulsarColor}
              emissiveIntensity={0.65}
              distort={selectedNodeId === 'prodrome' ? 0.42 : 0.22}
              speed={selectedNodeId === 'prodrome' ? 5.5 : 2.2}
              roughness={0.2}
              wireframe={wireframe}
            />
          </mesh>
          <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.75, 0.03, 16, 90]} />
            <meshStandardMaterial color={pulsarColor} emissive={pulsarColor} emissiveIntensity={1.8} />
          </mesh>
        </group>
      )
    }

    if (station.index === 4) {
      // Planet 05: Arsenal Dyson Sphere
      return (
        <group ref={spinRef}>
          <mesh>
            <octahedronGeometry args={[1.15, 2]} />
            <meshStandardMaterial
              color="#2A314A"
              metalness={0.75}
              roughness={0.22}
              wireframe={wireframe}
            />
          </mesh>
          {[0, Math.PI / 3, -Math.PI / 3].map((tilt, i) => (
            <mesh key={i} rotation={[tilt, i * 0.6, 0]}>
              <torusGeometry args={[1.65 + i * 0.14, 0.024, 14, 72]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? '#F2A65A' : '#38BDF8'}
                emissive={i % 2 === 0 ? '#E06D43' : '#38BDF8'}
                emissiveIntensity={1.4}
              />
            </mesh>
          ))}
        </group>
      )
    }

    if (station.index === 5) {
      // Planet 06: Citadel Station
      return (
        <group ref={spinRef}>
          <mesh>
            <cylinderGeometry args={[0.9, 1.15, 1.6, 8]} />
            <meshPhysicalMaterial
              color={isLight ? '#4A3D35' : '#262C42'}
              metalness={0.78}
              roughness={0.22}
              wireframe={wireframe}
            />
          </mesh>
          <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.72, 0.06, 8, 48]} />
            <meshStandardMaterial color="#E06D43" emissive="#E06D43" emissiveIntensity={1.2} />
          </mesh>
        </group>
      )
    }

    if (station.index === 6) {
      // Planet 07: Echo Golden Constellation
      return (
        <group ref={spinRef}>
          <mesh>
            <dodecahedronGeometry args={[1.15, 1]} />
            <meshStandardMaterial
              color="#D97706"
              emissive="#F59E0B"
              emissiveIntensity={0.45}
              metalness={0.6}
              roughness={0.2}
              wireframe={wireframe}
            />
          </mesh>
          <mesh ref={ringRef} rotation={[Math.PI / 3, 0.4, 0]}>
            <torusGeometry args={[1.78, 0.025, 14, 80]} />
            <meshStandardMaterial color="#FCD34D" emissive="#F59E0B" emissiveIntensity={1.6} />
          </mesh>
        </group>
      )
    }

    // Planet 08: Horizon Relay Dish / Signal Core
    if (station.index === 7) {
      return (
        <group ref={spinRef}>
          <mesh>
            <sphereGeometry args={[1.08, 32, 32]} />
            <meshStandardMaterial
              color={station.accentColor}
              emissive={station.secondaryColor}
              emissiveIntensity={0.4}
              metalness={0.65}
              roughness={0.2}
              wireframe={wireframe}
            />
          </mesh>
          <mesh position={[0, 1.3, 0]}>
            <coneGeometry args={[0.12, 2.2, 12]} />
            <meshBasicMaterial color={station.secondaryColor} transparent opacity={0.35} />
          </mesh>
          <mesh ref={ringRef} rotation={[Math.PI / 2.2, 0, 0]}>
            <torusGeometry args={[1.65, 0.03, 14, 72]} />
            <meshStandardMaterial color={station.accentColor} emissive={station.accentColor} emissiveIntensity={1.5} />
          </mesh>
        </group>
      )
    }

    // Custom Admin-Created 3D Planets
    return (
      <group ref={spinRef}>
        <mesh>
          {station.customStyle === 'golden-crystal' ? (
            <dodecahedronGeometry args={[1.18, 1]} />
          ) : station.customStyle === 'dyson-ring' ? (
            <octahedronGeometry args={[1.15, 2]} />
          ) : (
            <sphereGeometry args={[1.18, 36, 36]} />
          )}
          <MeshDistortMaterial
            color={station.accentColor}
            emissive={station.secondaryColor}
            emissiveIntensity={0.45}
            distort={station.customStyle === 'teal-pulsar' ? 0.32 : 0.08}
            speed={2.2}
            roughness={0.25}
            metalness={0.45}
            wireframe={wireframe}
          />
        </mesh>
        <mesh ref={ringRef} rotation={[Math.PI / 2.3, 0.25, 0]}>
          <torusGeometry args={[1.78, 0.045, 16, 80]} />
          <meshStandardMaterial color={station.secondaryColor} emissive={station.secondaryColor} emissiveIntensity={1.4} />
        </mesh>
      </group>
    )
  }

  return (
    <group position={station.position}>
      <Float speed={isActive ? 1.4 : 0.8} rotationIntensity={0.08} floatIntensity={0.22}>
        <group
          scale={isActive ? 1 : hovered ? 0.92 : 0.8}
          onPointerOver={(e) => {
            if (!isActive) {
              e.stopPropagation()
              setHovered(true)
            }
          }}
          onPointerOut={() => setHovered(false)}
          onClick={(e) => {
            if (!isActive) {
              e.stopPropagation()
              onSelectPlanet()
            }
          }}
        >
          {renderPlanetCore()}
        </group>
      </Float>

      {/* Distant planet clickable beacon label when NOT currently docked */}
      {!isActive && (
        <SpriteBadge
          label={`${station.code} ${station.shortName}`}
          color={station.accentColor}
          hovered={hovered}
          position={[0, 2.0, 0]}
          onHover={setHovered}
          onClick={onSelectPlanet}
        />
      )}

      {/* Active Planet's clickable 3D Moon Hotspots */}
      {isActive && (
        <ActivePlanetMoons
          moons={station.moons}
          selectedNodeId={selectedNodeId}
          onSelectMoonNode={onSelectMoonNode}
        />
      )}
    </group>
  )
}

function InterplanetaryStarDust({
  isLight,
  isWarping,
}: {
  isLight: boolean
  isWarping: boolean
}) {
  const ref = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const count = 1600
    const arr = new Float32Array(count * 3)
    let seed = 9941
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rand() - 0.5) * 75
      arr[i * 3 + 1] = (rand() - 0.5) * 34
      arr[i * 3 + 2] = -rand() * 135 + 15
    }
    return arr
  }, [])

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.z += delta * (isWarping ? 0.16 : 0.01)
    }
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={isLight ? '#8A4F38' : '#E6DEC8'}
        size={isWarping ? 0.11 : 0.06}
        sizeAttenuation
        depthWrite={false}
        opacity={isLight ? 0.35 : 0.52}
      />
    </Points>
  )
}

function PlanetaryWarpCameraRig({
  planets,
  activeSector,
  isWarping,
  freeLook,
  hologramHidden,
  onTelemetryTick,
}: {
  planets: PlanetDefinition[]
  activeSector: number
  isWarping: boolean
  freeLook: boolean
  hologramHidden: boolean
  onTelemetryTick?: (pos: [number, number, number]) => void
}) {
  const { camera, size } = useThree()
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0))
  const windowPointer = useRef({ x: 0, y: 0 })
  const tickAcc = useRef(0)

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      windowPointer.current.x = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1
      windowPointer.current.y = -((e.clientY / Math.max(1, window.innerHeight)) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((_, delta) => {
    const station = planets[activeSector] || planets[0]
    if (!station) return
    const [px, py, pz] = station.position

    if (!freeLook) {
      const aspect = size.width / Math.max(1, size.height)
      const isMobileViewport = size.width < 1024 || aspect < 0.9

      // Desktop: Left/Right split framing; Mobile Portrait: Dead-center X + upper orbital stage Y
      const splitBiasX = isMobileViewport || hologramHidden ? 0 : activeSector % 2 === 0 ? 1.85 : -1.85
      const splitBiasY = isMobileViewport && !hologramHidden ? -1.18 : 0
      const targetCamZ = pz + (isMobileViewport ? (hologramHidden ? 6.4 : 7.8) : 6.4)

      const mouseX = windowPointer.current.x * (isMobileViewport ? 0.18 : 0.38)
      const mouseY = windowPointer.current.y * (isMobileViewport ? 0.14 : 0.24)

      const targetCamX = px + splitBiasX + mouseX
      const targetCamY = py + (isMobileViewport ? 0.35 : 0.75) + splitBiasY + mouseY

      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 3.2, delta)
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 3.2, delta)
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 3.2, delta)

      lookTarget.current.x = THREE.MathUtils.damp(lookTarget.current.x, px + splitBiasX, 3.6, delta)
      lookTarget.current.y = THREE.MathUtils.damp(lookTarget.current.y, py + splitBiasY + 0.08, 3.6, delta)
      lookTarget.current.z = THREE.MathUtils.damp(lookTarget.current.z, pz, 3.6, delta)
      camera.lookAt(lookTarget.current)

      if (camera instanceof THREE.PerspectiveCamera) {
        const baseFov = isMobileViewport ? 50 : 45
        const targetFov = isWarping ? baseFov + 10 : baseFov
        if (Math.abs(camera.fov - targetFov) > 0.05) {
          camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 5, delta)
          camera.updateProjectionMatrix()
        }
      }
    }

    tickAcc.current += delta
    if (tickAcc.current > 0.15 && onTelemetryTick) {
      tickAcc.current = 0
      onTelemetryTick([
        Number(camera.position.x.toFixed(1)),
        Number(camera.position.y.toFixed(1)),
        Number(camera.position.z.toFixed(1)),
      ])
    }
  })

  return null
}

export default function OdysseyWorldScene({
  planets,
  activeSector,
  isWarping,
  selectedNodeId,
  mode,
  mood,
  audioLevel,
  isLight,
  freeLook,
  hologramHidden,
  wireframe,
  onSelectPlanet,
  onSelectMoonNode,
  onTelemetryTick,
}: OdysseyWorldSceneProps) {
  const skyColor = isLight ? '#E2D8C4' : '#181C2E'
  const activeStation = planets[activeSector] || planets[0]

  const routePoints = useMemo(
    () => planets.map((s) => s.position),
    [planets]
  )

  return (
    <Canvas
      camera={{ position: [1.85, 0.75, 6.4], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true }}
      className={freeLook ? 'h-full w-full cursor-grab active:cursor-grabbing' : 'h-full w-full'}
    >
      <color attach="background" args={[skyColor]} />
      <fogExp2 attach="fog" args={[skyColor, isLight ? 0.018 : 0.02]} />

      <ambientLight intensity={isLight ? 0.95 : 0.75} />
      <directionalLight
        position={[12, 16, 12]}
        intensity={isLight ? 1.8 : 1.55}
        color={isLight ? '#FFF6E5' : '#E6DEC8'}
      />
      <pointLight
        position={[
          activeStation.position[0] - 3,
          activeStation.position[1] + 2,
          activeStation.position[2] + 4,
        ]}
        intensity={2.6}
        distance={22}
        color={activeStation.accentColor}
      />
      <pointLight
        position={[
          activeStation.position[0] + 3,
          activeStation.position[1] - 1,
          activeStation.position[2] + 3,
        ]}
        intensity={2.0}
        distance={22}
        color={activeStation.secondaryColor}
      />

      <Sparkles
        count={70}
        scale={16}
        size={1.7}
        speed={isWarping ? 1.8 : 0.3}
        position={activeStation.position}
        color={isLight ? '#C85A32' : '#F2A65A'}
        opacity={0.55}
      />

      {/* Orbital Starlight Flight Path Connecting All 8 Planets */}
      <Line
        points={routePoints}
        color={isLight ? '#B8502B' : '#E06D43'}
        lineWidth={1.2}
        transparent
        opacity={0.35}
        dashed
        dashSize={0.7}
        gapSize={0.5}
      />

      <InterplanetaryStarDust isLight={isLight} isWarping={isWarping} />

      {planets.map((station) => (
        <DistinctPlanetBody
          key={`${station.sectionKey}-${station.index}`}
          station={station}
          isActive={station.index === activeSector}
          selectedNodeId={selectedNodeId}
          wireframe={wireframe}
          isLight={isLight}
          mode={mode}
          mood={mood}
          audioLevel={audioLevel}
          onSelectPlanet={() => onSelectPlanet(station.index)}
          onSelectMoonNode={onSelectMoonNode}
        />
      ))}

      <PlanetaryWarpCameraRig
        planets={planets}
        activeSector={activeSector}
        isWarping={isWarping}
        freeLook={freeLook}
        hologramHidden={hologramHidden}
        onTelemetryTick={onTelemetryTick}
      />

      {freeLook && (
        <OrbitControls
          target={activeStation.position}
          enableZoom
          enablePan={false}
          minDistance={3.2}
          maxDistance={14}
        />
      )}
    </Canvas>
  )
}
