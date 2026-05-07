'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface TrendPoint {
  date: string
  views: number
  engagement: number
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

export default function TrendChart({ data }: { data: TrendPoint[] }) {
  const chartData = data.map(d => ({ ...d, date: formatDate(d.date) }))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Xu hướng 30 ngày qua</h3>
      {chartData.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-sm text-gray-400">
          Chưa có dữ liệu. Thêm bài đăng để xem biểu đồ.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="views" name="Views" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="engagement" name="Tương tác" stroke="#f43f5e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
