import { createClient } from '@/lib/supabase/server'
import PostsTable from './_components/PostsTable'
import AddPostButton from './_components/AddPostButton'

export default async function PostsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: posts }, { data: channels }] = await Promise.all([
    supabase
      .from('posts')
      .select('*, channels(id, name, type)')
      .eq('user_id', user!.id)
      .order('published_at', { ascending: false }),
    supabase
      .from('channels')
      .select('*')
      .eq('user_id', user!.id)
      .order('name'),
  ])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{posts?.length ?? 0} bài đăng</p>
        </div>
        <AddPostButton channels={channels ?? []} />
      </div>

      <PostsTable posts={posts ?? []} channels={channels ?? []} />
    </div>
  )
}
