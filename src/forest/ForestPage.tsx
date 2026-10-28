import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import GearLoader from './GearLoader'
import ForestScene from './ForestScene'
import './forest.css'

function Section({
  progress,
  range,
  children,
  stay = false,
  startVisible = false,
}: {
  progress: MotionValue<number>
  range: [number, number, number, number]
  children: ReactNode
  stay?: boolean
  startVisible?: boolean
}) {
  const [a, b, c, d] = range
  const opacityMap = stay ? [0, 1, 1, 1] : startVisible ? [1, 1, 1, 0] : [0, 1, 1, 0]
  const opacity = useTransform(progress, [a, b, c, d], opacityMap)
  const y = useTransform(progress, [a, b], startVisible ? [0, 0] : [72, 0])
  return <motion.section style={{ opacity, y }}>{children}</motion.section>
}

export default function ForestPage() {
  const [ready, setReady] = useState(false)
  const [loaderGone, setLoaderGone] = useState(false)
  const [progress, setProgress] = useState(0)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })

  useEffect(() => {
    const start = performance.now()
    const DURATION = 2600
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION)
      setProgress(1 - Math.pow(1 - p, 3))
      if (p < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        window.setTimeout(() => setReady(true), 380)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="forest-page" style={{ minHeight: '100vh' }}>
      {!loaderGone && (
        <div
          className={`forest-loader${ready ? ' hide' : ''}`}
          onTransitionEnd={() => setLoaderGone(true)}
        >
          <div>
            <div className="forest-loader-title">NIGHT FOREST</div>
            <div className="forest-loader-sub">夜 行 森 林</div>
          </div>
          <GearLoader progress={progress} />
        </div>
      )}
      {ready && (
        <>
          <ForestScene progress={scrollYProgress} />
          <div ref={trackRef} className="forest-track" />
          <div className="forest-overlay">
            <Section progress={scrollYProgress} range={[0, 0.001, 0.1, 0.15]} startVisible>
              <div>
                <div className="forest-kicker">AN INTERACTIVE STORY</div>
                <h1 className="forest-title">NIGHT FOREST</h1>
                <div className="forest-sub">夜行森林 · 一座可以滚进去的森林</div>
                <div className="forest-scroll-hint">
                  <span>往 下 滚</span>
                  <div className="line" />
                </div>
              </div>
            </Section>
            <Section progress={scrollYProgress} range={[0.2, 0.25, 0.32, 0.37]}>
              <div className="forest-chapter">
                <div className="forest-kicker">ABOUT</div>
                <h2>滚一寸，走一步</h2>
                <p>
                  森林是画布，滚动是脚步。这个页面用一棵一棵树、一点一点光，拼出一条可以走进来的路——故事不在别处，
                  就在往下滚的过程里。
                </p>
              </div>
            </Section>
            <Section progress={scrollYProgress} range={[0.42, 0.47, 0.58, 0.64]}>
              <div className="forest-chapter">
                <div className="forest-kicker">WORKS</div>
                <h2>林间散落的作品</h2>
                <div className="forest-works">
                  <div className="forest-card">
                    <div className="num">01</div>
                    <h3>交互叙事</h3>
                    <p>用滚动驱动场景与文字，像穿过一片会呼吸的森林。</p>
                    <span className="tag">WEBGL</span>
                  </div>
                  <div className="forest-card">
                    <div className="num">02</div>
                    <h3>3D 场景</h3>
                    <p>低模树木、萤火与光点，全部由代码实时生长。</p>
                    <span className="tag">THREE.JS</span>
                  </div>
                  <div className="forest-card">
                    <div className="num">03</div>
                    <h3>作品集</h3>
                    <p>把项目藏进林间，边走边发现，像一场森林寻宝。</p>
                    <span className="tag">SCROLL</span>
                  </div>
                </div>
              </div>
            </Section>
            <Section progress={scrollYProgress} range={[0.74, 0.79, 0.999, 1]} stay>
              <div className="forest-end">
                <div className="forest-kicker">THE END</div>
                <h2>故事还没有结束</h2>
                <p>COMENIUS · COMING SOON</p>
                <button
                  className="forest-back-btn"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  回到森林入口
                </button>
              </div>
            </Section>
          </div>
        </>
      )}
    </div>
  )
}
