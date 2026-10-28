// Blog 长文数据（纯前端 mock），分类由发布者在发布时选择。
// BLOG_CATEGORIES 与 Blog 页顶部导航一致；BLOG_POSTS 是种子文章。

export const BLOG_CATEGORIES = [
  'University Rankings',
  'A-Level Guide',
  'Personal Statement',
  'Major Profiles',
  'Scholarships',
  'Interview Prep',
  'Student Life',
  'US Applications',
  'UK Applications',
  'Canada & Australia',
  'Extracurriculars',
  'Graduate School',
  'Gap Year',
] as const
export type BlogCategory = (typeof BLOG_CATEGORIES)[number]

export interface BlogPost {
  id: string
  title: string
  category: BlogCategory
  readTime: string
  img: string
  excerpt?: string
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'b1',
    title:
      "Oxbridge applications reach record-high competition—here's what the data actually reveals",
    category: 'UK Applications',
    readTime: '6 min read',
    img: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=240&fit=crop&auto=format',
  },
  {
    id: 'b2',
    title: 'UCAS Clearing 2026: a step-by-step guide to securing your place',
    category: 'UK Applications',
    readTime: '6 min read',
    img: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?w=400&h=240&fit=crop&auto=format',
  },
  {
    id: 'b3',
    title: 'Imperial College London: is it the right fit for you?',
    category: 'UK Applications',
    readTime: '5 min read',
    img: 'https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=400&h=240&fit=crop&auto=format',
  },
  {
    id: 'b4',
    title: 'The Common App essay pitfall that derails otherwise strong applications',
    category: 'US Applications',
    readTime: '7 min read',
    img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=240&fit=crop&auto=format',
  },
  {
    id: 'b5',
    title: 'Financial aid for international students at US universities, fully explained',
    category: 'US Applications',
    readTime: '7 min read',
    img: 'https://images.unsplash.com/photo-1659080925666-16001612bc3e?w=400&h=240&fit=crop&auto=format',
  },
  {
    id: 'b6',
    title: 'NYU vs Boston University: which fits your ambitions?',
    category: 'US Applications',
    readTime: '6 min read',
    img: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?w=400&h=240&fit=crop&auto=format',
  },
  {
    id: 'b7',
    title: "Maths vs Further Maths: the strategic choice top applicants don't discuss openly",
    category: 'A-Level Guide',
    readTime: '5 min read',
    img: 'https://images.unsplash.com/photo-1635372722656-389f87a941b7?w=400&h=240&fit=crop&auto=format',
  },
  {
    id: 'b8',
    title: 'The A-Level combinations that unlock the most competitive degree programmes',
    category: 'A-Level Guide',
    readTime: '5 min read',
    img: 'https://images.unsplash.com/photo-1741699428220-65f37f3fbbcb?w=400&h=240&fit=crop&auto=format',
  },
  {
    id: 'b9',
    title: 'Why your opening paragraph determines everything—and how to fix yours',
    category: 'Personal Statement',
    readTime: '4 min read',
    img: 'https://images.unsplash.com/photo-1631557777232-a2632ae3c67d?w=400&h=240&fit=crop&auto=format',
  },
  {
    id: 'b10',
    title: 'The five clichés that appear in 80% of rejected personal statements',
    category: 'Personal Statement',
    readTime: '5 min read',
    img: 'https://images.unsplash.com/photo-1585832770485-e68a5dbfad52?w=400&h=240&fit=crop&auto=format',
  },
  {
    id: 'b11',
    title: 'What studying Economics at Cambridge actually looks like, week by week',
    category: 'Major Profiles',
    readTime: '6 min read',
    img: 'https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=400&h=240&fit=crop&auto=format',
  },
  {
    id: 'b12',
    title: 'Computer Science vs Data Science: which degree gets you hired faster in 2026',
    category: 'Major Profiles',
    readTime: '6 min read',
    img: 'https://images.unsplash.com/photo-1674027444485-cec3da58eef4?w=400&h=240&fit=crop&auto=format',
  },
  {
    id: 'b13',
    title:
      'Rhodes Scholarship 2027: eligibility, timeline and how to build a competitive application',
    category: 'Scholarships',
    readTime: '6 min read',
    img: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=240&fit=crop&auto=format',
  },
  {
    id: 'b14',
    title: 'The full-ride scholarships most international students overlook entirely',
    category: 'Scholarships',
    readTime: '8 min read',
    img: 'https://images.unsplash.com/photo-1659080925666-16001612bc3e?w=400&h=240&fit=crop&auto=format',
  },
  {
    id: 'b15',
    title: 'Merit scholarships at US liberal arts colleges: a complete guide for 2027 applicants',
    category: 'Scholarships',
    readTime: '4 min read',
    img: 'https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=400&h=240&fit=crop&auto=format',
  },
  {
    id: 'b16',
    title: 'How to nail your Oxford interview: expert tips from a tutor',
    category: 'Interview Prep',
    readTime: '8 min read',
    img: 'https://images.unsplash.com/photo-1696395050055-eb7a315bb1cb?w=400&h=240&fit=crop&auto=format',
  },
  {
    id: 'b17',
    title: "A day in the life at UCL—an international student's vlog",
    category: 'Student Life',
    readTime: '6 min read',
    img: 'https://images.unsplash.com/photo-1720659201108-4efe526b289c?w=400&h=240&fit=crop&auto=format',
  },
  {
    id: 'b18',
    title: 'From Shanghai to Stanford: my first year as an international student',
    category: 'Student Life',
    readTime: '5 min read',
    img: 'https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=400&h=240&fit=crop&auto=format',
  },
  {
    id: 'b19',
    title: 'Why more students are choosing Canadian universities over the UK and US',
    category: 'Canada & Australia',
    readTime: '4 min read',
    img: 'https://images.unsplash.com/photo-1773396059530-62e786d78a50?w=400&h=240&fit=crop&auto=format',
  },
  {
    id: 'b20',
    title: 'Gap year or go straight to university? The honest truth',
    category: 'Gap Year',
    readTime: '7 min read',
    img: 'https://images.unsplash.com/photo-1741699428220-65f37f3fbbcb?w=400&h=240&fit=crop&auto=format',
  },
  {
    id: 'b21',
    title: 'Top 10 universities for Economics, ranked by graduate outcomes',
    category: 'University Rankings',
    readTime: '5 min read',
    img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=240&fit=crop&auto=format',
  },
  {
    id: 'b22',
    title: 'Extracurriculars that actually strengthen your application',
    category: 'Extracurriculars',
    readTime: '5 min read',
    img: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=240&fit=crop&auto=format',
  },
  {
    id: 'b23',
    title: 'Graduate school applications: what changes from undergrad',
    category: 'Graduate School',
    readTime: '6 min read',
    img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=240&fit=crop&auto=format',
  },
]
