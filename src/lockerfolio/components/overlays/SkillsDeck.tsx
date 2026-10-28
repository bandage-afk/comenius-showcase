import { useState } from 'react'
import { useProfile, type Academic } from '../../../profileStore'
import { useStore } from '../../store'
import CloseButton from './CloseButton'
import './overlay.css'
import './edit.css'

const GRADE_SCALES: Record<string, string[]> = {
  'A-Level': ['A*', 'A', 'B', 'C', 'D', 'E'],
  AP: ['5', '4', '3', '2', '1'],
  IB: ['7', '6', '5', '4', '3', '2', '1'],
}

/** 学业档案：书包里的成绩卡 */
export default function SkillsDeck() {
  const profile = useProfile(s => s.profile)
  const closeOverlay = useStore(s => s.closeOverlay)
  const [d, setD] = useState<Academic>(profile.academic)
  const setAc = (patch: Partial<Academic>) => setD(p => ({ ...p, ...patch }))

  const setGrade = (i: number, field: 'subject' | 'grade', v: string) => {
    setAc({ grades: d.grades.map((g, idx) => (idx === i ? { ...g, [field]: v } : g)) })
  }
  const addGrade = () =>
    setAc({ grades: [...d.grades, { subject: '', grade: GRADE_SCALES[d.system][0] }] })
  const removeGrade = (i: number) => setAc({ grades: d.grades.filter((_, idx) => idx !== i) })

  const save = () => {
    useProfile.getState().save({ ...useProfile.getState().profile, academic: d })
    closeOverlay()
  }

  return (
    <div className="ov">
      <div className="ef">
        <CloseButton />
        <div className="ef__head">
          <h2>学业档案</h2>
          <span>ACADEMIC · 书包</span>
        </div>

        <div className="ef__system">
          {(['A-Level', 'AP', 'IB'] as const).map(s => (
            <button
              key={s}
              className={d.system === s ? 'on' : ''}
              onClick={() =>
                setAc({
                  system: s,
                  grades: d.grades.length ? d.grades : [{ subject: '', grade: GRADE_SCALES[s][0] }],
                })
              }
            >
              {s}
            </button>
          ))}
        </div>

        {d.grades.map((g, i) => (
          <div key={i} className="ef__item">
            <input
              placeholder="科目，如：数学"
              value={g.subject}
              onChange={e => setGrade(i, 'subject', e.target.value)}
            />
            <select value={g.grade} onChange={e => setGrade(i, 'grade', e.target.value)}>
              {GRADE_SCALES[d.system].map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <button className="ef__del" onClick={() => removeGrade(i)}>
              ✕
            </button>
          </div>
        ))}
        <button className="ef__add" onClick={addGrade}>
          + 添加科目
        </button>

        <button className="ef__save" onClick={save}>
          保存学业档案
        </button>
      </div>
    </div>
  )
}
