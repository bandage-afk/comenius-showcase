export interface NavItem {
  label: string
  href: string
  description?: string
}

export interface NavMenu {
  label: string
  items: NavItem[]
}

export interface Talk {
  id: string
  title: string
  author: string
  category: string
  categoryColor?: string
  duration: string
  plays?: string
  thumbnail: string
  href?: string
  videoUrl?: string
  description?: string
}

export interface FeaturedTalk {
  category: string
  title: string
  description: string
  author: string
  meta: string
  duration: string
  thumbnail: string
}

export interface TrendingCategory {
  id: string
  label: string
  color: string
  description: string
  talks: Talk[]
}

export interface Newsletter {
  id: string
  frequency: string
  title: string
  description: string
}
