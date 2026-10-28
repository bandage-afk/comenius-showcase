import { useState, useRef } from 'react'
import type { NavProps } from '../App'

const HOT_SEARCHES = [
  { rank: 1, text: 'A-Level数学备考攻略', hot: '32.8万', live: true },
  { rank: 2, text: '剑桥大学申请要求2025', hot: '28.1万', live: true },
  { rank: 3, text: 'TMUA真题解析', hot: '21.4万', live: false },
  { rank: 4, text: '牛津面试经验分享', hot: '18.9万', live: false },
  { rank: 5, text: '英国G5院校排名', hot: '15.2万', live: false },
  { rank: 6, text: 'UCAS申请时间节点', hot: '12.7万', live: false },
  { rank: 7, text: '留学费用全攻略', hot: '9.8万', live: false },
  { rank: 8, text: '数学竞赛STEP备考', hot: '7.6万', live: false },
]

const INIT_HISTORY = ['牛津申请', 'TMUA 2024', 'A-Level Further Math', '剑桥面试']

const RESULT_NOTES = [
  {
    img: 'photo-1434030216411-0b793f4b4173',
    title: '备考全攻略 | 两个月成绩提升30分的秘密',
    author: '数学达人',
    likes: 2341,
  },
  {
    img: 'photo-1456513080510-7bf3a84b82f8',
    title: '2024 真题解析（完整版附详解）',
    author: 'MathQueen',
    likes: 1876,
  },
  {
    img: 'photo-1503676260728-1c00da094a0b',
    title: '如何平衡A-Level和其他考试的备考时间',
    author: '学习博主_Lucy',
    likes: 987,
  },
  {
    img: 'photo-1523240795612-9a054b0db644',
    title: '剑桥数学系学长的一周学习日程',
    author: '剑桥候鸟',
    likes: 6543,
  },
  {
    img: 'photo-1509062522246-3755977927d7',
    title: '课堂笔记这样做，复习效率翻倍',
    author: '笔记小能手',
    likes: 3410,
  },
  {
    img: 'photo-1517483000871-1dbf64a6e1c6',
    title: 'TMUA 冲刺 30 天计划表',
    author: '上岸的学姐',
    likes: 2890,
  },
  {
    img: 'photo-1522202176988-66273c2fd55f',
    title: '自习室打卡第 100 天 | 效率肉眼可见',
    author: '自律的橙子',
    likes: 1209,
  },
  {
    img: 'photo-1507003211169-0a1dd7228f2d',
    title: '考前一周我都做什么？真实日程表',
    author: '备考日记',
    likes: 2388,
  },
  {
    img: 'photo-1494790108377-be9c29b29330',
    title: '从 A 到 A*：我的数学逆袭之路',
    author: '逆袭的橙子',
    likes: 56000,
  },
  {
    img: 'photo-1546410531-bb4caa6b424d',
    title: '剑桥面试复盘 | 被这道数学题问得哑口无言',
    author: 'Cambridge24',
    likes: 2109,
  },
  {
    img: 'photo-1481627834876-b7833e8f5570',
    title: 'STEP 2 真题逐题精讲合集',
    author: '安然学霸',
    likes: 4160,
  },
  {
    img: 'photo-1501504905252-473c47e087f8',
    title: '跟着我一起备考 A-Level😂😂😂',
    author: '我们家的豆妹',
    likes: 28000,
  },
]
export default function SearchPage({ navigate, searchQuery }: NavProps) {
  const [query, setQuery] = useState(searchQuery ?? '')
  const [submitted, setSubmitted] = useState(!!searchQuery)
  const [history, setHistory] = useState(INIT_HISTORY)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const state: 'empty' | 'typing' | 'results' = submitted ? 'results' : query ? 'typing' : 'empty'
  const suggestions = query
    ? [`${query} 攻略`, `${query} 备考方法`, `${query} 真题解析`, `${query} 经验分享`]
    : []

  function doSearch(q: string) {
    if (!q.trim()) return
    setQuery(q)
    setSubmitted(true)
    setHistory(h => [q, ...h.filter(x => x !== q)].slice(0, 8))
  }

  const hasResults = RESULT_NOTES.length > 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--grey-50)' }}>
      {/* Clear history confirm */}
      {showClearConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 14,
              padding: '28px 32px',
              textAlign: 'center',
              minWidth: 280,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}
          >
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--text)',
                margin: '0 0 8px',
              }}
            >
              清空搜索历史
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-subtle)', margin: '0 0 24px' }}>
              清空后无法恢复，确定吗？
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  border: '1.5px solid var(--grey-150)',
                  borderRadius: 999,
                  fontSize: 14,
                  color: 'var(--text-muted)',
                  background: 'var(--surface)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                取消
              </button>
              <button
                onClick={() => {
                  setHistory([])
                  setShowClearConfirm(false)
                }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  border: 'none',
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--surface)',
                  background: 'var(--brand)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                清空
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search bar */}
      <div
        style={{
          background: 'var(--surface)',
          padding: '10px 20px',
          borderBottom: '1px solid #F5F5F5',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            flex: 1,
            background: 'var(--grey-50)',
            borderRadius: 999,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: 8,
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#999"
            strokeWidth="2.2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setSubmitted(false)
            }}
            onKeyDown={e => e.key === 'Enter' && doSearch(query)}
            placeholder="搜索笔记、话题、用户"
            autoFocus
            style={{
              flex: 1,
              border: 'none',
              background: 'none',
              outline: 'none',
              fontSize: 15,
              color: 'var(--text)',
              fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              onClick={() => {
                setQuery('')
                setSubmitted(false)
                inputRef.current?.focus()
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--grey-350)',
                fontSize: 18,
                lineHeight: 1,
                padding: 0,
              }}
            >
              ×
            </button>
          )}
        </div>
        <button
          onClick={() => navigate('feed')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 15,
            color: 'var(--text-muted)',
            flexShrink: 0,
            fontFamily: 'inherit',
          }}
        >
          取消
        </button>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px 48px' }}>
        {/* Empty state */}
        {state === 'empty' && (
          <div>
            <div style={{ padding: '20px 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                🔥 热搜榜
              </h3>
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--brand)',
                  background: 'var(--brand-tint)',
                  padding: '1px 6px',
                  borderRadius: 4,
                  fontWeight: 600,
                }}
              >
                实时
              </span>
            </div>
            {HOT_SEARCHES.map(item => (
              <div
                key={item.rank}
                onClick={() => doSearch(item.text)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '11px 0',
                  borderBottom: '1px solid #F5F5F5',
                  cursor: 'pointer',
                  gap: 14,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--grey-25)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span
                  style={{
                    width: 22,
                    fontSize: 15,
                    fontWeight: 700,
                    color: item.rank <= 3 ? 'var(--brand)' : 'var(--grey-350)',
                    textAlign: 'center',
                    flexShrink: 0,
                  }}
                >
                  {item.rank}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: 'var(--text)',
                    fontWeight: item.rank <= 3 ? 600 : 400,
                  }}
                >
                  {item.text}
                </span>
                {item.live && (
                  <span
                    style={{
                      fontSize: 10,
                      color: 'var(--brand)',
                      background: 'var(--brand-tint)',
                      padding: '1px 5px',
                      borderRadius: 3,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    🔴 实时
                  </span>
                )}
                <span style={{ fontSize: 12, color: 'var(--grey-350)', flexShrink: 0 }}>
                  {item.hot}
                </span>
              </div>
            ))}

            {history.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                    搜索历史
                  </h3>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 13,
                      color: 'var(--grey-350)',
                      fontFamily: 'inherit',
                    }}
                  >
                    清空
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {history.map(h => (
                    <div
                      key={h}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        background: 'var(--surface)',
                        borderRadius: 999,
                        padding: '6px 24px 6px 12px',
                        gap: 6,
                        border: '1px solid var(--grey-150)',
                      }}
                    >
                      <span
                        onClick={() => doSearch(h)}
                        style={{ fontSize: 13, color: '#444', cursor: 'pointer' }}
                      >
                        {h}
                      </span>
                      <button
                        onClick={() => setHistory(p => p.filter(x => x !== h))}
                        style={{
                          position: 'absolute',
                          top: 1,
                          right: 4,
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: '#D9D9D9',
                          color: 'var(--surface)',
                          fontSize: 10,
                          lineHeight: 1,
                          padding: 0,
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'inherit',
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Typing suggestions */}
        {state === 'typing' && (
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 10,
              marginTop: 8,
              overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            {suggestions.map(s => (
              <div
                key={s}
                onClick={() => doSearch(s)}
                style={{
                  padding: '13px 16px',
                  borderBottom: '1px solid #F5F5F5',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: 'var(--text)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--grey-25)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ccc"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <span>
                  <span style={{ color: 'var(--brand)' }}>{query}</span>
                  {s.slice(query.length)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Results — 主页式瀑布流 */}
        {state === 'results' && (
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--text)',
                padding: '18px 0 14px',
              }}
            >
              “{query}” 的相关笔记
            </div>
            {hasResults ? (
              <div style={{ columnCount: 4, columnGap: 12 }}>
                {RESULT_NOTES.map((n, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate('detail')}
                    style={{
                      breakInside: 'avoid',
                      marginBottom: 12,
                      background: 'var(--surface)',
                      borderRadius: 10,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      border: '1px solid var(--grey-75)',
                    }}
                  >
                    <img
                      src={`https://images.unsplash.com/${n.img}?w=400&h=${260 + (idx % 3) * 70}&fit=crop&auto=format`}
                      alt=""
                      style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '9px 10px 10px' }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--text)',
                          lineHeight: 1.45,
                          margin: '0 0 8px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical' as const,
                          overflow: 'hidden',
                        }}
                      >
                        <span style={{ color: 'var(--brand)' }}>{query}</span>
                        {n.title}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 12,
                          color: 'var(--grey-350)',
                        }}
                      >
                        <span>{n.author}</span>
                        <span>
                          ❤{' '}
                          {n.likes >= 10000
                            ? (n.likes / 10000).toFixed(1) + '万'
                            : n.likes.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <NoResults query={query} onSearch={doSearch} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function NoResults({ query, onSearch }: { query: string; onSearch: (q: string) => void }) {
  const suggestions = ['A-Level数学备考', '剑桥申请攻略', 'TMUA真题', '牛津面试经验']
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--grey-900)', margin: '0 0 6px' }}>
        没有找到"{query}"相关内容
      </p>
      <p style={{ fontSize: 13, color: 'var(--grey-350)', margin: '0 0 24px' }}>
        试试换个关键词搜索
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {suggestions.map(s => (
          <button
            key={s}
            onClick={() => onSearch(s)}
            style={{
              background: 'var(--brand-tint)',
              border: 'none',
              borderRadius: 999,
              padding: '7px 16px',
              fontSize: 13,
              color: 'var(--brand)',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
