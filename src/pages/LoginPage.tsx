import { useState, useEffect } from 'react'
import type { NavProps } from '../App'

function QRCode() {
  // Deterministic pixel grid simulating a QR code
  const size = 29
  const seed = [
    1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0,
    0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0,
    1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0,
    0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0,
    1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
    0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
    1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0,
    1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1,
    0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
    1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1,
    1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0,
    1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0,
    1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0,
    1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0,
    0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,
    1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1,
    0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0,
    0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1,
    1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0,
    0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1,
    1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0,
    0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
    0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 0, 0,
  ]
  const cellSize = 6
  return (
    <svg
      width={size * cellSize}
      height={size * cellSize}
      viewBox={`0 0 ${size * cellSize} ${size * cellSize}`}
    >
      {seed.map((v, i) => {
        if (!v) return null
        const x = (i % size) * cellSize
        const y = Math.floor(i / size) * cellSize
        return <rect key={i} x={x} y={y} width={cellSize} height={cellSize} fill="#000" />
      })}
    </svg>
  )
}

const PRIVACY_TEXT = `本隐私政策适用于 Comenius Community 提供的所有服务。我们深知个人信息对您的重要性，并会尽全力保护您的个人信息安全。

一、我们收集的信息
我们在您使用服务时收集的信息包括：手机号码、邮箱地址（用于账号注册和登录）、您主动填写的个人资料信息、您发布的内容及互动数据、设备信息和日志数据等。

二、信息的使用
我们将收集的信息用于：提供、维护和改进我们的服务；向您发送通知和服务相关信息；防止欺诈和滥用行为；遵守法律法规要求。

三、信息的分享
我们不会将您的个人信息出售给第三方。在获得您明确同意的情况下，我们可能会与合作伙伴分享必要的信息。

四、您的权利
您有权访问、更正或删除您的个人信息。如需行使上述权利，请通过应用内反馈功能联系我们。

五、联系我们
如对本政策有任何疑问，请发送邮件至 privacy@comenius.community。`

const AGREEMENT_TEXT = `欢迎使用 Comenius Community！请仔细阅读以下用户协议。

一、服务说明
Comenius Community 是一个专注于学习内容分享的社区平台，用户可以在此发布、浏览和讨论与学习、留学申请相关的内容。

二、用户行为规范
用户在使用本服务时，不得发布违法违规内容，不得侵犯他人知识产权，不得进行任何形式的商业欺诈。

三、内容版权
用户在平台发布的内容，著作权归用户所有。

四、免责声明
Comenius Community 不对用户发布的内容负责。

五、协议修改
本协议可能随时修改，修改后的协议将在平台上公示。`

function Modal({
  title,
  content,
  onClose,
}: {
  title: string
  content: string
  onClose: () => void
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 400,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: '16px 16px 0 0',
          width: '100%',
          maxWidth: 520,
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid #F5F5F5',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 20,
              color: 'var(--grey-350)',
              lineHeight: 1,
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: '16px 20px', flex: 1 }}>
          <p
            style={{
              fontSize: 13,
              color: 'var(--grey-800)',
              lineHeight: 1.8,
              whiteSpace: 'pre-line',
              margin: 0,
            }}
          >
            {content}
          </p>
        </div>
        <div style={{ padding: '16px 20px', flexShrink: 0, borderTop: '1px solid #F5F5F5' }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              background: 'var(--brand)',
              color: 'var(--surface)',
              border: 'none',
              borderRadius: 999,
              padding: '12px 0',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            我已阅读并同意
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage({ navigate }: NavProps) {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [codeLoading, setCodeLoading] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [codeError, setCodeError] = useState(false)
  const [modal, setModal] = useState<'privacy' | 'agreement' | 'children' | null>(null)
  const [phoneFocused, setPhoneFocused] = useState(false)
  const [codeFocused, setCodeFocused] = useState(false)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  function sendCode() {
    if (!phone || countdown > 0 || codeLoading) return
    if (!/^\d{7,}$/.test(phone.replace(/\s/g, ''))) {
      setPhoneError('请输入有效的手机号')
      return
    }
    setPhoneError('')
    setCodeLoading(true)
    setTimeout(() => {
      setCodeLoading(false)
      setCountdown(60)
    }, 1200)
  }

  function handleLogin() {
    if (!agreed || !phone) return
    if (code === '0000') {
      setCodeError(true)
      return
    }
    navigate('feed')
  }

  const modalTitle =
    modal === 'privacy'
      ? '隐私政策'
      : modal === 'agreement'
        ? '用户协议'
        : '儿童/青少年个人信息保护规则'
  const modalContent = modal === 'privacy' ? PRIVACY_TEXT : AGREEMENT_TEXT

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--surface-sunken)',
        fontFamily: "'Noto Sans SC', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {modal && <Modal title={modalTitle} content={modalContent} onClose={() => setModal(null)} />}

      {/* Modal card */}
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 20,
          boxShadow: '0 8px 60px rgba(0,0,0,0.15)',
          display: 'flex',
          width: 760,
          minHeight: 520,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Left: QR panel */}
        <div
          style={{
            width: 340,
            flexShrink: 0,
            background: 'var(--surface)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '40px 36px 32px',
            borderRight: '1px solid var(--grey-75)',
          }}
        >
          {/* Hint badge */}
          <div
            style={{
              background: '#EEF2FF',
              borderRadius: 999,
              padding: '8px 18px',
              marginBottom: 28,
            }}
          >
            <span style={{ fontSize: 14, color: '#4E6EF2', fontWeight: 500 }}>
              登录后推荐更懂你的笔记
            </span>
          </div>

          {/* Logo */}
          <div
            style={{
              background: 'var(--brand)',
              borderRadius: 999,
              padding: '8px 22px',
              marginBottom: 24,
            }}
          >
            <span
              style={{
                color: 'var(--surface)',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              Comenius
            </span>
          </div>

          {/* QR code box */}
          <div
            style={{
              border: '1px solid #EBEBEB',
              borderRadius: 12,
              padding: 12,
              marginBottom: 20,
              display: 'inline-block',
            }}
          >
            <QRCode />
          </div>

          {/* Scan hint */}
          <div
            style={{
              fontSize: 14,
              color: 'var(--grey-800)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 28,
            }}
          >
            可用
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  background: 'var(--brand)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: 'var(--surface)', fontSize: 9, fontWeight: 700 }}>C</span>
              </div>
              <span style={{ fontWeight: 600 }}>Comenius</span>
            </span>
            或
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#07C160',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: 'var(--surface)', fontSize: 9, fontWeight: 700 }}>微</span>
              </div>
              <span style={{ fontWeight: 600 }}>微信</span>
            </span>
            扫码
          </div>

          {/* How to scan */}
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              color: 'var(--grey-450)',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontFamily: 'inherit',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#aaa">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            如何扫码登录
          </button>
        </div>

        {/* Right: phone login */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '40px 44px 36px',
            position: 'relative',
          }}
        >
          {/* Close button */}
          <button
            onClick={() => navigate('feed')}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--grey-450)',
              fontSize: 20,
              lineHeight: 1,
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#aaa"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--ink-strong)',
              margin: '0 0 32px',
              textAlign: 'center',
            }}
          >
            手机号登录
          </h2>

          {/* Phone field */}
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--surface-sunken)',
                borderRadius: 12,
                overflow: 'hidden',
                border: `1.5px solid ${phoneError ? 'var(--brand)' : phoneFocused ? 'var(--brand)' : 'transparent'}`,
                transition: 'border-color 0.2s',
              }}
            >
              <div
                style={{
                  padding: '14px 14px 14px 18px',
                  fontSize: 15,
                  color: 'var(--grey-900)',
                  fontWeight: 600,
                  borderRight: '1px solid var(--grey-200)',
                  flexShrink: 0,
                  userSelect: 'none',
                }}
              >
                +86
              </div>
              <input
                value={phone}
                onChange={e => {
                  setPhone(e.target.value)
                  setPhoneError('')
                }}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => setPhoneFocused(false)}
                placeholder="输入手机号"
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 15,
                  color: 'var(--text)',
                  fontFamily: 'inherit',
                  padding: '14px 16px',
                }}
              />
            </div>
            {phoneError && (
              <p style={{ fontSize: 12, color: 'var(--brand)', margin: '5px 0 0 4px' }}>
                {phoneError}
              </p>
            )}
          </div>

          {/* Code field */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--surface-sunken)',
                borderRadius: 12,
                border: `1.5px solid ${codeError ? 'var(--brand)' : codeFocused ? 'var(--brand)' : 'transparent'}`,
                transition: 'border-color 0.2s',
              }}
            >
              <input
                value={code}
                onChange={e => {
                  setCode(e.target.value)
                  setCodeError(false)
                }}
                onFocus={() => setCodeFocused(true)}
                onBlur={() => setCodeFocused(false)}
                placeholder="输入验证码"
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 15,
                  color: 'var(--text)',
                  fontFamily: 'inherit',
                  padding: '14px 16px',
                }}
              />
              <button
                onClick={sendCode}
                disabled={!phone || countdown > 0 || codeLoading}
                style={{
                  flexShrink: 0,
                  padding: '0 18px',
                  height: 50,
                  background: 'transparent',
                  border: 'none',
                  cursor: phone && !countdown && !codeLoading ? 'pointer' : 'default',
                  fontSize: 14,
                  fontWeight: 600,
                  color: phone && !countdown && !codeLoading ? 'var(--brand)' : 'var(--grey-250)',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {codeLoading && (
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      border: '2px solid #FFB0BB',
                      borderTopColor: 'var(--brand)',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  />
                )}
                {codeLoading ? '发送中' : countdown > 0 ? `${countdown}s后重发` : '获取验证码'}
              </button>
            </div>
            {codeError && (
              <p style={{ fontSize: 12, color: 'var(--brand)', margin: '5px 0 0 4px' }}>
                验证码错误，请重新输入
              </p>
            )}
          </div>

          {/* Login button */}
          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              height: 52,
              background: 'var(--brand)',
              color: 'var(--surface)',
              border: 'none',
              borderRadius: 999,
              fontSize: 17,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              marginBottom: 20,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#E01F38')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--brand)')}
          >
            登录
          </button>

          {/* Agreement */}
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              cursor: 'pointer',
              marginBottom: 20,
            }}
          >
            <div
              onClick={() => setAgreed(a => !a)}
              style={{
                width: 16,
                height: 16,
                borderRadius: 3,
                border: `1.5px solid ${agreed ? 'var(--brand)' : '#C8C8C8'}`,
                background: agreed ? 'var(--brand)' : 'var(--surface)',
                flexShrink: 0,
                marginTop: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {agreed && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span style={{ fontSize: 12, color: '#888', lineHeight: 1.6 }}>
              我已阅读并同意
              <span
                onClick={e => {
                  e.preventDefault()
                  setModal('agreement')
                }}
                style={{ color: 'var(--brand)', cursor: 'pointer' }}
              >
                《用户协议》
              </span>
              <span
                onClick={e => {
                  e.preventDefault()
                  setModal('privacy')
                }}
                style={{ color: 'var(--brand)', cursor: 'pointer' }}
              >
                《隐私政策》
              </span>
              <span
                onClick={e => {
                  e.preventDefault()
                  setModal('children')
                }}
                style={{ color: 'var(--brand)', cursor: 'pointer' }}
              >
                《儿童/青少年个人信息保护规则》
              </span>
            </span>
          </label>

          {/* New user hint */}
          <div style={{ textAlign: 'center', marginTop: 'auto' }}>
            <span style={{ fontSize: 13, color: 'var(--grey-350)' }}>新用户可直接登录</span>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
