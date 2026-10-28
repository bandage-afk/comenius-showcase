// 职业档案（原 tutor / 领英版式）的类型与默认值。
// 现在这份数据由 profileStore 持有并持久化，「我的」页的职业视图与教师模块共用。

export interface Experience {
  id: string
  company: string
  logo: string
  role: string
  type: string
  startMonth: string
  startYear: string
  endMonth: string
  endYear: string
  current: boolean
  location: string
  locationType: string
  description: string
  skills: string[]
}

export interface Education {
  id: string
  school: string
  logo: string
  degree: string
  field: string
  startYear: string
  endYear: string
  gpa: string
  activities: string
  description: string
}

export interface Skill {
  id: string
  name: string
  endorsements: number
  endorsed: boolean
  category: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: string
  expiryDate: string
  credentialId: string
  credentialUrl: string
  logo: string
}

export interface Volunteer {
  id: string
  organization: string
  role: string
  cause: string
  startYear: string
  endYear: string
  current: boolean
  description: string
}

export interface Language {
  id: string
  name: string
  proficiency: string
}

export interface Project {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  url: string
  associatedWith: string
}

export const defaultExperiences: Experience[] = [
  {
    id: '1',
    company: 'Comenius 国际课程中心',
    logo: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=48&h=48&fit=crop&auto=format',
    role: 'A-Level 数学 · STEP 主讲教师',
    type: '全职',
    startMonth: '9月',
    startYear: '2025',
    endMonth: '',
    endYear: '',
    current: true,
    location: '上海',
    locationType: '线上 + 线下',
    description:
      '负责 A-Level 数学（P1–P3 / FP1–FP2）与 STEP 专项课程。设计「B 到 A*」提分路径：先用真题定位知识断点，再用 6 周专题课补洞，最后两周走限时套卷。带的学生里 96% 在正式考试中拿到 A 或 A*。',
    skills: ['A-Level 数学', 'STEP', '课程设计', '真题研究'],
  },
  {
    id: '2',
    company: '上海某国际学校',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=48&h=48&fit=crop&auto=format',
    role: '数学助教 / 课后辅导',
    type: '兼职',
    startMonth: '3月',
    startYear: '2023',
    endMonth: '8月',
    endYear: '2025',
    current: false,
    location: '上海',
    locationType: '线下',
    description:
      '跟着数学组带 G2 与 AS 年级的课后辅导，负责错题归因和小测分析。把学生常错的 30 类题型整理成一份可检索的错题手册，后来被教研组沿用。',
    skills: ['课堂辅导', '错题归因', '学情分析'],
  },
  {
    id: '3',
    company: '数学竞赛与 STEP 训练营',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=48&h=48&fit=crop&auto=format',
    role: 'STEP II / III 集训教练',
    type: '项目制',
    startMonth: '6月',
    startYear: '2024',
    endMonth: '8月',
    endYear: '2025',
    current: false,
    location: '线上',
    locationType: '远程',
    description:
      '暑期集训营 STEP 模块主讲，负责 12 场专题课与 6 场模拟考讲评。学生 STEP II 最高拿到 S 等级，多人达到剑桥 conditional offer 中的 STEP 要求。',
    skills: ['STEP', 'MAT', '竞赛数学'],
  },
]

export const defaultEducation: Education[] = [
  {
    id: '1',
    school: '剑桥大学',
    logo: 'https://images.unsplash.com/photo-1562774053-701939374585?w=48&h=48&fit=crop&auto=format',
    degree: '本科在读',
    field: '数学',
    startYear: '2025',
    endYear: '',
    gpa: 'First-class',
    activities: '数学系本科导师制（Supervision）学生代表、学院数学社团负责人',
    description:
      '方向偏分析与离散数学。在读期间持续做 A-Level / STEP 教学，把大学里学到的证明思路反过来讲给中学阶段的学生。',
  },
  {
    id: '2',
    school: '上海某国际学校',
    logo: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=48&h=48&fit=crop&auto=format',
    degree: '高中',
    field: 'A-Level（数学 / 高数 / 物理）',
    startYear: '2022',
    endYear: '2024',
    gpa: 'A*A*A*A',
    activities: '数学社社长、校际数学竞赛队队长、STEP 学习小组发起人',
    description: 'A-Level 数学、高数、物理均为 A*；STEP II 拿到 S 等级，STEP III 拿到 1 等级。',
  },
]

export const defaultSkills: Skill[] = [
  { id: '1', name: 'A-Level 数学', endorsements: 87, endorsed: true, category: '教学' },
  { id: '2', name: 'STEP / MAT 专项', endorsements: 64, endorsed: true, category: '教学' },
  { id: '3', name: 'IB 数学 AA', endorsements: 41, endorsed: false, category: '教学' },
  { id: '4', name: '真题研究与命题分析', endorsements: 58, endorsed: true, category: '教研' },
  { id: '5', name: '课程设计', endorsements: 39, endorsed: false, category: '教研' },
  { id: '6', name: '双语授课', endorsements: 73, endorsed: true, category: '授课' },
  { id: '7', name: '学情诊断', endorsements: 36, endorsed: false, category: '教研' },
  { id: '8', name: '升学规划（数学方向）', endorsements: 45, endorsed: true, category: '升学' },
  { id: '9', name: '竞赛数学', endorsements: 52, endorsed: false, category: '教学' },
  { id: '10', name: '课后答疑与家校沟通', endorsements: 28, endorsed: false, category: '授课' },
]

export const defaultCertifications: Certification[] = [
  {
    id: '1',
    name: 'CAIE A-Level 数学 / 高数 A*',
    issuer: 'Cambridge Assessment International Education',
    issueDate: '2024 年 8 月',
    expiryDate: '',
    credentialId: 'CAIE-AL-2024-8891',
    credentialUrl: 'https://www.cambridgeinternational.org',
    logo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=48&h=48&fit=crop&auto=format',
  },
  {
    id: '2',
    name: 'STEP II 成绩 S 等级',
    issuer: 'OCR / Cambridge Assessment',
    issueDate: '2024 年 8 月',
    expiryDate: '',
    credentialId: 'STEP2-2024-S-0173',
    credentialUrl: 'https://www.ocr.org.uk',
    logo: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=48&h=48&fit=crop&auto=format',
  },
  {
    id: '3',
    name: '剑桥大学数学系录取',
    issuer: 'University of Cambridge',
    issueDate: '2025 年 1 月',
    expiryDate: '',
    credentialId: 'CAM-MATH-2025-4021',
    credentialUrl: 'https://www.cam.ac.uk',
    logo: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=48&h=48&fit=crop&auto=format',
  },
]

export const defaultVolunteer: Volunteer[] = [
  {
    id: '1',
    organization: 'Comenius 公益答疑',
    role: '数学答疑志愿者',
    cause: '教育公平',
    startYear: '2024',
    endYear: '',
    current: true,
    description: '每周开放两小时免费答疑，主要面向没有条件请家教的学生，累计答疑 300+ 人次。',
  },
]

export const defaultLanguages: Language[] = [
  { id: '1', name: '中文', proficiency: '母语' },
  { id: '2', name: 'English', proficiency: '专业工作水平（可全英文授课）' },
  { id: '3', name: '上海话', proficiency: '日常交流' },
]

export const defaultProjects: Project[] = [
  {
    id: '1',
    name: 'A-Level 数学「B 到 A*」提分体系',
    description:
      '把真题按知识点和失分原因双向标注，做成 6 周专题课路径，覆盖 P1–P3 / FP1–FP2。已用于 40+ 学员。',
    startDate: '2024 年 9 月',
    endDate: '',
    url: '',
    associatedWith: 'Comenius 国际课程中心',
  },
  {
    id: '2',
    name: 'STEP II 真题精讲 100 讲',
    description: '按题型拆解 STEP II 近十年真题，每讲包含思路起点、常见卡点与可迁移的证明套路。',
    startDate: '2025 年 3 月',
    endDate: '',
    url: '',
    associatedWith: '数学竞赛与 STEP 训练营',
  },
  {
    id: '3',
    name: '错题手册（30 类高频题型）',
    description: '把 G2 / AS 阶段学生最常错的 30 类题型做成可检索手册，含错因说明与同类变式。',
    startDate: '2023 年 10 月',
    endDate: '2024 年 6 月',
    url: '',
    associatedWith: '上海某国际学校',
  },
]
