import type { Post } from '@/lib/types'

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toString()
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const typeColor: Record<string, string> = {
  fanpage: 'bg-blue-100 text-blue-700',
  group: 'bg-purple-100 text-purple-700',
  substack: 'bg-orange-100 text-orange-700',
}

export default function TopPosts({ posts }: { posts: Post[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Top bài đăng hiệu quả nhất</h3>
      {posts.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">Chưa có bài đăng nào.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post, i) => {
            const channel = post.channels as { name: string; type: string } | undefined
            const engagement = (post.likes ?? 0) + (post.comments ?? 0) + (post.shares ?? 0)
            return (
              <div key={post.id} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
                <span className="text-lg font-bold text-gray-300 w-6 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {post.title || '(Không có tiêu đề)'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {channel && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[channel.type] ?? 'bg-gray-100 text-gray-600'}`}>
                        {channel.name}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{formatDate(post.published_at)}</span>
                  </div>
                </div>
                <div className="flex gap-4 text-right shrink-0">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{formatNumber(post.views ?? 0)}</p>
                    <p className="text-xs text-gray-400">views</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-rose-600">{formatNumber(engagement)}</p>
                    <p className="text-xs text-gray-400">tương tác</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
