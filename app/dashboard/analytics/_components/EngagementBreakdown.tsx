'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Props {
  data: { name: string; value: number; color: string }[]
}

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toString()
}

export default function EngagementBreakdown({ data }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">Phân tích tương tác</h3>
      <p className="text-xs text-gray-400 mb-4">Tỷ lệ Likes / Comments / Shares trên toàn bộ bài đăng</p>
      {total === 0 ? (
        <div className="h-52 flex items-center justify-center text-sm text-gray-400">Chưa có dữ liệu tương tác.</div>
      ) : (
        <div className="flex items-center gap-6">
          <ResponsiveContainer width="55%" height={220}>
            <PieChart>
              <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={85}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatNumber(value as number), '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3 flex-1">
            {data.map((d) => (
              <div key={d.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-sm text-gray-600">{d.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatNumber(d.value)}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${total > 0 ? (d.value / total) * 100 : 0}%`, backgroundColor: d.color }} />
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-400 pt-1">Tổng: {formatNumber(total)} tương tác</p>
          </div>
        </div>
      )}
    </div>
  )
}
