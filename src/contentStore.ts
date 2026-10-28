import { create } from 'zustand'
import type { BlogCategory, BlogPost } from './blogData'
import type { PodcastCategory, PodcastEpisode } from './podcastData'
import * as contentRepo from './repositories/contentRepo'

interface ContentState {
  blogPosts: BlogPost[]
  blogCategories: readonly BlogCategory[]
  podcastCategories: readonly PodcastCategory[]
  podcastEpisodes: PodcastEpisode[]
}

/**
 * 课程内容（Blog 文章 + Podcast 分类与剧集）：只读、不持久化。
 *
 * 数据现在来自 repositories/contentRepo 的 mock；接 CMS/后端时改成在 store 里 fetch
 * 后写进这几个字段即可 —— BlogPage / PodcastPage / PublishPage 只认 `useContent`，页面零改动（ADR-0006）。
 */
export const useContent = create<ContentState>()(() => ({
  blogPosts: contentRepo.listBlogPosts(),
  blogCategories: contentRepo.blogCategories(),
  podcastCategories: contentRepo.podcastCategories(),
  podcastEpisodes: contentRepo.listPodcastEpisodes(),
}))
