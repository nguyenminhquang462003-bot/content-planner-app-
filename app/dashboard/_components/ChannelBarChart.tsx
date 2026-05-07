'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ChannelData {
  name: string
  type: string
  posts: number
  views: number
  engagement: number
}

export default function ChannelBarChart({ data }: { data: ChannelData[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">So sánh hiệu quả kênh</h3>
      {data.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-sm text-gray-400">
          Chưa có dữ liệu kênh nào.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="posts" name="Bài đăng" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            <Bar dataKey="engagement" name="Tương tác" fill="#f43f5e" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
