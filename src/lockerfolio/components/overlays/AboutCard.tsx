import { useState } from 'react'
import { useProfile, type ProfileData } from '../../../profileStore'
import { useStore } from '../../store'
import CloseButton from './CloseButton'
import './overlay.css'
import './edit.css'

const GENDERS = ['男', '女', '其他', '保密']
const REGIONS = [
  '北京',
  '上海',
  '广东',
  '浙江',
  '江苏',
  '四川',
  '山东',
  '河南',
  '湖北',
  '湖南',
  '陕西',
  '福建',
  '其他',
]

/** 身份资料：挂在储物柜里的"学生证"编辑卡 */
export default function AboutCard() {
  const profile = useProfile(s => s.profile)
  const closeOverlay = useStore(s => s.closeOverlay)
  const [d, setD] = useState<ProfileData>(profile)
  const set = (k: keyof ProfileData, v: string) => setD(p => ({ ...p, [k]: v }))

  const save = () => {
    useProfile.getState().save(d)
    closeOverlay()
  }

  return (
    <div className="ov">
      <div className="ef">
        <CloseButton />
        <div className="ef__head">
          <h2>身份资料</h2>
          <span>IDENTITY · 学生证</span>
        </div>

        <div className="ef__row">
          <div className="ef__field">
            <label>名字</label>
            <input value={d.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="ef__field">
            <label>Comenius号</label>
            <input value={d.comeniusId} onChange={e => set('comeniusId', e.target.value)} />
          </div>
        </div>
        <div className="ef__field">
          <label>简介</label>
          <textarea rows={2} value={d.bio} onChange={e => set('bio', e.target.value)} />
        </div>
        <div className="ef__row">
          <div className="ef__field">
            <label>性别</label>
            <select value={d.gender} onChange={e => set('gender', e.target.value)}>
              {GENDERS.map(g => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <div className="ef__field">
            <label>生日</label>
            <input type="date" value={d.birthday} onChange={e => set('birthday', e.target.value)} />
          </div>
        </div>
        <div className="ef__row">
          <div className="ef__field">
            <label>地区</label>
            <select value={d.region} onChange={e => set('region', e.target.value)}>
              {REGIONS.map(r => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="ef__field">
            <label>职业</label>
            <input value={d.occupation} onChange={e => set('occupation', e.target.value)} />
          </div>
        </div>
        <div className="ef__field">
          <label>学校</label>
          <input value={d.school} onChange={e => set('school', e.target.value)} />
        </div>

        <button className="ef__save" onClick={save}>
          保存身份资料
        </button>
      </div>
    </div>
  )
}
