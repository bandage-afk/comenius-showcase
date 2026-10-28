import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'

/**
 * 城市街道背景（SF Street，Poly Pizza 免费低模，CC0）。
 * 柜子"站在"街道上：城市放大 2 倍（楼高约 4.6，约为柜高 2.82 的 1.6 倍），
 * 底边对齐地面 y=0，街道从柜子脚下向镜头方向延伸、楼群在柜后。
 *
 * 比例/位置可调：改 CITY_SCALE 调大小、CITY_POS 调位置即可。
 */
export default function CityBackdrop() {
  const { scene } = useGLTF('/models/city_street.glb')
  const clone = useMemo(() => scene.clone(), [scene])
  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      <group position={[0.25, 1.945, 0.6]} scale={2.0}>
        <primitive object={clone} />
      </group>
    </group>
  )
}
