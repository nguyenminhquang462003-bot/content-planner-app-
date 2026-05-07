'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const channelTypeLabels: Record<string, string> = {
  fanpage: 'Facebook Fanpage',
  group: 'Facebook Group',
  substack: 'Substack',
}

export default function AddChannelForm() {
  const router = useRouter()
  const [type, setType] = useState('fanpage')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const payload: Record<string, string | null> = {
      user_id: user!.id,
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      fb_page_id: (formData.get('fb_page_id') as string) || null,
      fb_access_token: (formData.get('fb_access_token') as string) || null,
    }

    const { error: dbError } = await supabase.from('channels').insert(payload)

    if (dbError) {
      setError('Không thể thêm kênh. Thử lại nhé.')
      setLoading(false)
      return
    }

    form.reset()
    setType('fanpage')
    router.refresh()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Loại kênh</label>
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="fanpage">Facebook Fanpage</option>
            <option value="group">Facebook Group</option>
            <option value="substack">Substack</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên kênh</label>
          <input
            name="name"
            required
            placeholder={`VD: ${channelTypeLabels[type]} của tôi`}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {type === 'fanpage' && (
        <div className="space-y-4 pt-1">
          <div className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
            Fanpage sẽ được đồng bộ tự động qua Facebook Graph API. Cần có Page ID và Access Token.
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Page ID</label>
              <input
                name="fb_page_id"
                placeholder="VD: 123456789"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
              <input
                name="fb_access_token"
                type="password"
                placeholder="Page Access Token"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Đang thêm...' : 'Thêm kênh'}
      </button>
    </form>
  )
}
