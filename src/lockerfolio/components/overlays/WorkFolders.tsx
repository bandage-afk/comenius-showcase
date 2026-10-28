import { useState } from 'react'
import { useProfile, type Academic } from '../../../profileStore'
import { useStore } from '../../store'
import CloseButton from './CloseButton'
import './overlay.css'
import './edit.css'

/** 经历：文件夹里的竞赛与活动 */
export default function WorkFolders() {
  const profile = useProfile(s => s.profile)
  const closeOverlay = useStore(s => s.closeOverlay)
  const [d, setD] = useState<Academic>(profile.academic)
  const setAc = (patch: Partial<Academic>) => setD(p => ({ ...p, ...patch }))

  const setComp = (i: number, field: 'name' | 'award' | 'time', v: string) => {
    setAc({ comps: d.comps.map((c, idx) => (idx === i ? { ...c, [field]: v } : c)) })
  }
  const setAct = (i: number, field: 'name' | 'role' | 'desc', v: string) => {
    setAc({ activities: d.activities.map((a, idx) => (idx === i ? { ...a, [field]: v } : a)) })
  }

  const save = () => {
    useProfile.getState().save({ ...useProfile.getState().profile, academic: d })
    closeOverlay()
  }

  return (
    <div className="ov">
      <div className="ef">
        <CloseButton />
        <div className="ef__head">
          <h2>经历</h2>
          <span>EXPERIENCE · 文件夹</span>
        </div>

        <div className="ef__field">
          <label>竞赛</label>
        </div>
        {d.comps.map((c, i) => (
          <div key={i} className="ef__item">
            <input
              placeholder="竞赛名称"
              value={c.name}
              onChange={e => setComp(i, 'name', e.target.value)}
            />
            <input
              placeholder="奖项"
              value={c.award}
              onChange={e => setComp(i, 'award', e.target.value)}
            />
            <input
              placeholder="时间"
              value={c.time}
              onChange={e => setComp(i, 'time', e.target.value)}
            />
            <button
              className="ef__del"
              onClick={() => setAc({ comps: d.comps.filter((_, idx) => idx !== i) })}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          className="ef__add"
          onClick={() => setAc({ comps: [...d.comps, { name: '', award: '', time: '' }] })}
        >
          + 添加竞赛
        </button>

        <div className="ef__field">
          <label>活动</label>
        </div>
        {d.activities.map((a, i) => (
          <div key={i}>
            <div className="ef__item">
              <input
                placeholder="活动名称"
                value={a.name}
                onChange={e => setAct(i, 'name', e.target.value)}
              />
              <input
                placeholder="角色"
                value={a.role}
                onChange={e => setAct(i, 'role', e.target.value)}
              />
              <button
                className="ef__del"
                onClick={() => setAc({ activities: d.activities.filter((_, idx) => idx !== i) })}
              >
                ✕
              </button>
            </div>
            <input
              placeholder="描述（可选）"
              value={a.desc}
              onChange={e => setAct(i, 'desc', e.target.value)}
              style={{
                width: '100%',
                border: '1px solid #e4e4e4',
                borderRadius: 10,
                padding: '9px 12px',
                fontSize: 14,
                fontFamily: 'inherit',
                outline: 'none',
                background: '#fafafa',
                boxSizing: 'border-box',
                marginBottom: 8,
              }}
            />
          </div>
        ))}
        <button
          className="ef__add"
          onClick={() => setAc({ activities: [...d.activities, { name: '', role: '', desc: '' }] })}
        >
          + 添加活动
        </button>

        <button className="ef__save" onClick={save}>
          保存经历
        </button>
      </div>
    </div>
  )
}
