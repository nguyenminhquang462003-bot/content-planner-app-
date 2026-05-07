'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { createClient } from '@/lib/supabase/client'
import type { PipelineItem, Channel, PipelineStage } from '@/lib/types'
import AddItemModal from './AddItemModal'

const STAGES: { id: PipelineStage; label: string; color: string; bg: string }[] = [
  { id: 'idea',      label: 'Ý tưởng',    color: 'text-gray-600',  bg: 'bg-gray-100' },
  { id: 'draft',     label: 'Bản nháp',   color: 'text-yellow-700', bg: 'bg-yellow-50' },
  { id: 'review',    label: 'Chờ duyệt',  color: 'text-blue-700',   bg: 'bg-blue-50' },
  { id: 'scheduled', label: 'Lên lịch',   color: 'text-purple-700', bg: 'bg-purple-50' },
  { id: 'published', label: 'Đã đăng',    color: 'text-green-700',  bg: 'bg-green-50' },
]

const channelTypeColor: Record<string, string> = {
  fanpage:  'bg-blue-100 text-blue-600',
  group:    'bg-purple-100 text-purple-600',
  substack: 'bg-orange-100 text-orange-600',
}

const contentTypeLabel: Record<string, string> = {
  video: '🎥', image: '🖼️', text: '📝', article: '📄',
}

interface Props {
  initialItems: PipelineItem[]
  channels: Channel[]
  userId: string
}

export default function KanbanBoard({ initialItems, channels, userId }: Props) {
  const [items, setItems] = useState<PipelineItem[]>(initialItems)
  const [addStage, setAddStage] = useState<PipelineStage | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId) return

    const newStage = destination.droppableId as PipelineStage

    setItems(prev =>
      prev.map(item => item.id === draggableId ? { ...item, stage: newStage } : item)
    )

    const supabase = createClient()
    await supabase.from('pipeline_items').update({ stage: newStage }).eq('id', draggableId)
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa item này?')) return
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('pipeline_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
    setDeletingId(null)
  }

  function handleAdded(newItem: PipelineItem) {
    setItems(prev => [...prev, newItem])
    setAddStage(null)
  }

  const itemsByStage = (stage: PipelineStage) => items.filter(i => i.stage === stage)

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-10rem)]">
        <DragDropContext onDragEnd={onDragEnd}>
          {STAGES.map(stage => {
            const stageItems = itemsByStage(stage.id)
            return (
              <div key={stage.id} className="flex flex-col w-64 shrink-0">
                {/* Header cột */}
                <div className={`flex items-center justify-between px-3 py-2 rounded-t-xl border border-b-0 border-gray-200 ${stage.bg}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${stage.color}`}>{stage.label}</span>
                    <span className="text-xs text-gray-400 bg-white rounded-full px-1.5 py-0.5 border border-gray-200">
                      {stageItems.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setAddStage(stage.id)}
                    className="text-gray-400 hover:text-gray-700 text-lg leading-none transition-colors"
                    title="Thêm item"
                  >+</button>
                </div>

                {/* Droppable zone */}
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 border border-gray-200 rounded-b-xl p-2 space-y-2 min-h-40 transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'}`}
                    >
                      {stageItems.map((item, index) => {
                        const channel = item.channels as { name: string; type: string } | undefined
                        return (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white rounded-lg border p-3 space-y-2 cursor-grab active:cursor-grabbing transition-shadow ${snapshot.isDragging ? 'shadow-lg border-blue-300' : 'border-gray-200 hover:shadow-sm'}`}
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <p className="text-sm font-medium text-gray-900 leading-snug">{item.title}</p>
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    disabled={deletingId === item.id}
                                    className="text-gray-300 hover:text-red-400 text-sm shrink-0 transition-colors"
                                  >×</button>
                                </div>

                                {item.description && (
                                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{item.description}</p>
                                )}

                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {item.content_type && (
                                    <span className="text-xs">{contentTypeLabel[item.content_type]}</span>
                                  )}
                                  {channel && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${channelTypeColor[channel.type] ?? 'bg-gray-100 text-gray-600'}`}>
                                      {channel.name}
                                    </span>
                                  )}
                                  {item.planned_date && (
                                    <span className="text-xs text-gray-400">
                                      {new Date(item.planned_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}

                      {stageItems.length === 0 && !snapshot.isDraggingOver && (
                        <button
                          onClick={() => setAddStage(stage.id)}
                          className="w-full py-3 text-xs text-gray-400 hover:text-gray-600 border border-dashed border-gray-300 rounded-lg transition-colors"
                        >
                          + Thêm ý tưởng
                        </button>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </DragDropContext>
      </div>

      {addStage && (
        <AddItemModal
          defaultStage={addStage}
          channels={channels}
          userId={userId}
          onAdded={handleAdded}
          onClose={() => setAddStage(null)}
        />
      )}
    </>
  )
}
