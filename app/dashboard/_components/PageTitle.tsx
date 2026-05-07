'use client'

import { usePathname } from 'next/navigation'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Tổng quan',
  '/dashboard/posts': 'Bài đăng',
  '/dashboard/analytics': 'Phân tích hiệu quả',
  '/dashboard/pipeline': 'Tuyến nội dung',
  '/dashboard/calendar': 'Lịch nội dung',
  '/dashboard/settings': 'Cài đặt kênh',
}

export default function PageTitle() {
  const pathname = usePathname()
  const title = pageTitles[pathname] ?? 'Dashboard'
  return <h1 className="text-base font-semibold text-gray-900">{title}</h1>
}
