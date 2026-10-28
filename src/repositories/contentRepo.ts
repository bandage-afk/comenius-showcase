/**
 * 课程内容：Blog 长文与 Podcast 分类（现在 = 本地 mock；接后端/CMS = `GET /blog`、`GET /podcast`）。
 *
 * 页面不许 import 这个文件：内容通过 `useContent` 拿。
 * 为什么单开一个 store 而不是塞进社区 store：这是「课程」资源，与社区/私信无关。
 */

import { BLOG_CATEGORIES, BLOG_POSTS, type BlogCategory, type BlogPost } from '../blogData'
import {
  EPISODES,
  PODCAST_CATEGORIES,
  type PodcastCategory,
  type PodcastEpisode,
} from '../podcastData'

export function listBlogPosts(): BlogPost[] {
  return BLOG_POSTS
}

export function blogCategories(): readonly BlogCategory[] {
  return BLOG_CATEGORIES
}

export function podcastCategories(): readonly PodcastCategory[] {
  return PODCAST_CATEGORIES
}

export function listPodcastEpisodes(): PodcastEpisode[] {
  return EPISODES
}
