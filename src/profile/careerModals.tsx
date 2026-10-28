// 「我的 → 职业」里的编辑弹窗（9 个）。
// 从 CareerProfile.tsx 拆出：主视图管展示，弹窗管编辑，两边各自演进、并行改不撞车。

import { useRef, useState } from 'react'
import type { Certification, Education, Experience, Language, Skill, Volunteer } from './career'
import type { ProfileData } from '../profileStore'
import { Field, Ico, icons, inputCls, Modal, SaveBtn, selectCls, textareaCls } from '../teacher/ui'

export function EditProfileModal({
  profile,
  onSave,
  onClose,
}: {
  profile: ProfileData
  onSave: (p: ProfileData) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({ ...profile })
  const coverRef = useRef<HTMLInputElement>(null)
  const avatarRef = useRef<HTMLInputElement>(null)

  const handleFile = (field: 'avatarUrl' | 'bg', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setForm(prev => ({ ...prev, [field]: url }))
  }

  return (
    <Modal title="Edit intro" onClose={onClose} wide>
      <div className="space-y-1">
        {/* Cover */}
        <div className="relative h-32 rounded-xl overflow-hidden bg-gray-200 mb-8">
          <img src={form.bg} alt="Cover" className="w-full h-full object-cover" />
          <button
            onClick={() => coverRef.current?.click()}
            className="absolute bottom-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 cursor-pointer"
          >
            <Ico d={icons.camera} size={16} />
          </button>
          <input
            ref={coverRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handleFile('bg', e)}
          />
        </div>
        {/* Avatar */}
        <div className="flex items-end gap-4 -mt-14 mb-4">
          <div className="relative">
            <img
              src={form.avatarUrl}
              alt=""
              className="w-24 h-24 rounded-full object-cover border-4 border-white"
            />
            <button
              onClick={() => avatarRef.current?.click()}
              className="absolute bottom-1 right-1 bg-linkedin text-white p-1.5 rounded-full hover:bg-[#004182] cursor-pointer"
            >
              <Ico d={icons.camera} size={13} />
            </button>
            <input
              ref={avatarRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => handleFile('avatarUrl', e)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="First name *">
            <input
              className={inputCls}
              value={form.name.split(' ')[0]}
              onChange={e =>
                setForm(f => ({
                  ...f,
                  name: e.target.value + ' ' + f.name.split(' ').slice(1).join(' '),
                }))
              }
            />
          </Field>
          <Field label="Last name *">
            <input
              className={inputCls}
              value={form.name.split(' ').slice(1).join(' ')}
              onChange={e =>
                setForm(f => ({ ...f, name: f.name.split(' ')[0] + ' ' + e.target.value }))
              }
            />
          </Field>
        </div>

        <Field label="Pronouns">
          <select
            className={selectCls}
            value={form.pronouns}
            onChange={e => setForm(f => ({ ...f, pronouns: e.target.value }))}
          >
            <option value="">Select pronouns</option>
            <option>he/him</option>
            <option>she/her</option>
            <option>they/them</option>
            <option>other</option>
          </select>
        </Field>

        <Field label="Headline *">
          <input
            className={inputCls}
            value={form.headline}
            onChange={e => setForm(f => ({ ...f, headline: e.target.value }))}
            maxLength={220}
          />
          <p className="text-xs text-text-muted mt-1">{form.headline.length}/220</p>
        </Field>

        <Field label="Location">
          <input
            className={inputCls}
            value={form.region}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            placeholder="City, State, Country"
          />
        </Field>

        <Field label="Website">
          <input
            className={inputCls}
            value={form.website}
            onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
            placeholder="https://"
          />
        </Field>

        <Field label="Email">
          <input
            className={inputCls}
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
        </Field>

        <Field label="Phone">
          <input
            className={inputCls}
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          />
        </Field>

        <div className="flex items-center justify-between p-3 border border-linkedin-border rounded-lg">
          <div>
            <p className="text-sm font-medium text-ink">Open to work</p>
            <p className="text-xs text-text-muted">Let recruiters know you're looking</p>
          </div>
          <button
            onClick={() => setForm(f => ({ ...f, openToWork: !f.openToWork }))}
            className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${form.openToWork ? 'bg-linkedin' : 'bg-gray-300'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${form.openToWork ? 'translate-x-4' : ''}`}
            />
          </button>
        </div>

        {form.openToWork && (
          <Field label="Roles you're open to">
            <input
              className={inputCls}
              value={form.openToWorkRoles}
              onChange={e => setForm(f => ({ ...f, openToWorkRoles: e.target.value }))}
              placeholder="e.g. Product Design Lead, Head of Design"
            />
          </Field>
        )}
      </div>
      <SaveBtn
        onClick={() => {
          onSave(form)
          onClose()
        }}
      />
    </Modal>
  )
}

// Edit About Modal
export function EditAboutModal({
  summary,
  onSave,
  onClose,
}: {
  summary: string
  onSave: (s: string) => void
  onClose: () => void
}) {
  const [val, setVal] = useState(summary)
  return (
    <Modal title="Edit about" onClose={onClose}>
      <Field label="About">
        <textarea
          className={textareaCls}
          rows={10}
          value={val}
          onChange={e => setVal(e.target.value)}
          maxLength={2600}
        />
        <p className="text-xs text-text-muted mt-1">{val.length}/2600</p>
      </Field>
      <SaveBtn
        onClick={() => {
          onSave(val)
          onClose()
        }}
      />
    </Modal>
  )
}

// Edit Experience Modal
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const years = Array.from({ length: 40 }, (_, i) => String(2025 - i))

/**
 * 各弹窗的「空草稿」模板。
 * 以前这些对象直接写在组件体里（每次渲染都会跑一遍 Date.now()），
 * 现在改成模块作用域的工厂函数 + useState 惰性初始化：只在挂载时算一次。
 */
const blankExperience = (): Experience => ({
  id: Date.now().toString(),
  company: '',
  logo: '',
  role: '',
  type: 'Full-time',
  startMonth: 'January',
  startYear: '2023',
  endMonth: '',
  endYear: '',
  current: false,
  location: '',
  locationType: 'On-site',
  description: '',
  skills: [],
})

const blankEducation = (): Education => ({
  id: Date.now().toString(),
  school: '',
  logo: '',
  degree: '',
  field: '',
  startYear: '2020',
  endYear: '2024',
  gpa: '',
  activities: '',
  description: '',
})

const blankCertification = (): Certification => ({
  id: Date.now().toString(),
  name: '',
  issuer: '',
  issueDate: '',
  expiryDate: '',
  credentialId: '',
  credentialUrl: '',
  logo: '',
})

const blankVolunteer = (): Volunteer => ({
  id: Date.now().toString(),
  organization: '',
  role: '',
  cause: '',
  startYear: '2020',
  endYear: '',
  current: true,
  description: '',
})

/** 「读研/工作年限」文案，纯函数 */
export const durLabel = (exp: Experience): string => {
  const sy = parseInt(exp.startYear)
  const ey = exp.current ? new Date().getFullYear() : parseInt(exp.endYear || '0')
  const diff = ey - sy
  return diff <= 0 ? '' : `${diff} yr${diff > 1 ? 's' : ''}`
}

export function EditExperienceModal({
  exp,
  onSave,
  onClose,
  onDelete,
}: {
  exp: Partial<Experience> | null
  onSave: (e: Experience) => void
  onClose: () => void
  onDelete?: () => void
}) {
  const [form, setForm] = useState<Experience>(() => ({ ...blankExperience(), ...exp }))
  const [skillInput, setSkillInput] = useState('')
  const f = (k: keyof Experience, v: string | boolean | string[]) =>
    setForm(prev => ({ ...prev, [k]: v }))

  return (
    <Modal title={exp?.id ? 'Edit experience' : 'Add experience'} onClose={onClose}>
      <Field label="Title *">
        <input
          className={inputCls}
          value={form.role}
          onChange={e => f('role', e.target.value)}
          placeholder="Ex: Product Designer"
        />
      </Field>
      <Field label="Employment type">
        <select className={selectCls} value={form.type} onChange={e => f('type', e.target.value)}>
          {[
            'Full-time',
            'Part-time',
            'Self-employed',
            'Freelance',
            'Contract',
            'Internship',
            'Apprenticeship',
          ].map(t => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field label="Company name *">
        <input
          className={inputCls}
          value={form.company}
          onChange={e => f('company', e.target.value)}
        />
      </Field>
      <Field label="Location">
        <input
          className={inputCls}
          value={form.location}
          onChange={e => f('location', e.target.value)}
        />
      </Field>
      <Field label="Location type">
        <select
          className={selectCls}
          value={form.locationType}
          onChange={e => f('locationType', e.target.value)}
        >
          {['On-site', 'Hybrid', 'Remote'].map(t => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>
      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          id="current"
          checked={form.current}
          onChange={e => f('current', e.target.checked)}
          className="w-4 h-4 accent-linkedin"
        />
        <label htmlFor="current" className="text-sm text-ink">
          I am currently working in this role
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start month">
          <select
            className={selectCls}
            value={form.startMonth}
            onChange={e => f('startMonth', e.target.value)}
          >
            {months.map(m => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Field>
        <Field label="Start year">
          <select
            className={selectCls}
            value={form.startYear}
            onChange={e => f('startYear', e.target.value)}
          >
            {years.map(y => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </Field>
      </div>
      {!form.current && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="End month">
            <select
              className={selectCls}
              value={form.endMonth}
              onChange={e => f('endMonth', e.target.value)}
            >
              <option value="">Month</option>
              {months.map(m => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Field>
          <Field label="End year">
            <select
              className={selectCls}
              value={form.endYear}
              onChange={e => f('endYear', e.target.value)}
            >
              <option value="">Year</option>
              {years.map(y => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </Field>
        </div>
      )}
      <Field label="Description">
        <textarea
          className={textareaCls}
          rows={4}
          value={form.description}
          onChange={e => f('description', e.target.value)}
          maxLength={2000}
        />
      </Field>
      <Field label="Skills">
        <div className="flex gap-2 mb-2">
          <input
            className={inputCls}
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            placeholder="Add a skill"
            onKeyDown={e => {
              if (e.key === 'Enter' && skillInput.trim()) {
                f('skills', [...form.skills, skillInput.trim()])
                setSkillInput('')
              }
            }}
          />
          <button
            onClick={() => {
              if (skillInput.trim()) {
                f('skills', [...form.skills, skillInput.trim()])
                setSkillInput('')
              }
            }}
            className="px-3 py-2 bg-linkedin text-white text-sm rounded-lg hover:bg-[#004182] cursor-pointer"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.skills.map((s, i) => (
            <span
              key={i}
              className="flex items-center gap-1 px-2 py-0.5 bg-[#EEF3F8] text-linkedin text-xs rounded-full"
            >
              {s}
              <button
                onClick={() =>
                  f(
                    'skills',
                    form.skills.filter((_, j) => j !== i),
                  )
                }
                className="cursor-pointer hover:text-red-500"
              >
                <Ico d={icons.x} size={10} />
              </button>
            </span>
          ))}
        </div>
      </Field>
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-linkedin-border">
        {onDelete ? (
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 text-red-500 text-sm hover:text-red-700 cursor-pointer"
          >
            <Ico d={icons.trash} size={14} />
            Delete
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={() => {
            onSave(form)
            onClose()
          }}
          className="px-6 py-2 bg-linkedin text-white text-sm font-semibold rounded-full hover:bg-[#004182] cursor-pointer"
        >
          Save
        </button>
      </div>
    </Modal>
  )
}

// Edit Education Modal
export function EditEducationModal({
  edu,
  onSave,
  onClose,
  onDelete,
}: {
  edu: Partial<Education> | null
  onSave: (e: Education) => void
  onClose: () => void
  onDelete?: () => void
}) {
  const [form, setForm] = useState<Education>(() => ({ ...blankEducation(), ...edu }))
  const f = (k: keyof Education, v: string) => setForm(prev => ({ ...prev, [k]: v }))
  return (
    <Modal title={edu?.id ? 'Edit education' : 'Add education'} onClose={onClose}>
      <Field label="School *">
        <input
          className={inputCls}
          value={form.school}
          onChange={e => f('school', e.target.value)}
        />
      </Field>
      <Field label="Degree">
        <input
          className={inputCls}
          value={form.degree}
          onChange={e => f('degree', e.target.value)}
          placeholder="Ex: Bachelor's"
        />
      </Field>
      <Field label="Field of study">
        <input className={inputCls} value={form.field} onChange={e => f('field', e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start year">
          <select
            className={selectCls}
            value={form.startYear}
            onChange={e => f('startYear', e.target.value)}
          >
            {years.map(y => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </Field>
        <Field label="End year (or expected)">
          <select
            className={selectCls}
            value={form.endYear}
            onChange={e => f('endYear', e.target.value)}
          >
            {years.map(y => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="GPA">
        <input
          className={inputCls}
          value={form.gpa}
          onChange={e => f('gpa', e.target.value)}
          placeholder="Ex: 3.8"
        />
      </Field>
      <Field label="Activities and societies">
        <textarea
          className={textareaCls}
          rows={2}
          value={form.activities}
          onChange={e => f('activities', e.target.value)}
        />
      </Field>
      <Field label="Description">
        <textarea
          className={textareaCls}
          rows={3}
          value={form.description}
          onChange={e => f('description', e.target.value)}
        />
      </Field>
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-linkedin-border">
        {onDelete ? (
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 text-red-500 text-sm hover:text-red-700 cursor-pointer"
          >
            <Ico d={icons.trash} size={14} />
            Delete
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={() => {
            onSave(form)
            onClose()
          }}
          className="px-6 py-2 bg-linkedin text-white text-sm font-semibold rounded-full hover:bg-[#004182] cursor-pointer"
        >
          Save
        </button>
      </div>
    </Modal>
  )
}

// Edit Skills Modal
export function EditSkillsModal({
  skills,
  onSave,
  onClose,
}: {
  skills: Skill[]
  onSave: (s: Skill[]) => void
  onClose: () => void
}) {
  const [list, setList] = useState([...skills])
  const [input, setInput] = useState('')
  const [cat, setCat] = useState('Design')
  const add = () => {
    if (!input.trim()) return
    setList(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: input.trim(),
        endorsements: 0,
        endorsed: false,
        category: cat,
      },
    ])
    setInput('')
  }
  return (
    <Modal title="Edit skills" onClose={onClose}>
      <div className="flex gap-2 mb-4">
        <input
          className={inputCls}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add a skill"
          onKeyDown={e => e.key === 'Enter' && add()}
        />
        <select className={selectCls + ' w-32'} value={cat} onChange={e => setCat(e.target.value)}>
          {['Design', 'Research', 'Strategy', 'Tools', 'Other'].map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={add}
          className="px-3 py-2 bg-linkedin text-white text-sm rounded-lg hover:bg-[#004182] cursor-pointer whitespace-nowrap"
        >
          Add
        </button>
      </div>
      <div className="space-y-2">
        {list.map(s => (
          <div
            key={s.id}
            className="flex items-center justify-between p-2.5 border border-linkedin-border rounded-lg"
          >
            <div>
              <p className="text-sm font-medium text-ink">{s.name}</p>
              <p className="text-xs text-text-muted">
                {s.category} · {s.endorsements} endorsements
              </p>
            </div>
            <button
              onClick={() => setList(prev => prev.filter(x => x.id !== s.id))}
              className="text-red-400 hover:text-red-600 cursor-pointer"
            >
              <Ico d={icons.trash} size={15} />
            </button>
          </div>
        ))}
      </div>
      <SaveBtn
        onClick={() => {
          onSave(list)
          onClose()
        }}
      />
    </Modal>
  )
}

// Resume Upload Modal
export function ResumeModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && (f.type === 'application/pdf' || f.name.endsWith('.doc') || f.name.endsWith('.docx')))
      setFile(f)
  }

  return (
    <Modal title="Upload resume" onClose={onClose}>
      <p className="text-sm text-text-muted mb-4">
        Upload your resume to let recruiters find you and apply with one click.
      </p>
      <div
        onDragOver={e => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragging ? 'border-linkedin bg-blue-50' : 'border-linkedin-border hover:border-linkedin hover:bg-linkedin-bg'}`}
      >
        <Ico d={icons.upload} size={36} />
        <p className="text-sm font-medium text-ink mt-3">Drag and drop your resume</p>
        <p className="text-xs text-text-muted mt-1">or click to browse files</p>
        <p className="text-xs text-text-muted mt-2">PDF, DOC, DOCX — max 5MB</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={e => setFile(e.target.files?.[0] || null)}
        />
      </div>
      {file && (
        <div className="mt-4 flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Ico d={icons.check} size={18} />
          <div>
            <p className="text-sm font-medium text-green-800">{file.name}</p>
            <p className="text-xs text-green-600">
              {(file.size / 1024).toFixed(0)} KB · Ready to upload
            </p>
          </div>
          <button
            onClick={() => setFile(null)}
            className="ml-auto text-green-600 hover:text-green-800 cursor-pointer"
          >
            <Ico d={icons.x} size={14} />
          </button>
        </div>
      )}
      <div className="flex justify-end mt-6 pt-4 border-t border-linkedin-border gap-3">
        <button
          onClick={onClose}
          className="px-5 py-2 text-sm font-semibold text-text-muted rounded-full border border-[#C8C6C3] hover:bg-linkedin-bg cursor-pointer"
        >
          Cancel
        </button>
        <button
          disabled={!file}
          onClick={onClose}
          className={`px-6 py-2 text-sm font-semibold rounded-full transition-colors ${file ? 'bg-linkedin text-white hover:bg-[#004182] cursor-pointer' : 'bg-linkedin-border text-text-subtle cursor-not-allowed'}`}
        >
          Upload
        </button>
      </div>
    </Modal>
  )
}

// Edit Certifications
export function EditCertModal({
  cert,
  onSave,
  onClose,
  onDelete,
}: {
  cert: Partial<Certification> | null
  onSave: (c: Certification) => void
  onClose: () => void
  onDelete?: () => void
}) {
  const [form, setForm] = useState<Certification>(() => ({ ...blankCertification(), ...cert }))
  const f = (k: keyof Certification, v: string) => setForm(prev => ({ ...prev, [k]: v }))
  return (
    <Modal title={cert?.id ? 'Edit certification' : 'Add certification'} onClose={onClose}>
      <Field label="Name *">
        <input className={inputCls} value={form.name} onChange={e => f('name', e.target.value)} />
      </Field>
      <Field label="Issuing organization *">
        <input
          className={inputCls}
          value={form.issuer}
          onChange={e => f('issuer', e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Issue date">
          <input
            className={inputCls}
            value={form.issueDate}
            onChange={e => f('issueDate', e.target.value)}
            placeholder="Ex: Jun 2023"
          />
        </Field>
        <Field label="Expiration date">
          <input
            className={inputCls}
            value={form.expiryDate}
            onChange={e => f('expiryDate', e.target.value)}
            placeholder="No expiration"
          />
        </Field>
      </div>
      <Field label="Credential ID">
        <input
          className={inputCls}
          value={form.credentialId}
          onChange={e => f('credentialId', e.target.value)}
        />
      </Field>
      <Field label="Credential URL">
        <input
          className={inputCls}
          value={form.credentialUrl}
          onChange={e => f('credentialUrl', e.target.value)}
          placeholder="https://"
        />
      </Field>
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-linkedin-border">
        {onDelete ? (
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 text-red-500 text-sm hover:text-red-700 cursor-pointer"
          >
            <Ico d={icons.trash} size={14} />
            Delete
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={() => {
            onSave(form)
            onClose()
          }}
          className="px-6 py-2 bg-linkedin text-white text-sm font-semibold rounded-full hover:bg-[#004182] cursor-pointer"
        >
          Save
        </button>
      </div>
    </Modal>
  )
}

// Edit Languages
export function EditLanguagesModal({
  languages,
  onSave,
  onClose,
}: {
  languages: Language[]
  onSave: (l: Language[]) => void
  onClose: () => void
}) {
  const [list, setList] = useState([...languages])
  const addLang = () =>
    setList(prev => [
      ...prev,
      { id: Date.now().toString(), name: '', proficiency: 'Elementary proficiency' },
    ])
  const update = (id: string, k: keyof Language, v: string) =>
    setList(prev => prev.map(l => (l.id === id ? { ...l, [k]: v } : l)))
  const proficiencies = [
    'Elementary proficiency',
    'Limited working proficiency',
    'Professional working proficiency',
    'Full professional proficiency',
    'Native or bilingual proficiency',
  ]
  return (
    <Modal title="Edit languages" onClose={onClose}>
      <div className="space-y-3">
        {list.map(lang => (
          <div
            key={lang.id}
            className="flex gap-2 items-start p-3 border border-linkedin-border rounded-lg"
          >
            <div className="flex-1 space-y-2">
              <input
                className={inputCls}
                value={lang.name}
                onChange={e => update(lang.id, 'name', e.target.value)}
                placeholder="Language"
              />
              <select
                className={selectCls}
                value={lang.proficiency}
                onChange={e => update(lang.id, 'proficiency', e.target.value)}
              >
                {proficiencies.map(p => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setList(prev => prev.filter(l => l.id !== lang.id))}
              className="text-red-400 hover:text-red-600 cursor-pointer mt-2"
            >
              <Ico d={icons.trash} size={15} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addLang}
        className="mt-3 flex items-center gap-2 text-linkedin text-sm font-medium hover:text-[#004182] cursor-pointer"
      >
        <Ico d={icons.plus} size={16} />
        Add language
      </button>
      <SaveBtn
        onClick={() => {
          onSave(list)
          onClose()
        }}
      />
    </Modal>
  )
}

// Edit Volunteer
export function EditVolunteerModal({
  vol,
  onSave,
  onClose,
  onDelete,
}: {
  vol: Partial<Volunteer> | null
  onSave: (v: Volunteer) => void
  onClose: () => void
  onDelete?: () => void
}) {
  const [form, setForm] = useState<Volunteer>(() => ({ ...blankVolunteer(), ...vol }))
  const f = (k: keyof Volunteer, v: string | boolean) => setForm(prev => ({ ...prev, [k]: v }))
  return (
    <Modal
      title={vol?.id ? 'Edit volunteer experience' : 'Add volunteer experience'}
      onClose={onClose}
    >
      <Field label="Organization *">
        <input
          className={inputCls}
          value={form.organization}
          onChange={e => f('organization', e.target.value)}
        />
      </Field>
      <Field label="Role *">
        <input className={inputCls} value={form.role} onChange={e => f('role', e.target.value)} />
      </Field>
      <Field label="Cause">
        <select className={selectCls} value={form.cause} onChange={e => f('cause', e.target.value)}>
          {[
            'Animal Welfare',
            'Arts & Culture',
            'Children',
            'Civil Rights',
            'Economic Empowerment',
            'Education',
            'Environment',
            'Health',
            'Human Rights',
            'Politics',
            'Poverty Alleviation',
            'Science & Technology',
            'Social Services',
          ].map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>
      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          id="volcurrent"
          checked={form.current}
          onChange={e => f('current', e.target.checked)}
          className="w-4 h-4 accent-linkedin"
        />
        <label htmlFor="volcurrent" className="text-sm text-ink">
          I currently volunteer here
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start year">
          <select
            className={selectCls}
            value={form.startYear}
            onChange={e => f('startYear', e.target.value)}
          >
            {years.map(y => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </Field>
        {!form.current && (
          <Field label="End year">
            <select
              className={selectCls}
              value={form.endYear}
              onChange={e => f('endYear', e.target.value)}
            >
              <option value="">Year</option>
              {years.map(y => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </Field>
        )}
      </div>
      <Field label="Description">
        <textarea
          className={textareaCls}
          rows={3}
          value={form.description}
          onChange={e => f('description', e.target.value)}
        />
      </Field>
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-linkedin-border">
        {onDelete ? (
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 text-red-500 text-sm hover:text-red-700 cursor-pointer"
          >
            <Ico d={icons.trash} size={14} />
            Delete
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={() => {
            onSave(form)
            onClose()
          }}
          className="px-6 py-2 bg-linkedin text-white text-sm font-semibold rounded-full hover:bg-[#004182] cursor-pointer"
        >
          Save
        </button>
      </div>
    </Modal>
  )
}
