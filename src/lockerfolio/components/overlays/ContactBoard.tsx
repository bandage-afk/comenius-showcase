import { useRef, useState } from 'react'
import { removeBackground } from '@imgly/background-removal'
import { useProfile, type StickerItem } from '../../../profileStore'
import { useStore } from '../../store'
import CloseButton from './CloseButton'
import './overlay.css'
import './edit.css'

const EMOJI_STICKERS: { code: string; emoji: string }[] = [
  { code: '1f393', emoji: '🎓' },
  { code: '1f3c6', emoji: '🏆' },
  { code: '1f525', emoji: '🔥' },
  { code: '1f4da', emoji: '📚' },
  { code: '270f', emoji: '✏️' },
  { code: '2b50', emoji: '⭐' },
  { code: '1f389', emoji: '🎉' },
  { code: '1f4aa', emoji: '💪' },
  { code: '1f9ea', emoji: '🧪' },
  { code: '1f947', emoji: '🥇' },
  { code: '1f4dd', emoji: '📝' },
  { code: '1f3eb', emoji: '🏫' },
]

/**
 * 给抠好的透明图加一圈白色模切边（和内置贴纸风格一致）：
 * 先把 alpha 形状放大铺白 → 再把原图盖回，露出来的白边就是模切边。
 */
async function addDieCut(blob: Blob): Promise<Blob> {
  const bmp = await createImageBitmap(blob)
  const w = bmp.width
  const h = bmp.height
  const pad = Math.max(4, Math.round(Math.min(w, h) * 0.04))
  const canvas = document.createElement('canvas')
  canvas.width = w + pad * 2
  canvas.height = h + pad * 2
  const ctx = canvas.getContext('2d')!
  // 白色模切底
  ctx.drawImage(bmp, -pad, -pad, w + pad * 2, h + pad * 2)
  ctx.globalCompositeOperation = 'source-in'
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.globalCompositeOperation = 'source-over'
  // 原图盖回
  ctx.drawImage(bmp, pad, pad)
  return new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/png'))
}

/** 给 Promise 加超时，绝不无限等待 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms)
    promise.then(
      v => {
        clearTimeout(timer)
        resolve(v)
      },
      e => {
        clearTimeout(timer)
        reject(e)
      },
    )
  })
}

/**
 * 本地简易抠图（不依赖网络）：把四角颜色当背景，从边缘泛洪填充，
 * 未填充到的就是前景。纯色背景效果好，复杂背景降级可用。
 */
async function simpleCutout(file: Blob): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const w = bmp.width
  const h = bmp.height
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(bmp, 0, 0)
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data

  // 背景色 = 四角平均
  const corners = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
  ].map(([x, y]) => [d[(y * w + x) * 4], d[(y * w + x) * 4 + 1], d[(y * w + x) * 4 + 2]])
  const bg = [0, 1, 2].map(i => Math.round(corners.reduce((s, c) => s + c[i], 0) / corners.length))
  const tol = 48
  const dist = (i: number) =>
    Math.abs(d[i] - bg[0]) + Math.abs(d[i + 1] - bg[1]) + Math.abs(d[i + 2] - bg[2])

  const visited = new Uint8Array(w * h)
  const queue: number[] = []
  const push = (x: number, y: number) => {
    if (x >= 0 && y >= 0 && x < w && y < h && !visited[y * w + x]) {
      visited[y * w + x] = 1
      queue.push(y * w + x)
    }
  }
  for (let x = 0; x < w; x++) {
    if (dist(x * 4) <= tol) push(x, 0)
    if (dist(((h - 1) * w + x) * 4) <= tol) push(x, h - 1)
  }
  for (let y = 0; y < h; y++) {
    if (dist(y * w * 4) <= tol) push(0, y)
    if (dist((y * w + w - 1) * 4) <= tol) push(w - 1, y)
  }
  let head = 0
  while (head < queue.length) {
    const p = queue[head++]
    const x = p % w
    const y = (p / w) | 0
    for (const n of [p - 1, p + 1, p - w, p + w]) {
      if (n < 0 || n >= w * h) continue
      const nx = n % w
      const ny = (n / w) | 0
      if (Math.abs(nx - x) + Math.abs(ny - y) !== 1) continue
      if (!visited[n] && dist(n * 4) <= tol) {
        visited[n] = 1
        queue.push(n)
      }
    }
  }
  for (let i = 0; i < w * h; i++) {
    if (visited[i]) d[i * 4 + 3] = 0
  }
  ctx.putImageData(img, 0, 0)
  return new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/png'))
}

/** 贴纸：内置 emoji + 用户上传（自动抠图、自动加白边） */
export default function ContactBoard() {
  const profile = useProfile(s => s.profile)
  const closeOverlay = useStore(s => s.closeOverlay)
  const [selected, setSelected] = useState<StickerItem[]>(profile.stickers)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const toggleEmoji = (code: string) => {
    setSelected(list =>
      list.some(s => s.kind === 'emoji' && s.code === code)
        ? list.filter(s => !(s.kind === 'emoji' && s.code === code))
        : [...list, { kind: 'emoji' as const, code }],
    )
  }

  const removeUpload = (url: string) => {
    setSelected(list => list.filter(s => !(s.kind === 'upload' && s.url === url)))
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setBusy(true)
    try {
      for (const file of Array.from(files)) {
        // 优先 AI 抠图（浏览器 WASM）；国内网络下载模型超时/失败时自动降级本地简易抠图
        let cut: Blob
        let fallback = false
        try {
          cut = await withTimeout(removeBackground(file, { progress: () => {} }), 45_000)
        } catch {
          fallback = true
          cut = await simpleCutout(file)
        }
        // 自动加白色模切边
        const rim = await addDieCut(cut)
        const url = URL.createObjectURL(rim)
        setSelected(list => [
          ...list,
          {
            kind: 'upload' as const,
            url,
            name: file.name.replace(/\.[^.]+$/, '') + (fallback ? '（简易）' : ''),
          },
        ])
      }
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const save = () => {
    useProfile.getState().save({ ...useProfile.getState().profile, stickers: selected })
    closeOverlay()
  }

  const uploaded = selected.filter(s => s.kind === 'upload') as Extract<
    StickerItem,
    { kind: 'upload' }
  >[]

  return (
    <div className="ov">
      <div className="ef">
        <CloseButton />
        <div className="ef__head">
          <h2>贴纸</h2>
          <span>STICKERS · 贴纸盒</span>
        </div>

        <div className="ef__field">
          <label>上传图片，自动变成贴纸</label>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            className="ef__add"
            style={{ flex: 1, margin: 0 }}
            disabled={busy}
            onClick={() => fileRef.current?.click()}
          >
            {busy ? '抠图中…' : '＋ 上传图片（自动去背景）'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={e => handleFiles(e.target.files)}
          />
        </div>

        {uploaded.length > 0 && (
          <>
            <div className="ef__field">
              <label>我的贴纸</label>
            </div>
            <div className="ef__grid">
              {uploaded.map(s => (
                <button
                  key={s.url}
                  className="ef__sticker on"
                  title={s.name}
                  onClick={() => removeUpload(s.url)}
                >
                  <img src={s.url} alt={s.name} />
                </button>
              ))}
            </div>
          </>
        )}

        <div className="ef__field">
          <label>内置贴纸</label>
        </div>
        <div className="ef__grid">
          {EMOJI_STICKERS.map(s => (
            <button
              key={s.code}
              className={`ef__sticker ${selected.some(x => x.kind === 'emoji' && x.code === s.code) ? 'on' : ''}`}
              title={s.emoji}
              onClick={() => toggleEmoji(s.code)}
            >
              <img src={`/stickers/${s.code}.png`} alt={s.emoji} />
            </button>
          ))}
        </div>

        <p className="ef__hint">
          已选 {selected.length} 张贴纸。上传后自动去背景并加白色模切边；AI
          抠图下载模型超时会自动改用本地简易抠图，不会卡住。点击贴纸可移除，保存后写入个人档案。
        </p>

        <button className="ef__save" onClick={save}>
          保存贴纸
        </button>
      </div>
    </div>
  )
}
