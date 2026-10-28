import { useEffect, useMemo, useRef, useState } from 'react'
import { MAGAZINE_PAGES } from '../../data/content'
import { releaseImages, SIZES, workImage } from './imageSources'

/** 当前跨页前后各保留几张纸的高分辨率解码结果 */
const KEEP = 1

/** DESIGN › 02 MAGAZINE —— 可翻页的样刊 */
export default function MagazineBook({ active }: { active: boolean }) {
  const [flipped, setFlipped] = useState(0)
  const bookRef = useRef<HTMLDivElement>(null)

  /* 每张纸有正反两面 */
  const sheets = useMemo(() => {
    const out: { front: string | null; back: string | null }[] = []
    for (let i = 0; i < MAGAZINE_PAGES.length; i += 2) {
      out.push({ front: MAGAZINE_PAGES[i], back: MAGAZINE_PAGES[i + 1] ?? null })
    }
    return out
  }, [])

  const total = sheets.length
  const opened = flipped > 0
  const atEnd = flipped >= total

  const turn = (d: number) => setFlipped(f => Math.max(0, Math.min(total, f + d)))

  // 关闭 DESIGN 栏目时断开所有内页引用
  useEffect(() => {
    const book = bookRef.current
    return () => releaseImages(book)
  }, [])

  return (
    <div className="mb">
      <span className="wv__ghost mb__ghost">MAGAZINE</span>

      <div className="mb__stage" data-open={opened} data-active={active} data-end={atEnd}>
        <div ref={bookRef} className="mb__book">
          {/* 左半：翻过去的纸落在这一侧 */}
          <div className="mb__left" data-show={opened} />
          {sheets.map((s, i) => {
            const isFlipped = i < flipped
            /* 只挂当前跨页及相邻纸的图；翻远了直接卸掉 <img>，让解码位图被回收 */
            const near = i >= flipped - 1 - KEEP && i <= flipped + KEEP
            return (
              <div
                key={i}
                className="mb__sheet"
                data-flipped={isFlipped}
                style={{ zIndex: isFlipped ? i : total - i }}
              >
                <button
                  type="button"
                  className="mb__face mb__face--front"
                  onClick={() => turn(1)}
                  aria-label="下一页"
                >
                  {near && s.front && (
                    <img
                      {...workImage('mag', s.front)}
                      sizes={SIZES.mag}
                      alt=""
                      decoding="async"
                      draggable={false}
                    />
                  )}
                </button>
                <button
                  type="button"
                  className="mb__face mb__face--back"
                  onClick={() => turn(-1)}
                  aria-label="上一页"
                >
                  {near && s.back && (
                    <img
                      {...workImage('mag', s.back)}
                      sizes={SIZES.mag}
                      alt=""
                      decoding="async"
                      draggable={false}
                    />
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <p className="mb__hint">
        {atEnd ? 'CLICK LEFT PAGE TO GO BACK' : 'CLICK PAGES TO TURN'}
        <svg
          width="22"
          height="9"
          viewBox="0 0 22 9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M0 4.5h20M16.4 1 20 4.5 16.4 8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </p>
    </div>
  )
}
