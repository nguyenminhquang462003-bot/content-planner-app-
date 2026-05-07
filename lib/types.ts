export type ChannelType = 'fanpage' | 'group' | 'substack'
export type ContentType = 'video' | 'image' | 'text' | 'article'
export type PostStatus = 'draft' | 'scheduled' | 'published'
export type PipelineStage = 'idea' | 'draft' | 'review' | 'scheduled' | 'published'

export interface Channel {
  id: string
  user_id: string
  name: string
  type: ChannelType
  fb_page_id: string | null
  fb_access_token: string | null
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  channel_id: string
  title: string | null
  content_type: ContentType | null
  published_at: string | null
  views: number
  likes: number
  comments: number
  shares: number
  reach: number
  status: PostStatus
  external_id: string | null
  url: string | null
  created_at: string
  channels?: Channel
}

export interface PipelineItem {
  id: string
  user_id: string
  channel_id: string | null
  title: string
  description: string | null
  stage: PipelineStage
  planned_date: string | null
  content_type: ContentType | null
  created_at: string
  channels?: Channel
}
