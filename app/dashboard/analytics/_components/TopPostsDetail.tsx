import type { Post } from '@/lib/types'

const typeColor: Record<string, string> = {
  fanpage:  'bg-blue-100 text-blue-700',
  group:    'bg-purple-100 text-purple-700',
  substack: 'bg-orange-100 text-orange-700',
}

const contentTypeLabel: Record<string, string> = {
  video: 'Video', image: 'Hình ảnh', text: 'Văn bản', article: 'Bài viết',
}

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toString()
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function TopPostsDetail({ posts }: { posts: Post[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">Top 10 bài đăng hiệu quả nhất</h3>
      <p className="text-xs text-gray-400 mb-4">Xếp hạng theo tổng lượt tương tác (likes + comments + shares)</p>
      {posts.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">Chưa có bài đăng nào.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-medium text-gray-600 w-8">#</th>
              <th className="text-left py-2 font-medium text-gray-600">Bài đăng</th>
              <th className="text-left py-2 font-medium text-gray-600">Kênh</th>
              <th className="text-left py-2 font-medium text-gray-600">Loại</th>
              <th className="text-left py-2 font-medium text-gray-600">Ngày đăng</th>
              <th className="text-right py-2 font-medium text-gray-600">Views</th>
              <th className="text-right py-2 font-medium text-gray-600">Likes</th>
              <th className="text-right py-2 font-medium text-gray-600">Comments</th>
              <th className="text-right py-2 font-medium text-gray-600">Shares</th>
              <th className="text-right py-2 font-medium text-gray-600">Tổng TT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.map((post, i) => {
              const channel = post.channels as { name: string; type: string } | undefined
              const engagement = (post.likes ?? 0) + (post.comments ?? 0) + (post.shares ?? 0)
              return (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 font-bold text-gray-300">{i + 1}</td>
                  <td className="py-3 max-w-xs">
                    <p className="font-medium text-gray-900 truncate">{post.title || '(Không có tiêu đề)'}</p>
                    {post.url && (
                      <a href={post.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline">Xem →</a>
                    )}
                  </td>
                  <td className="py-3">
                    {channel && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor[channel.type] ?? 'bg-gray-100 text-gray-600'}`}>
                        {channel.name}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-gray-600 text-xs">
                    {post.content_type ? contentTypeLabel[post.content_type] : '—'}
                  </td>
                  <td className="py-3 text-gray-500 text-xs">{formatDate(post.published_at)}</td>
                  <td className="py-3 text-right text-gray-700">{formatNumber(post.views ?? 0)}</td>
                  <td className="py-3 text-right text-gray-700">{formatNumber(post.likes ?? 0)}</td>
                  <td className="py-3 text-right text-gray-700">{formatNumber(post.comments ?? 0)}</td>
                  <td className="py-3 text-right text-gray-700">{formatNumber(post.shares ?? 0)}</td>
                  <td className="py-3 text-right font-semibold text-rose-600">{formatNumber(engagement)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
