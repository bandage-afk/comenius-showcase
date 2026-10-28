import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CuboidCollider, Physics, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { BOOKS, SingleBook } from './PhysicalProps'
import { BACK_T, BAY_PITCH, CAVITY_BACK_Z, SHELF_Y, bayLeft } from './lockerSpec'
import { FRONT_Z, OPEN_BAY } from './sceneConfig'

const BAY_MIN_X = bayLeft(OPEN_BAY) + 0.025
const BAY_MAX_X = bayLeft(OPEN_BAY) + BAY_PITCH - 0.025
const SHELF_MIN_Z = CAVITY_BACK_Z + BACK_T * 0.25
const SHELF_MAX_Z = FRONT_Z - 0.03
const ROW_Z = -0.085
/** 前排（取书时书"突出"到的行，z 固定，只动 x） */
const FRONT_ROW_Z = 0.11
/** 从后排"突出"到前排的动画时长 */
const TO_FRONT_MS = 180

/** 槽位：书架上固定的一本挨一本位置 */
const slotXs = BOOKS.map(b => -0.51 + b.x)
const SLOT_STEP = (slotXs[slotXs.length - 1] - slotXs[0]) / (slotXs.length - 1)
const slotIndexAt = (x: number) =>
  THREE.MathUtils.clamp(Math.round((x - slotXs[0]) / SLOT_STEP), 0, slotXs.length - 1)

/** 松手后的"插回"滑行动画时长 */
const GLIDE_MS = 320

const _plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
const _hit = new THREE.Vector3()
const _quat = new THREE.Quaternion()
const _identity = new THREE.Quaternion()

/**
 * 双层架构（交互层为权威 + 物理层做瞬态让位）：
 * - 交互层：槽位状态机（取书/插回/换位）+ kinematic 拖拽 + 磁吸归位
 * - 物理层：邻居是 dynamic 刚体，被拖/插的书是 kinematic（只推不被推，不会爆炸）
 * - 插回：书先预开缝（槽位右移）→ 书以 kinematic 滑行进槽（物理推开邻居）→
 *   到位后转 dynamic 静止，磁吸把每本书收回到精确槽位、直立
 */
export function ShelfBooks({ enabled }: { enabled: boolean }) {
  const [assign, setAssign] = useState<{ id: number; slot: number | null }[]>(() =>
    BOOKS.map((_, i) => ({ id: i, slot: i })),
  )
  const slotsRef = useRef(assign)
  // 渲染期只允许写 ref 做惰性初始化；同步最新值是副作用，放 effect 里
  useEffect(() => {
    slotsRef.current = assign
  }, [assign])

  const pickup = useCallback((id: number) => {
    setAssign(prev => {
      const cur = prev.find(a => a.id === id)
      if (!cur || cur.slot === null) return prev
      const s = cur.slot
      const rest = prev
        .filter(a => a.id !== id)
        .map(a => (a.slot !== null && a.slot > s ? { ...a, slot: a.slot - 1 } : a))
      return [...rest, { id, slot: null }]
    })
  }, [])

  const drop = useCallback((id: number, x: number) => {
    const t = slotIndexAt(x)
    setAssign(prev => {
      const cur = prev.find(a => a.id === id)
      if (!cur || cur.slot !== null) return prev
      // 预开缝：槽位 >= t 的书右移一格，id 占 t
      return prev.map(a =>
        a.id === id
          ? { ...a, slot: t }
          : a.slot !== null && a.slot >= t
            ? { ...a, slot: a.slot + 1 }
            : a,
      )
    })
  }, [])

  return (
    <Physics gravity={[0, -9.81, 0]}>
      {/* 隐形隔板 + 四边围墙 */}
      <ShelfRigids />
      {BOOKS.map((_, i) => (
        <ShelfBook
          key={i}
          id={i}
          enabled={enabled}
          slotsRef={slotsRef}
          onPickup={pickup}
          onDrop={drop}
        />
      ))}
    </Physics>
  )
}

function ShelfRigids() {
  const bayCX = (BAY_MIN_X + BAY_MAX_X) / 2
  const shelfCZ = (SHELF_MIN_Z + SHELF_MAX_Z) / 2
  const spanX = (BAY_MAX_X - BAY_MIN_X) / 2
  const spanZ = (SHELF_MAX_Z - SHELF_MIN_Z) / 2
  const TH = 0.02
  const WALL_H = 0.6
  return (
    <>
      <RigidBody type="fixed" colliders={false} position={[bayCX, SHELF_Y[0] - 0.035, shelfCZ]}>
        <CuboidCollider args={[spanX + 0.1, 0.03, spanZ + 0.1]} friction={1.0} />
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[bayCX, SHELF_Y[0] + WALL_H / 2, SHELF_MIN_Z - TH / 2 - 0.005]}
      >
        <CuboidCollider args={[spanX + 0.15, WALL_H, TH]} friction={1.0} />
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[bayCX, SHELF_Y[0] + WALL_H / 2, SHELF_MAX_Z + TH / 2 + 0.005]}
      >
        <CuboidCollider args={[spanX + 0.15, WALL_H, TH]} friction={1.0} />
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[BAY_MIN_X - TH / 2 - 0.005, SHELF_Y[0] + WALL_H / 2, shelfCZ]}
      >
        <CuboidCollider args={[TH, WALL_H, spanZ + 0.15]} friction={1.0} />
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[BAY_MAX_X + TH / 2 + 0.005, SHELF_Y[0] + WALL_H / 2, shelfCZ]}
      >
        <CuboidCollider args={[TH, WALL_H, spanZ + 0.15]} friction={1.0} />
      </RigidBody>
    </>
  )
}

function ShelfBook({
  id,
  enabled,
  slotsRef,
  onPickup,
  onDrop,
}: {
  id: number
  enabled: boolean
  slotsRef: React.MutableRefObject<{ id: number; slot: number | null }[]>
  onPickup: (id: number) => void
  onDrop: (id: number, x: number) => void
}) {
  const book = BOOKS[id]
  const bookD = book.d ?? 0.19
  const rb = useRef<RapierRigidBody>(null)
  const group = useRef<THREE.Group>(null)
  const camera = useThree(s => s.camera)
  const size = useThree(s => s.size)
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const [dragging, setDragging] = useState(false)
  const [gliding, setGliding] = useState(false)
  const [hovered, setHovered] = useState(false)
  const carryPos = useRef(new THREE.Vector3(slotXs[id], SHELF_Y[0], ROW_Z))
  const grabOffset = useRef(new THREE.Vector3())
  const glide = useRef<{ from: THREE.Vector3; to: THREE.Vector3; t: number } | null>(null)
  const dragT = useRef(0)

  useFrame((state, delta) => {
    const body = rb.current
    if (!body) return
    _plane.constant = -SHELF_Y[0]

    if (dragging) {
      // 取书：书突出到前排（z → FRONT_ROW_Z），只跟 x，不跟书架里的书挤
      dragT.current += delta * 1000
      const p = Math.min(1, dragT.current / TO_FRONT_MS)
      const e = 1 - Math.pow(1 - p, 3)
      state.raycaster.setFromCamera(state.pointer, state.camera)
      if (state.raycaster.ray.intersectPlane(_plane, _hit)) {
        const x = THREE.MathUtils.clamp(_hit.x + grabOffset.current.x, BAY_MIN_X, BAY_MAX_X)
        carryPos.current.set(x, SHELF_Y[0], THREE.MathUtils.lerp(ROW_Z, FRONT_ROW_Z, e))
      }
      body.setNextKinematicTranslation({
        x: carryPos.current.x,
        y: carryPos.current.y,
        z: carryPos.current.z,
      })
      body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
      return
    }

    if (gliding) {
      // 插回滑行：kinematic 从松手点滑进槽位，物理推开邻居
      const g = glide.current
      if (!g) return
      g.t += delta * 1000
      const p = Math.min(1, g.t / GLIDE_MS)
      const e = 1 - Math.pow(1 - p, 3)
      const pos = g.from.clone().lerp(g.to, e)
      body.setNextKinematicTranslation({ x: pos.x, y: pos.y, z: pos.z })
      body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
      if (p >= 1) {
        setGliding(false)
        body.setLinvel({ x: 0, y: 0, z: 0 }, true)
        body.setAngvel({ x: 0, y: 0, z: 0 }, true)
      }
      return
    }

    // 磁吸：把静止书收回到精确槽位、直立（允许被推时短暂歪，随后回正）
    const slot = slotsRef.current.find(a => a.id === id)?.slot ?? null
    if (slot !== null) {
      const cur = body.translation()
      const k = 1 - Math.pow(0.004, delta)
      const nx = cur.x + (slotXs[slot] - cur.x) * k
      const ny = cur.y + (SHELF_Y[0] - cur.y) * k
      const nz = cur.z + (ROW_Z - cur.z) * k
      body.setTranslation({ x: nx, y: ny, z: nz }, true)
      const q = body.rotation()
      _quat.set(q.x, q.y, q.z, q.w).slerp(_identity, k)
      body.setRotation({ x: _quat.x, y: _quat.y, z: _quat.z, w: _quat.w }, true)
      if (Math.abs(nx - slotXs[slot]) < 0.004 && Math.abs(nz - ROW_Z) < 0.004) {
        body.setLinvel({ x: 0, y: 0, z: 0 }, true)
        body.setAngvel({ x: 0, y: 0, z: 0 }, true)
      }
    }
  })

  useEffect(() => {
    const move = (ev: PointerEvent) => {
      if (!dragging) return
      const ndc = new THREE.Vector2(
        (ev.clientX / size.width) * 2 - 1,
        -(ev.clientY / size.height) * 2 + 1,
      )
      raycaster.setFromCamera(ndc, camera)
      _plane.constant = -SHELF_Y[0]
      if (!raycaster.ray.intersectPlane(_plane, _hit)) return
      // 前排拖动只动 x
      carryPos.current.x = THREE.MathUtils.clamp(
        _hit.x + grabOffset.current.x,
        BAY_MIN_X,
        BAY_MAX_X,
      )
    }
    const up = () => {
      if (!dragging) return
      const x = carryPos.current.x
      const t = slotIndexAt(x)
      glide.current = {
        from: carryPos.current.clone(),
        to: new THREE.Vector3(slotXs[t], SHELF_Y[0], ROW_Z),
        t: 0,
      }
      onDrop(id, x)
      setDragging(false)
      setGliding(true)
      document.body.style.cursor = ''
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [camera, size, raycaster, id, onDrop, dragging])

  if (!enabled) {
    return (
      <group position={[slotXs[id], SHELF_Y[0], ROW_Z]}>
        <SingleBook book={book} />
      </group>
    )
  }

  return (
    <RigidBody
      ref={rb}
      type={dragging || gliding ? 'kinematicPosition' : 'dynamic'}
      colliders={false}
      position={[slotXs[id], SHELF_Y[0], ROW_Z]}
      ccd
      linearDamping={1.2}
      angularDamping={2.0}
      friction={1.0}
      restitution={0}
      canSleep
    >
      <CuboidCollider
        args={[book.w / 2, book.h / 2, bookD / 2]}
        position={[0, book.h / 2, 0]}
        friction={1.0}
      />
      <group
        ref={group}
        scale={hovered ? 1.05 : 1}
        onPointerDown={(e: ThreeEvent<PointerEvent>) => {
          if (!enabled || gliding) return
          e.stopPropagation()
          _plane.constant = -SHELF_Y[0]
          if (e.ray.intersectPlane(_plane, _hit)) {
            const pos = rb.current?.translation()
            if (pos) grabOffset.current.set(pos.x - _hit.x, 0, pos.z - _hit.z)
          }
          onPickup(id)
          dragT.current = 0
          carryPos.current.set(rb.current?.translation().x ?? slotXs[id], SHELF_Y[0], ROW_Z)
          setDragging(true)
          document.body.style.cursor = 'grabbing'
        }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'grab'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = ''
        }}
      >
        <SingleBook book={book} />
      </group>
    </RigidBody>
  )
}
