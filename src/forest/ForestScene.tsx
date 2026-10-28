import { useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { MotionValue } from 'framer-motion'

function CameraRig({ progress }: { progress: MotionValue<number> }) {
  const { camera, pointer } = useThree()
  useFrame((_, dt) => {
    const p = progress.get()
    const k = 1 - Math.pow(0.001, dt)
    const targetZ = 8 - p * 48
    const targetY = 2.5 + p * 3
    camera.position.x += (pointer.x * 1.8 - camera.position.x) * k
    camera.position.y += (targetY + pointer.y * 0.8 - camera.position.y) * k
    camera.position.z += (targetZ - camera.position.z) * k
    camera.lookAt(0, 1.3, targetZ - 14)
  })
  return null
}

interface Tree {
  x: number
  z: number
  s: number
}

function Trees() {
  const trunkRef = useRef<THREE.InstancedMesh>(null)
  const c1Ref = useRef<THREE.InstancedMesh>(null)
  const c2Ref = useRef<THREE.InstancedMesh>(null)
  const trees = useMemo<Tree[]>(() => {
    const arr: Tree[] = []
    for (let i = 0; i < 76; i++) {
      let x = (Math.random() * 2 - 1) * 25
      const z = 30 - Math.random() * 110
      if (z > -46 && z < -2 && Math.abs(x) < 2) {
        x += (x < 0 ? -1 : 1) * (2.3 + Math.random() * 3.2)
      }
      if (z > 10 && Math.abs(x) < 3) {
        x += (x < 0 ? -1 : 1) * (3 + Math.random() * 3)
      }
      arr.push({ x, z, s: 0.7 + Math.random() * 1.15 })
    }
    return arr
  }, [])

  useLayoutEffect(() => {
    if (!trunkRef.current || !c1Ref.current || !c2Ref.current) return
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const pos = new THREE.Vector3()
    trees.forEach((t, i) => {
      const s = t.s
      pos.set(t.x, 0.8 * s, t.z)
      m.compose(pos, q, new THREE.Vector3(0.9 * s, 1.1 * s, 0.9 * s))
      trunkRef.current!.setMatrixAt(i, m)
      pos.set(t.x, 2.2 * s, t.z)
      m.compose(pos, q, new THREE.Vector3(s, s, s))
      c1Ref.current!.setMatrixAt(i, m)
      pos.set(t.x, 3.0 * s, t.z)
      m.compose(pos, q, new THREE.Vector3(0.85 * s, 0.72 * s, 0.85 * s))
      c2Ref.current!.setMatrixAt(i, m)
    })
    trunkRef.current.instanceMatrix.needsUpdate = true
    c1Ref.current.instanceMatrix.needsUpdate = true
    c2Ref.current.instanceMatrix.needsUpdate = true
  }, [trees])

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, trees.length]}>
        <cylinderGeometry args={[0.16, 0.27, 1.6, 6]} />
        <meshStandardMaterial color="#18382f" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={c1Ref} args={[undefined, undefined, trees.length]}>
        <coneGeometry args={[1.15, 2.4, 7]} />
        <meshStandardMaterial color="#0e3a33" roughness={0.95} />
      </instancedMesh>
      <instancedMesh ref={c2Ref} args={[undefined, undefined, trees.length]}>
        <coneGeometry args={[0.8, 1.5, 6]} />
        <meshStandardMaterial color="#165244" roughness={0.95} />
      </instancedMesh>
    </group>
  )
}

function Fireflies() {
  const ref = useRef<THREE.Points>(null)
  const data = useMemo(() => {
    const n = 150
    const pos = new Float32Array(n * 3)
    const phase = new Float32Array(n)
    const speed = new Float32Array(n)
    const baseY = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() * 2 - 1) * 16
      const y = 0.5 + Math.random() * 3.2
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = 24 - Math.random() * 74
      baseY[i] = y
      phase[i] = Math.random() * Math.PI * 2
      speed[i] = 0.5 + Math.random() * 1.5
    }
    return { pos, phase, speed, baseY, n }
  }, [])

  useFrame(({ clock }) => {
    const g = ref.current?.geometry
    if (!g) return
    const attr = g.getAttribute('position') as THREE.BufferAttribute | undefined
    if (!attr) return
    const t = clock.elapsedTime
    for (let i = 0; i < data.n; i++) {
      attr.setY(i, data.baseY[i] + Math.sin(t * data.speed[i] + data.phase[i]) * 0.55)
    }
    attr.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.pos, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.13}
        color="#84e83e"
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

function PathStones() {
  const stones = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        x: Math.sin(i * 1.9) * 2.3,
        z: 6 - i * 2.8,
        s: 0.07 + Math.random() * 0.08,
        y: 0.1 + Math.random() * 0.06,
      })),
    [],
  )
  return (
    <group>
      {stones.map((st, i) => (
        <mesh key={i} position={[st.x, st.y, st.z]} scale={st.s}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial
            color="#84e83e"
            emissive="#84e83e"
            emissiveIntensity={1.6}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

function Spirit() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.position.y = 3.4 + Math.sin(clock.elapsedTime * 1.2) * 0.5
    ref.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2.2) * 0.12)
  })
  return (
    <group position={[0, 3.4, -46]}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshStandardMaterial color="#eaffd9" emissive="#84e83e" emissiveIntensity={2.4} />
      </mesh>
      <pointLight color="#84e83e" intensity={16} distance={26} decay={2} />
    </group>
  )
}

export default function ForestScene({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="forest-canvas-wrap">
      <Canvas camera={{ position: [0, 2.5, 8], fov: 55 }} dpr={[1, 1.8]}>
        <color attach="background" args={['#062f31']} />
        <fog attach="fog" args={['#062f31', 10, 46]} />
        <ambientLight intensity={0.5} color="#b7dccb" />
        <directionalLight position={[6, 14, 2]} intensity={0.9} color="#d9f2e2" />
        <CameraRig progress={progress} />
        <Trees />
        <Fireflies />
        <PathStones />
        <Spirit />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -20]}>
          <circleGeometry args={[70, 48]} />
          <meshStandardMaterial color="#0a3733" roughness={1} />
        </mesh>
      </Canvas>
    </div>
  )
}
