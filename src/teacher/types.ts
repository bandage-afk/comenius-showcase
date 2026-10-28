export interface Post {
  id: string
  author: string
  authorRole: string
  authorAvatar: string
  content: string
  image?: string
  time: string
  likes: number
  comments: PostComment[]
  reposts: number
  liked: boolean
  reposted: boolean
}

export interface PostComment {
  id: string
  author: string
  avatar: string
  content: string
  time: string
  likes: number
}

export interface Connection {
  id: string
  name: string
  role: string
  avatar: string
  mutualConnections: number
  connected: boolean
  pending: boolean
}
