import { createClient } from '@/lib/supabase/server'
import CalendarView from './_components/CalendarView'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: posts } = await supabase
    .from('posts')
    .select('*, channels(id, name, type)')
    .eq('user_id', user!.id)
    .eq('status', 'published')
    .not('published_at', 'is', null)

  return <CalendarView posts={posts ?? []} />
}
