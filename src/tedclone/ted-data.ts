import type { NavMenu, Talk, FeaturedTalk, TrendingCategory, Newsletter } from './types'

/**
 * 空白内容数据：结构与原项目完全一致，所有文案与素材留空（先空着），
 * 由学校后续填入自己的演讲与图片。
 */

const BLANK = '\u00A0'

/** 中性灰色占位海报（无任何外部素材） */
const BLANK_POSTER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'><rect width='800' height='450' fill='#ECECEC'/><circle cx='400' cy='225' r='48' fill='#DADADA'/><path d='M389 202v46l38-23z' fill='#FFFFFF'/></svg>`,
  )

const emptyTalk = (id: string): Talk => ({
  id,
  title: BLANK,
  author: BLANK,
  category: BLANK,
  duration: '',
  plays: '',
  thumbnail: BLANK_POSTER,
  href: '#',
  description: '',
})

export const navMenus: NavMenu[] = [
  {
    label: 'WATCH',
    items: [
      { label: 'Latest episodes', description: '', href: '#' },
      { label: 'Playlists', description: '', href: '#' },
      { label: 'Series', description: '', href: '#' },
      { label: 'Lessons & Education', description: '', href: '#' },
      { label: 'Featured episodes', description: '', href: '#' },
      { label: 'Languages', description: '', href: '#' },
    ],
  },
  {
    label: 'DISCOVER',
    items: [
      { label: 'Topics', description: '', href: '#' },
      { label: 'Podcasts', description: '', href: '#' },
      { label: 'Ideas Blog', description: '', href: '#' },
      { label: 'Newsletters', description: '', href: '#' },
      { label: 'Games', description: '', href: '#' },
    ],
  },
  {
    label: 'ATTEND',
    items: [
      { label: 'Conferences', description: '', href: '#' },
      { label: 'Podcast Events', description: '', href: '#' },
      { label: 'Video Series', description: '', href: '#' },
      { label: 'Courses', description: '', href: '#' },
    ],
  },
  {
    label: 'PARTICIPATE',
    items: [
      { label: 'Nominate', description: '', href: '#' },
      { label: 'Organize a local TEDx Event', description: '', href: '#' },
      { label: 'Education', description: '', href: '#' },
      { label: 'Translate', description: '', href: '#' },
      { label: 'Community picks', description: '', href: '#' },
    ],
  },
  {
    label: 'ABOUT',
    items: [
      { label: 'Our Organization', description: '', href: '#' },
      { label: 'Conferences', description: '', href: '#' },
      { label: 'Programs & Initiatives', description: '', href: '#' },
      { label: 'Partner with TED', description: '', href: '#' },
      { label: 'TED Blog', description: '', href: '#' },
    ],
  },
]

export const discoverCategories = ['storytelling', 'energy', 'education', 'environment']

export const discoverTalks: FeaturedTalk[] = [
  {
    category: 'storytelling',
    title: BLANK,
    description: '',
    author: BLANK,
    meta: BLANK,
    duration: BLANK,
    thumbnail: BLANK_POSTER,
  },
  {
    category: 'storytelling',
    title: BLANK,
    description: '',
    author: BLANK,
    meta: BLANK,
    duration: BLANK,
    thumbnail: BLANK_POSTER,
  },
  {
    category: 'energy',
    title: BLANK,
    description: '',
    author: BLANK,
    meta: BLANK,
    duration: BLANK,
    thumbnail: BLANK_POSTER,
  },
  {
    category: 'energy',
    title: BLANK,
    description: '',
    author: BLANK,
    meta: BLANK,
    duration: BLANK,
    thumbnail: BLANK_POSTER,
  },
  {
    category: 'education',
    title: BLANK,
    description: '',
    author: BLANK,
    meta: BLANK,
    duration: BLANK,
    thumbnail: BLANK_POSTER,
  },
  {
    category: 'education',
    title: BLANK,
    description: '',
    author: BLANK,
    meta: BLANK,
    duration: BLANK,
    thumbnail: BLANK_POSTER,
  },
  {
    category: 'environment',
    title: BLANK,
    description: '',
    author: BLANK,
    meta: BLANK,
    duration: BLANK,
    thumbnail: BLANK_POSTER,
  },
  {
    category: 'environment',
    title: BLANK,
    description: '',
    author: BLANK,
    meta: BLANK,
    duration: BLANK,
    thumbnail: BLANK_POSTER,
  },
]

export const popularTalks: Talk[] = ['p1', 'p2', 'p3', 'p4'].map(emptyTalk)
export const newestTalks: Talk[] = ['n1', 'n2', 'n3', 'n4'].map(emptyTalk)
export const popularOnTedTalks: Talk[] = ['po1', 'po2', 'po3', 'po4'].map(emptyTalk)
export const countdownTalks: Talk[] = ['c1', 'c2', 'c3'].map(emptyTalk)
export const podcastTalks: Talk[] = ['pd1', 'pd2', 'pd3', 'pd4'].map(emptyTalk)

export const trendingCategories: TrendingCategory[] = [
  {
    id: 'trend-1',
    label: BLANK,
    color: '#0E7490',
    description: '',
    talks: ['t1', 't2', 't3', 't4'].map(emptyTalk),
  },
  {
    id: 'trend-2',
    label: BLANK,
    color: '#7C3AED',
    description: '',
    talks: ['t5', 't6', 't7'].map(emptyTalk),
  },
  {
    id: 'trend-3',
    label: BLANK,
    color: '#DC2626',
    description: '',
    talks: ['t8', 't9', 't10'].map(emptyTalk),
  },
]

export const newsletters: Newsletter[] = [
  { id: 'nl1', frequency: 'DAILY', title: BLANK, description: '' },
  { id: 'nl2', frequency: 'DAILY', title: BLANK, description: '' },
  { id: 'nl3', frequency: 'WEEKLY', title: BLANK, description: '' },
  { id: 'nl4', frequency: 'BIWEEKLY', title: BLANK, description: '' },
]

export const footerColumns = [
  {
    title: 'Explore',
    links: [
      'TEDx',
      'Community picks',
      'TED Ed',
      'TED Translators',
      'TED Institute',
      'The Audacious Project',
      'TED@Work',
      'Podcasts',
      'TED Blog',
      'More ways to get TED',
    ],
  },
  {
    title: 'Our community',
    links: ['TED Speakers', 'Community picks', 'TED Translators', 'Podcast hosts', 'TED Community'],
  },
]

export const footerLegal = [
  'TED Talks Usage Policy',
  'Privacy Policy',
  'Advertising / Partnership',
  'TED.com Terms of Use',
  'Jobs',
  'Press',
  'Help',
]
