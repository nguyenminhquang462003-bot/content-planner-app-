import { createClient } from '@/lib/supabase/server'
import KanbanBoard from './_components/KanbanBoard'

export default async function PipelinePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: items }, { data: channels }] = await Promise.all([
    supabase
      .from('pipeline_items')
      .select('*, channels(id, name, type)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('channels')
      .select('*')
      .eq('user_id', user!.id),
  ])

  return (
    <KanbanBoard
      initialItems={items ?? []}
      channels={channels ?? []}
      userId={user!.id}
    />
  )
}
