import { AnimatePresence } from 'framer-motion'
import type { Conversation } from '../../community/data'
import { Overlay, QRCode } from './parts'

/**
 * 「群二维码」浮层：群名 + 成员数 + 演示用二维码。
 *
 * 从 GroupPanel.tsx 拆出（⑥ 收尾里最小的一块）：它只依赖"开没开"和会话本身，
 * 所以 props 就三个，没有别的耦合。真要扫码入群需要后端，文案里已注明是演示图案。
 */
export default function GroupQrCard({
  conv,
  open,
  onClose,
}: {
  conv: Conversation
  open: boolean
  onClose: () => void
}) {
  const members = conv.memberIds ?? []

  return (
    <AnimatePresence>
      {open && (
        <Overlay onClose={onClose}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ink-strong)' }}>
              {conv.name}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--grey-400)', margin: '4px 0 14px' }}>
              {members.length + 1} 位成员
            </div>
            <QRCode seed={conv.name} />
            <div
              style={{ fontSize: 11.5, color: 'var(--grey-400)', marginTop: 12, lineHeight: 1.6 }}
            >
              扫二维码加入群聊
              <br />
              （演示图案，真实扫码入群需要后端）
            </div>
          </div>
        </Overlay>
      )}
    </AnimatePresence>
  )
}
