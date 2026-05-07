'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Channel, PipelineItem, PipelineStage } from '@/lib/types'

const STAGES: { id: PipelineStage; label: string }[] = [
  { id: 'idea',      label: 'Ý tưởng' },
  { id: 'draft',     label: 'Bản nháp' },
  { id: 'review',    label: 'Chờ duyệt' },
  { id: 'scheduled', label: 'Lên lịch' },
  { id: 'published', label: 'Đã đăng' },
]

interface Props {
  defaultStage: PipelineStage
  channels: Channel[]
  userId: string
  onAdded: (item: PipelineItem) => void
  onClose: () => void
}

export default function AddItemModal({ defaultStage, channels, userId, onAdded, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const payload = {
      user_id: userId,
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || null,
      stage: formData.get('stage') as PipelineStage,
      channel_id: (formData.get('channel_id') as string) || null,
      content_type: (formData.get('content_type') as string) || null,
      planned_date: (formData.get('planned_date') as string) || null,
    }

    const { data, error: dbError } = await supabase
      .from('pipeline_items')
      .insert(payload)
      .select('*, channels(id, name, type)')
      .single()

    if (dbError || !data) {
      setError('Không thể thêm. Thử lại nhé.')
      setLoading(false)
      return
    }

    onAdded(data as PipelineItem)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Thêm vào tuyến nội dung</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề <span className="text-red-500">*</span></label>
            <input name="title" required placeholder="VD: Video về tips marketing..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea name="description" rows={2} placeholder="Ghi chú thêm về nội dung này..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giai đoạn</label>
              <select name="stage" defaultValue={defaultStage}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kênh</label>
              <select name="channel_id"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Chưa chọn</option>
                {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại nội dung</label>
              <select name="content_type"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Chưa chọn</option>
                <option value="video">🎥 Video</option>
                <option value="image">🖼️ Hình ảnh</option>
                <option value="text">📝 Văn bản</option>
                <option value="article">📄 Bài viết</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày dự kiến</label>
              <input name="planned_date" type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
              Hủy
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {loading ? 'Đang thêm...' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
