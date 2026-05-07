import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

  const { channelId } = await request.json()

  const { data: channel } = await supabase
    .from('channels')
    .select('*')
    .eq('id', channelId)
    .eq('user_id', user.id)
    .single()

  if (!channel) return NextResponse.json({ error: 'Không tìm thấy kênh' }, { status: 404 })
  if (!channel.fb_page_id || !channel.fb_access_token) {
    return NextResponse.json({ error: 'Chưa có Page ID hoặc Access Token' }, { status: 400 })
  }

  // Lấy danh sách bài đăng từ Facebook Graph API
  const fields = 'id,message,created_time,likes.summary(true),comments.summary(true),shares,attachments{media_type}'
  const fbUrl = `https://graph.facebook.com/v19.0/${channel.fb_page_id}/posts?fields=${fields}&limit=50&access_token=${channel.fb_access_token}`

  const fbRes = await fetch(fbUrl)
  const fbData = await fbRes.json()

  if (fbData.error) {
    return NextResponse.json({ error: fbData.error.message }, { status: 400 })
  }

  const fbPosts: FbPost[] = fbData.data ?? []
  if (fbPosts.length === 0) {
    return NextResponse.json({ synced: 0 })
  }

  // Lấy các external_id đã tồn tại để tránh trùng lặp
  const externalIds = fbPosts.map(p => p.id)
  const { data: existing } = await supabase
    .from('posts')
    .select('external_id')
    .eq('channel_id', channelId)
    .in('external_id', externalIds)

  const existingIds = new Set((existing ?? []).map(r => r.external_id))

  const newPosts = fbPosts
    .filter(p => !existingIds.has(p.id))
    .map(p => {
      const mediaType = p.attachments?.data?.[0]?.media_type
      const contentType =
        mediaType === 'video' ? 'video' :
        mediaType === 'photo' ? 'image' : 'text'

      return {
        user_id: user.id,
        channel_id: channelId,
        title: p.message ? p.message.substring(0, 200) : null,
        content_type: contentType,
        published_at: p.created_time,
        likes: p.likes?.summary?.total_count ?? 0,
        comments: p.comments?.summary?.total_count ?? 0,
        shares: p.shares?.count ?? 0,
        views: 0,
        reach: 0,
        external_id: p.id,
        status: 'published' as const,
      }
    })

  if (newPosts.length > 0) {
    await supabase.from('posts').insert(newPosts)
  }

  return NextResponse.json({ synced: newPosts.length, total: fbPosts.length })
}

interface FbPost {
  id: string
  message?: string
  created_time: string
  likes?: { summary: { total_count: number } }
  comments?: { summary: { total_count: number } }
  shares?: { count: number }
  attachments?: { data: { media_type: string }[] }
}
