'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const TYPE_META: Record<string, { label: string; color: string }> = {
  video:   { label: 'Video',     color: '#3b82f6' },
  image:   { label: 'Hình ảnh', color: '#10b981' },
  text:    { label: 'Văn bản',  color: '#f59e0b' },
  article: { label: 'Bài viết', color: '#8b5cf6' },
}

interface Props {
  data: { type: string; count: number }[]
}

export default function ContentTypePieChart({ data }: Props) {
  const chartData = data.map(d => ({
    name: TYPE_META[d.type]?.label ?? d.type,
    value: d.count,
    color: TYPE_META[d.type]?.color ?? '#6b7280',
  }))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">Phân bổ loại nội dung</h3>
      <p className="text-xs text-gray-400 mb-4">Tỷ lệ các dạng bài đăng bạn sử dụng</p>
      {chartData.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-sm text-gray-400">Chưa có dữ liệu.</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} bài`, '']} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
