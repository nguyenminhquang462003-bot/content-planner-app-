import { createClient } from '@/lib/supabase/server'
import ChannelList from './_components/ChannelList'
import AddChannelForm from './_components/AddChannelForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: channels } = await supabase
    .from('channels')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Thêm kênh mới</h2>
        <p className="text-sm text-gray-500 mb-4">Kết nối các kênh nội dung bạn muốn theo dõi.</p>
        <AddChannelForm />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Kênh đã kết nối</h2>
        <ChannelList channels={channels ?? []} />
      </div>
    </div>
  )
}
