'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Post, Channel } from '@/lib/types'
import EditPostModal from './EditPostModal'

const typeLabels: Record<string, { label: string; color: string }> = {
  fanpage:  { label: 'Fanpage', color: 'bg-blue-100 text-blue-700' },
  group:    { label: 'Group',   color: 'bg-purple-100 text-purple-700' },
  substack: { label: 'Substack',color: 'bg-orange-100 text-orange-700' },
}

const contentTypeLabels: Record<string, string> = {
  video: 'Video', image: 'Hình ảnh', text: 'Văn bản', article: 'Bài viết',
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toString()
}

interface Props {
  posts: Post[]
  channels: Channel[]
}

export default function PostsTable({ posts, channels }: Props) {
  const router = useRouter()
  const [editingPost, setEditingPost] = useState<Post | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Xóa bài đăng này?')) return
    const supabase = createClient()
    await supabase.from('posts').delete().eq('id', id)
    router.refresh()
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
        <p className="text-sm text-gray-400">Chưa có bài đăng nào. Nhấn "Thêm bài" để bắt đầu!</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tiêu đề</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kênh</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Loại</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Ngày đăng</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Views</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Likes</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Comments</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Shares</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.map((post) => {
              const channel = post.channels as { name: string; type: string } | undefined
              const channelMeta = channel ? typeLabels[channel.type] : null
              return (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 max-w-xs">
                    <p className="font-medium text-gray-900 truncate">{post.title || '(Không có tiêu đề)'}</p>
                    {post.url && (
                      <a href={post.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline truncate block">
                        Xem bài →
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {channel && channelMeta ? (
                      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${channelMeta.color}`}>
                        {channel.name}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {post.content_type ? contentTypeLabels[post.content_type] : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(post.published_at)}</td>
                  <td className="px-4 py-3 text-right text-gray-800 font-medium">{formatNumber(post.views)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatNumber(post.likes)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatNumber(post.comments)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatNumber(post.shares)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setEditingPost(post)}
                        className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editingPost && (
        <EditPostModal
          post={editingPost}
          channels={channels}
          onClose={() => setEditingPost(null)}
        />
      )}
    </>
  )
}
