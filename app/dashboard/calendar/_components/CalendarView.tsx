'use client'

import { useState } from 'react'
import type { Post } from '@/lib/types'

const CHANNEL_COLORS: Record<string, { dot: string; badge: string }> = {
  fanpage:  { dot: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-700' },
  group:    { dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700' },
  substack: { dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700' },
}

const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
const MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12']

const contentTypeLabel: Record<string, string> = {
  video: '🎥', image: '🖼️', text: '📝', article: '📄',
}

export default function CalendarView({ posts }: { posts: Post[] }) {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  // Map ngày → bài đăng
  const postsByDate: Record<string, Post[]> = {}
  for (const post of posts) {
    if (!post.published_at) continue
    const dateKey = post.published_at.substring(0, 10)
    if (!postsByDate[dateKey]) postsByDate[dateKey] = []
    postsByDate[dateKey].push(post)
  }

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
    setSelectedDay(null)
  }

  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
    setSelectedDay(null)
  }

  // Tính các ô trong tháng
  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Đủ 6 hàng
  while (cells.length % 7 !== 0) cells.push(null)

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const selectedPosts = selectedDay ? (postsByDate[selectedDay] ?? []) : []

  return (
    <div className="space-y-5">
      {/* Header điều hướng tháng */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <button onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-base font-semibold text-gray-900">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <button onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Header ngày trong tuần */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {DAYS_OF_WEEK.map(d => (
            <div key={d} className="py-2 text-center text-xs font-medium text-gray-500">{d}</div>
          ))}
        </div>

        {/* Lưới ngày */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} className="border-b border-r border-gray-100 h-24 bg-gray-50/50" />

            const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayPosts = postsByDate[dateKey] ?? []
            const isToday = dateKey === todayKey
            const isSelected = dateKey === selectedDay

            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(isSelected ? null : dateKey)}
                className={`border-b border-r border-gray-100 h-24 p-1.5 text-left transition-colors hover:bg-blue-50/50 ${isSelected ? 'bg-blue-50 ring-2 ring-inset ring-blue-400' : ''}`}
              >
                <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
                  {day}
                </div>

                <div className="space-y-0.5">
                  {dayPosts.slice(0, 2).map(post => {
                    const channel = post.channels as { type: string; name: string } | undefined
                    const color = CHANNEL_COLORS[channel?.type ?? '']?.dot ?? 'bg-gray-400'
                    return (
                      <div key={post.id} className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${color}`} />
                        <span className="text-xs text-gray-600 truncate leading-tight">
                          {post.title ?? '(Không tiêu đề)'}
                        </span>
                      </div>
                    )
                  })}
                  {dayPosts.length > 2 && (
                    <p className="text-xs text-gray-400">+{dayPosts.length - 2} bài</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(CHANNEL_COLORS).map(([type, { dot }]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
            <span className="text-xs text-gray-500 capitalize">
              {type === 'fanpage' ? 'Facebook Fanpage' : type === 'group' ? 'Facebook Group' : 'Substack'}
            </span>
          </div>
        ))}
      </div>

      {/* Panel bài đăng trong ngày được chọn */}
      {selectedDay && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Bài đăng ngày{' '}
            {new Date(selectedDay + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </h3>

          {selectedPosts.length === 0 ? (
            <p className="text-sm text-gray-400">Không có bài đăng nào trong ngày này.</p>
          ) : (
            <div className="space-y-3">
              {selectedPosts.map(post => {
                const channel = post.channels as { name: string; type: string } | undefined
                const badgeColor = CHANNEL_COLORS[channel?.type ?? '']?.badge ?? 'bg-gray-100 text-gray-600'
                const engagement = (post.likes ?? 0) + (post.comments ?? 0) + (post.shares ?? 0)
                return (
                  <div key={post.id} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                    <div className="text-lg">{post.content_type ? contentTypeLabel[post.content_type] : '📄'}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {post.title ?? '(Không có tiêu đề)'}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {channel && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>
                            {channel.name}
                          </span>
                        )}
                        {post.url && (
                          <a href={post.url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline">Xem bài →</a>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <p className="text-sm font-semibold text-gray-800">{post.views?.toLocaleString('vi-VN')} views</p>
                      <p className="text-xs text-gray-400">{engagement.toLocaleString('vi-VN')} tương tác</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
