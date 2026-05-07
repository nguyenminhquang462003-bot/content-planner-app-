@AGENTS.md

# Content Planner App — Hướng dẫn cho Claude Code

## Tổng quan dự án

Full-stack dashboard theo dõi hiệu quả nội dung đa kênh. Xây dựng bằng Next.js 16 App Router, TypeScript, Tailwind CSS v4, Supabase.

## Lưu ý quan trọng về Next.js 16

- Dùng `proxy.ts` (KHÔNG phải `middleware.ts`) để xử lý route protection
- Export function phải tên là `proxy`, không phải `middleware`
- Server mutations dùng `'use server'` directive (gọi là Server Functions)
- Đọc docs tại `node_modules/next/dist/docs/` trước khi thay đổi routing hoặc data fetching

## Cấu trúc quan trọng

- `lib/supabase/client.ts` — Supabase client cho browser (Client Components)
- `lib/supabase/server.ts` — Supabase client cho server (Server Components, Route Handlers)
- `lib/supabase/actions.ts` — Server Functions: login, signup, logout
- `lib/types.ts` — TypeScript types cho Channel, Post, PipelineItem
- `proxy.ts` — Bảo vệ `/dashboard` routes, redirect nếu chưa đăng nhập

## Database (Supabase)

3 bảng chính: `channels`, `posts`, `pipeline_items` — đều có Row Level Security bật, policy `auth.uid() = user_id`.

## Quy ước code

- Server Components mặc định — chỉ thêm `'use client'` khi cần useState/useEffect/event handlers
- Fetch dữ liệu ở Server Component (page.tsx), truyền xuống Client Component qua props
- Dùng `router.refresh()` sau khi mutate để cập nhật UI
