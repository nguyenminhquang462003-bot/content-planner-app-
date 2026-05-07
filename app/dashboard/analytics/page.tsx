import { createClient } from '@/lib/supabase/server'
import ContentTypePieChart from './_components/ContentTypePieChart'
import ChannelComparisonTable from './_components/ChannelComparisonTable'
import TopPostsDetail from './_components/TopPostsDetail'
import EngagementBreakdown from './_components/EngagementBreakdown'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: posts }, { data: channels }] = await Promise.all([
    supabase
      .from('posts')
      .select('*, channels(id, name, type)')
      .eq('user_id', user!.id)
      .eq('status', 'published'),
    supabase
      .from('channels')
      .select('*')
      .eq('user_id', user!.id),
  ])

  const allPosts = posts ?? []
  const allChannels = channels ?? []

  // Phân bổ loại nội dung
  const contentTypeCount: Record<string, number> = {}
  for (const p of allPosts) {
    const t = p.content_type ?? 'text'
    contentTypeCount[t] = (contentTypeCount[t] ?? 0) + 1
  }
  const contentTypeData = Object.entries(contentTypeCount).map(([type, count]) => ({ type, count }))

  // So sánh kênh
  const channelStats = allChannels.map(ch => {
    const chPosts = allPosts.filter(p => p.channel_id === ch.id)
    const totalEngagement = chPosts.reduce((s, p) => s + (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0), 0)
    const totalViews = chPosts.reduce((s, p) => s + (p.views ?? 0), 0)
    const count = chPosts.length
    return {
      id: ch.id,
      name: ch.name,
      type: ch.type,
      totalPosts: count,
      totalViews,
      totalEngagement,
      avgViews: count > 0 ? Math.round(totalViews / count) : 0,
      avgEngagement: count > 0 ? Math.round(totalEngagement / count) : 0,
      engagementRate: totalViews > 0 ? ((totalEngagement / totalViews) * 100).toFixed(1) : '0.0',
    }
  })

  // Top 10 bài đăng chi tiết
  const topPosts = [...allPosts]
    .sort((a, b) => {
      const engA = (a.likes ?? 0) + (a.comments ?? 0) + (a.shares ?? 0)
      const engB = (b.likes ?? 0) + (b.comments ?? 0) + (b.shares ?? 0)
      return engB - engA
    })
    .slice(0, 10)

  // Breakdown tương tác tổng (likes vs comments vs shares)
  const totalLikes = allPosts.reduce((s, p) => s + (p.likes ?? 0), 0)
  const totalComments = allPosts.reduce((s, p) => s + (p.comments ?? 0), 0)
  const totalShares = allPosts.reduce((s, p) => s + (p.shares ?? 0), 0)
  const engagementBreakdown = [
    { name: 'Likes', value: totalLikes, color: '#3b82f6' },
    { name: 'Comments', value: totalComments, color: '#f43f5e' },
    { name: 'Shares', value: totalShares, color: '#8b5cf6' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentTypePieChart data={contentTypeData} />
        <EngagementBreakdown data={engagementBreakdown} />
      </div>

      <ChannelComparisonTable channels={channelStats} />

      <TopPostsDetail posts={topPosts} />
    </div>
  )
}
