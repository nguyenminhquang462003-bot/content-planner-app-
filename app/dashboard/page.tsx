import { createClient } from '@/lib/supabase/server'
import KpiCards from './_components/KpiCards'
import TrendChart from './_components/TrendChart'
import ChannelBarChart from './_components/ChannelBarChart'
import TopPosts from './_components/TopPosts'

export default async function DashboardPage() {
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

  // KPI
  const totalPosts = allPosts.length
  const totalViews = allPosts.reduce((s, p) => s + (p.views ?? 0), 0)
  const totalEngagement = allPosts.reduce((s, p) => s + (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0), 0)

  // Kênh hiệu quả nhất (nhiều engagement nhất)
  const engagementByChannel: Record<string, { name: string; value: number }> = {}
  for (const p of allPosts) {
    const ch = p.channels as { id: string; name: string } | null
    if (!ch) continue
    if (!engagementByChannel[ch.id]) engagementByChannel[ch.id] = { name: ch.name, value: 0 }
    engagementByChannel[ch.id].value += (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0)
  }
  const bestChannel = Object.values(engagementByChannel).sort((a, b) => b.value - a.value)[0]

  // Dữ liệu biểu đồ xu hướng 30 ngày
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentPosts = allPosts.filter(p => p.published_at && new Date(p.published_at) >= thirtyDaysAgo)

  const trendMap: Record<string, { date: string; views: number; engagement: number }> = {}
  for (const p of recentPosts) {
    if (!p.published_at) continue
    const date = p.published_at.substring(0, 10)
    if (!trendMap[date]) trendMap[date] = { date, views: 0, engagement: 0 }
    trendMap[date].views += p.views ?? 0
    trendMap[date].engagement += (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0)
  }
  const trendData = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date))

  // Dữ liệu biểu đồ so sánh kênh
  const channelData = allChannels.map(ch => {
    const chPosts = allPosts.filter(p => p.channel_id === ch.id)
    return {
      name: ch.name,
      type: ch.type,
      posts: chPosts.length,
      views: chPosts.reduce((s, p) => s + (p.views ?? 0), 0),
      engagement: chPosts.reduce((s, p) => s + (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0), 0),
    }
  })

  // Top 5 bài đăng
  const topPosts = [...allPosts]
    .sort((a, b) => ((b.likes ?? 0) + (b.comments ?? 0) + (b.shares ?? 0)) - ((a.likes ?? 0) + (a.comments ?? 0) + (a.shares ?? 0)))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <KpiCards
        totalPosts={totalPosts}
        totalViews={totalViews}
        totalEngagement={totalEngagement}
        bestChannel={bestChannel?.name ?? '—'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart data={trendData} />
        <ChannelBarChart data={channelData} />
      </div>

      <TopPosts posts={topPosts} />
    </div>
  )
}
