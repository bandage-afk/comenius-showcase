import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { storage } from './repositories/localStore'
import {
  defaultCertifications,
  defaultEducation,
  defaultExperiences,
  defaultLanguages,
  defaultProjects,
  defaultSkills,
  defaultVolunteer,
  type Certification,
  type Education,
  type Experience,
  type Language,
  type Project,
  type Skill,
  type Volunteer,
} from './profile/career'

export interface Academic {
  system: 'A-Level' | 'AP' | 'IB'
  grades: { subject: string; grade: string }[]
  comps: { name: string; award: string; time: string }[]
  activities: { name: string; role: string; desc: string }[]
}

/** 账号角色：决定左侧栏看到哪套导航（教师端只给 teacher 看） */
export type Role = 'student' | 'teacher' | 'parent'

export interface ProfileData {
  /* ── 身份：社区面与职业面共用这一份（见 ADR-0007）───────────── */
  /** 账号角色（学生 / 老师 / 家长）。默认学生；改它会让左侧栏切换成对应导航 */
  role: Role
  name: string
  comeniusId: string
  /** 简介 / 职业面的「关于」 */
  bio: string
  /** 背景图 / 职业面的封面图 */
  bg: string
  gender: string
  birthday: string
  /** 所在地区 / 职业面的所在地 */
  region: string
  occupation: string
  school: string
  /** 头像 */
  avatarUrl: string
  /* ── 职业面（来自 tutor 的领英档案）────────────────────────── */
  headline: string
  website: string
  email: string
  phone: string
  pronouns: string
  openToWork: boolean
  openToWorkRoles: string
  premium: boolean
  /* ── 社区面 ─────────────────────────────────────────────────── */
  academic: Academic
  stickers: StickerItem[]
  /* ── 职业档案条目（「我的 → 职业」里编辑）──────────────────── */
  experiences: Experience[]
  education: Education[]
  skills: Skill[]
  certifications: Certification[]
  volunteer: Volunteer[]
  languages: Language[]
  projects: Project[]
}

/** 贴纸：内置 emoji 或用户上传（自动抠图后）的图片 */
export type StickerItem =
  { kind: 'emoji'; code: string } | { kind: 'upload'; url: string; name: string }

export const DEFAULT_PROFILE: ProfileData = {
  role: 'student',
  name: 'Champion',
  comeniusId: '4147855638',
  bio: '',
  bg: 'photo-1517483000871-1dbf64a6e1c6',
  gender: '保密',
  birthday: '',
  region: '上海',
  occupation: '学生',
  school: '上海某国际学校',
  avatarUrl: 'photo-1508804185872-d7badad00f7d',
  headline: 'A-Level 数学 / STEP 教师 · 国际课程备考',
  website: '',
  email: '',
  phone: '',
  pronouns: '',
  openToWork: false,
  openToWorkRoles: '',
  premium: false,
  academic: {
    system: 'A-Level',
    grades: [{ subject: '数学', grade: 'A*' }],
    comps: [{ name: '', award: '', time: '' }],
    activities: [{ name: '', role: '', desc: '' }],
  },
  stickers: [],
  experiences: defaultExperiences,
  education: defaultEducation,
  skills: defaultSkills,
  certifications: defaultCertifications,
  volunteer: defaultVolunteer,
  languages: defaultLanguages,
  projects: defaultProjects,
}

interface ProfileState {
  profile: ProfileData
  /** 整份替换（改资料弹窗用） */
  save: (d: ProfileData) => void
  /** 局部更新（职业档案里逐个条目增删改用） */
  patch: (p: Partial<ProfileData>) => void
}

/**
 * 个人资料：社区面（笔记/学习档案/贴纸）与职业面（经历/学历/技能/证书…）是同一份数据，
 * 只是「我的」页里两套展示。以前 tutor 那份是组件内 useState，刷新就丢；现在统一持久化。
 */
export const useProfile = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      save: profile => set({ profile }),
      patch: p => set({ profile: { ...get().profile, ...p } }),
    }),
    {
      name: 'comenius_profile',
      version: 1,
      // 落盘走 repositories/localStore（全仓唯一碰 localStorage 的地方，见 ADR-0006）
      storage: createJSONStorage(() => storage),
      // 老版本没有职业面字段（headline / experiences…），这里用默认值补齐，
      // 否则读出来是 undefined，职业视图会直接崩。
      migrate: (persisted: unknown, version: number) => {
        const p = (persisted ?? {}) as { profile?: Partial<ProfileData> }
        if (version >= 1) {
          return { profile: { ...DEFAULT_PROFILE, ...p.profile } }
        }
        return { profile: DEFAULT_PROFILE }
      },
    },
  ),
)
