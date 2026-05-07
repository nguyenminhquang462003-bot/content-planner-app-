const typeColor: Record<string, string> = {
  fanpage:  'bg-blue-100 text-blue-700',
  group:    'bg-purple-100 text-purple-700',
  substack: 'bg-orange-100 text-orange-700',
}

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toString()
}

interface ChannelStat {
  id: string
  name: string
  type: string
  totalPosts: number
  totalViews: number
  totalEngagement: number
  avgViews: number
  avgEngagement: number
  engagementRate: string
}

export default function ChannelComparisonTable({ channels }: { channels: ChannelStat[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">So sánh hiệu quả từng kênh</h3>
      <p className="text-xs text-gray-400 mb-4">Tổng hợp chỉ số trung bình mỗi bài đăng theo kênh</p>
      {channels.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">Chưa có kênh nào.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-medium text-gray-600">Kênh</th>
              <th className="text-right py-2 font-medium text-gray-600">Bài đăng</th>
              <th className="text-right py-2 font-medium text-gray-600">Tổng views</th>
              <th className="text-right py-2 font-medium text-gray-600">TB views/bài</th>
              <th className="text-right py-2 font-medium text-gray-600">Tổng tương tác</th>
              <th className="text-right py-2 font-medium text-gray-600">TB tương tác/bài</th>
              <th className="text-right py-2 font-medium text-gray-600">Engagement rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {channels.map(ch => (
              <tr key={ch.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor[ch.type] ?? 'bg-gray-100 text-gray-600'}`}>
                      {ch.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 text-right text-gray-700">{ch.totalPosts}</td>
                <td className="py-3 text-right text-gray-700">{formatNumber(ch.totalViews)}</td>
                <td className="py-3 text-right font-medium text-gray-900">{formatNumber(ch.avgViews)}</td>
                <td className="py-3 text-right text-gray-700">{formatNumber(ch.totalEngagement)}</td>
                <td className="py-3 text-right font-medium text-gray-900">{formatNumber(ch.avgEngagement)}</td>
                <td className="py-3 text-right">
                  <span className={`font-semibold ${parseFloat(ch.engagementRate) > 3 ? 'text-green-600' : 'text-gray-700'}`}>
                    {ch.engagementRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
