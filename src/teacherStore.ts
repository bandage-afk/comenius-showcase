import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Course,
  Credential,
  Evidence,
  ReviewItem,
  EducationItem,
  ExperienceItem,
} from './teacherData'

export interface Lesson {
  id: string
  studentName: string
  courseTitle: string
  date: string // YYYY-MM-DD
  startTime: string // "19:00"
  endTime: string // "20:00"
  status: '待上' | '已完成' | '已取消'
}

export interface Student {
  id: string
  name: string
  course: string
  progress: string
  nextLesson?: string
}

export interface Order {
  id: string
  studentName: string
  courseTitle: string
  amount: number
  date: string
  status: '已支付'
}

export interface TeacherProfile {
  id: string
  name: string
  level: 1 | 2 | 3
  headline: string
  subjects: string[]
  tags: string[]
  intro: string
  rating: string
  reviews: number
  gradient: [string, string]
  education: EducationItem[]
  experience: ExperienceItem[]
  credentials: Credential[]
  evidence: Evidence[]
  reviewList: ReviewItem[]
  courses: Course[]
}

interface TeacherState {
  myProfile: TeacherProfile
  lessons: Lesson[]
  students: Student[]
  orders: Order[]
  updateProfile: (p: Partial<TeacherProfile>) => void
  addCourse: (c: Omit<Course, 'id'>) => void
  editCourse: (id: string, c: Partial<Course>) => void
  deleteCourse: (id: string) => void
  simulatePurchase: () => void
}

const DEFAULT_PROFILE: TeacherProfile = {
  id: 'me',
  name: '张老师',
  level: 2,
  headline: 'A-Level 数学 · 前国际学校教师',
  subjects: ['A-Level', '数学', 'STEP'],
  tags: ['A*率 92%', '10年教龄', '双语授课'],
  intro: '10 年国际课程教学经验，擅长把复杂的数学概念讲成直觉。',
  rating: '4.9',
  reviews: 156,
  gradient: ['var(--teacher-gradient-start)', 'var(--teacher-gradient-end)'],
  education: [{ school: '华东师范大学', degree: '本科', major: '数学教育', years: '2010–2014' }],
  experience: [{ role: '数学教师', org: '某国际学校 · 10 年', years: '2014 至今' }],
  credentials: [
    {
      title: '教师资格证',
      issuer: '教育部',
      year: '2014',
      image: 'photo-1564981797816-1043664bf78d',
    },
    {
      title: 'A-Level 数学培训认证',
      issuer: 'CAIE',
      year: '2016',
      image: 'photo-1434030216411-0b793f4b4173',
    },
  ],
  evidence: [
    { type: '聊天记录', caption: '学生家长反馈', image: 'photo-1512941937669-90a1b58e7e9c' },
  ],
  reviewList: [{ name: '刘同学', star: 5, text: '张老师讲得特别清楚，A* 上岸。', date: '2026-08' }],
  courses: [
    {
      id: 'me-c1',
      title: 'A-Level 数学 1对1',
      description: '针对 A-Level 数学的个性化辅导',
      price: 400,
      duration: '60 分钟',
    },
    {
      id: 'me-c2',
      title: 'STEP 冲刺班',
      description: 'STEP II/III 真题精讲',
      price: 500,
      duration: '90 分钟',
    },
  ],
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function todayPlus(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return fmtDate(d)
}

const DEFAULT_LESSONS: Lesson[] = [
  {
    id: 'l1',
    studentName: '刘同学',
    courseTitle: 'A-Level 数学 1对1',
    date: todayPlus(0),
    startTime: '19:00',
    endTime: '20:00',
    status: '待上',
  },
  {
    id: 'l2',
    studentName: '王同学',
    courseTitle: 'A-Level 数学 1对1',
    date: todayPlus(1),
    startTime: '18:00',
    endTime: '19:00',
    status: '待上',
  },
  {
    id: 'l3',
    studentName: '陈同学',
    courseTitle: 'STEP 冲刺班',
    date: todayPlus(2),
    startTime: '20:00',
    endTime: '21:00',
    status: '待上',
  },
  {
    id: 'l4',
    studentName: '赵同学',
    courseTitle: 'A-Level 数学 1对1',
    date: todayPlus(-2),
    startTime: '19:00',
    endTime: '20:00',
    status: '已完成',
  },
]

const DEFAULT_STUDENTS: Student[] = [
  {
    id: 's1',
    name: '刘同学',
    course: 'A-Level 数学 1对1',
    progress: '已完成 12/20 课时',
    nextLesson: '今天 19:00',
  },
  {
    id: 's2',
    name: '王同学',
    course: 'A-Level 数学 1对1',
    progress: '已完成 6/20 课时',
    nextLesson: '明天 18:00',
  },
  {
    id: 's3',
    name: '陈同学',
    course: 'STEP 冲刺班',
    progress: '已完成 3/10 课时',
    nextLesson: '后天 20:00',
  },
]

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'o1',
    studentName: '刘同学',
    courseTitle: 'A-Level 数学 1对1',
    amount: 8000,
    date: todayPlus(-3),
    status: '已支付',
  },
  {
    id: 'o2',
    studentName: '王同学',
    courseTitle: 'A-Level 数学 1对1',
    amount: 8000,
    date: todayPlus(-5),
    status: '已支付',
  },
  {
    id: 'o3',
    studentName: '陈同学',
    courseTitle: 'STEP 冲刺班',
    amount: 5000,
    date: todayPlus(-7),
    status: '已支付',
  },
]

export const useTeacher = create<TeacherState>()(
  persist(
    (set, get) => ({
      myProfile: DEFAULT_PROFILE,
      lessons: DEFAULT_LESSONS,
      students: DEFAULT_STUDENTS,
      orders: DEFAULT_ORDERS,

      updateProfile: p => set(s => ({ myProfile: { ...s.myProfile, ...p } })),

      addCourse: c =>
        set(s => ({
          myProfile: {
            ...s.myProfile,
            courses: [...s.myProfile.courses, { ...c, id: `me-c${Date.now()}` }],
          },
        })),

      editCourse: (id, c) =>
        set(s => ({
          myProfile: {
            ...s.myProfile,
            courses: s.myProfile.courses.map(x => (x.id === id ? { ...x, ...c } : x)),
          },
        })),

      deleteCourse: id =>
        set(s => ({
          myProfile: { ...s.myProfile, courses: s.myProfile.courses.filter(x => x.id !== id) },
        })),

      simulatePurchase: () =>
        set(s => {
          const pool = s.myProfile.courses
          if (pool.length === 0) return s
          const course = pool[get().lessons.length % pool.length]
          const names = ['新学生A', '新学生B', '新学生C']
          const studentName = names[get().lessons.length % names.length]
          const date = todayPlus(get().lessons.length + 1)
          const lesson: Lesson = {
            id: `l${Date.now()}`,
            studentName,
            courseTitle: course.title,
            date,
            startTime: '19:00',
            endTime: '20:00',
            status: '待上',
          }
          const student: Student = {
            id: `s${Date.now()}`,
            name: studentName,
            course: course.title,
            progress: '0 课时',
            nextLesson: `${date} 19:00`,
          }
          const order: Order = {
            id: `o${Date.now()}`,
            studentName,
            courseTitle: course.title,
            amount: course.price * 10,
            date: todayPlus(0),
            status: '已支付',
          }
          return {
            lessons: [...s.lessons, lesson],
            students: [...s.students, student],
            orders: [...s.orders, order],
          }
        }),
    }),
    {
      name: 'comenius_teacher',
      partialize: s => ({
        myProfile: s.myProfile,
        lessons: s.lessons,
        students: s.students,
        orders: s.orders,
      }),
    },
  ),
)
