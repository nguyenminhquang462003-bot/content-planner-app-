'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Channel } from '@/lib/types'

const typeLabels: Record<string, { label: string; color: string }> = {
  fanpage:  { label: 'Facebook Fanpage', color: 'bg-blue-100 text-blue-700' },
  group:    { label: 'Facebook Group',   color: 'bg-purple-100 text-purple-700' },
  substack: { label: 'Substack',         color: 'bg-orange-100 text-orange-700' },
}

export default function ChannelList({ channels }: { channels: Channel[] }) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  async function handleDelete(id: string) {
    if (!confirm('Xóa kênh này? Tất cả bài đăng của kênh cũng sẽ bị xóa.')) return
    const supabase = createClient()
    await supabase.from('channels').delete().eq('id', id)
    router.refresh()
  }

  async function handleSaveToken(e: React.FormEvent<HTMLFormElement>, channelId: string) {
    e.preventDefault()
    setSaving(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    const supabase = createClient()
    await supabase.from('channels').update({
      fb_page_id: formData.get('fb_page_id') as string,
      fb_access_token: formData.get('fb_access_token') as string,
    }).eq('id', channelId)
    setSaving(false)
    setEditingId(null)
    router.refresh()
  }

  async function handleSync(channel: Channel) {
    setSyncStatus(s => ({ ...s, [channel.id]: 'loading' }))
    const res = await fetch('/api/facebook-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId: channel.id }),
    })
    const data = await res.json()
    if (!res.ok) {
      setSyncStatus(s => ({ ...s, [channel.id]: `Lỗi: ${data.error}` }))
    } else {
      setSyncStatus(s => ({ ...s, [channel.id]: `Đã đồng bộ ${data.synced} bài mới` }))
      router.refresh()
    }
  }

  if (channels.length === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center">
        <p className="text-sm text-gray-400">Chưa có kênh nào. Thêm kênh đầu tiên ở trên nhé!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {channels.map((channel) => {
        const meta = typeLabels[channel.type]
        const isEditing = editingId === channel.id
        const status = syncStatus[channel.id]
        const hasToken = channel.fb_page_id && channel.fb_access_token

        return (
          <div key={channel.id} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{channel.name}</p>
                  <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${meta.color}`}>
                    {meta.label}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {channel.type === 'fanpage' && (
                  <>
                    <button
                      onClick={() => setEditingId(isEditing ? null : channel.id)}
                      className="text-xs text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
                    >
                      {isEditing ? 'Đóng' : (hasToken ? 'Cập nhật token' : 'Thêm token')}
                    </button>
                    <button
                      onClick={() => handleSync(channel)}
                      disabled={!hasToken || status === 'loading'}
                      title={!hasToken ? 'Cần thêm Page ID và Access Token trước' : ''}
                      className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 rounded-lg px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {status === 'loading' ? 'Đang đồng bộ...' : 'Đồng bộ'}
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(channel.id)}
                  className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 rounded-lg px-3 py-1.5 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>

            {/* Kết quả đồng bộ */}
            {status && status !== 'loading' && (
              <p className={`text-xs px-3 py-2 rounded-lg ${status.startsWith('Lỗi') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                {status}
              </p>
            )}

            {/* Form cập nhật token */}
            {isEditing && channel.type === 'fanpage' && (
              <form onSubmit={(e) => handleSaveToken(e, channel.id)}
                className="border-t border-gray-100 pt-4 space-y-3">
                <p className="text-xs text-gray-500">
                  Lấy Page Access Token tại{' '}
                  <span className="font-medium text-gray-700">Meta for Developers → Graph API Explorer</span>.
                  Token cần quyền <span className="font-mono bg-gray-100 px-1 rounded">pages_read_engagement</span>.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Page ID</label>
                    <input name="fb_page_id" defaultValue={channel.fb_page_id ?? ''} required
                      placeholder="VD: 123456789"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Page Access Token</label>
                    <input name="fb_access_token" type="password" defaultValue={channel.fb_access_token ?? ''} required
                      placeholder="EAAxxxx..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <button type="submit" disabled={saving}
                  className="bg-blue-600 text-white rounded-lg px-4 py-2 text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </form>
            )}
          </div>
        )
      })}
    </div>
  )
}
