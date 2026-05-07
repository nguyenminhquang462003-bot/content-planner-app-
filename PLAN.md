# Kế hoạch xây dựng Content Planner App

## Mục tiêu

Dashboard full-stack để tổng hợp, theo dõi và phân tích hiệu quả nội dung đa kênh. Hỗ trợ Facebook Fanpage (API tự động), Facebook Group và Substack (nhập tay).

## Tech Stack

- **Next.js 16** App Router + TypeScript
- **Tailwind CSS v4**
- **Supabase** — PostgreSQL database + Auth
- **Recharts** — Biểu đồ
- **@hello-pangea/dnd** — Kéo thả Kanban

## Database Schema

```sql
-- Bảng kênh
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fanpage', 'group', 'substack')),
  fb_page_id TEXT,
  fb_access_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng bài đăng
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  title TEXT,
  content_type TEXT CHECK (content_type IN ('video', 'image', 'text', 'article')),
  published_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  external_id TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng tuyến nội dung
CREATE TABLE pipeline_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES channels(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  stage TEXT DEFAULT 'idea' CHECK (stage IN ('idea','draft','review','scheduled','published')),
  planned_date DATE,
  content_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Các bước triển khai

| Bước | Nội dung | Trạng thái |
|------|----------|------------|
| 1 | Cài đặt Supabase & môi trường | ✅ Hoàn thành |
| 2 | Tạo bảng database trên Supabase | ✅ Hoàn thành |
| 3 | Xác thực — Đăng nhập / Đăng ký | ✅ Hoàn thành |
| 4 | Layout Dashboard (Sidebar + Header) | ✅ Hoàn thành |
| 5 | Trang Cài đặt kênh | ✅ Hoàn thành |
| 6 | Trang Quản lý bài đăng | ✅ Hoàn thành |
| 7 | Đồng bộ Facebook Fanpage API | ✅ Hoàn thành |
| 8 | Dashboard tổng quan (KPI + Charts) | ✅ Hoàn thành |
| 9 | Trang Phân tích hiệu quả | ✅ Hoàn thành |
| 10 | Tuyến nội dung Kanban | ✅ Hoàn thành |
| 11 | Lịch nội dung | ✅ Hoàn thành |

## Cấu trúc thư mục

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── dashboard/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── posts/
│   ├── analytics/
│   ├── pipeline/
│   ├── calendar/
│   └── settings/
├── api/
│   └── facebook-sync/route.ts
lib/
├── supabase/
│   ├── client.ts
│   ├── server.ts
│   └── actions.ts
└── types.ts
proxy.ts
```

## Lưu ý kỹ thuật

- **Next.js 16**: Dùng `proxy.ts` (không phải `middleware.ts`) để bảo vệ routes
- **Server Functions**: Dùng directive `'use server'` cho form actions
- **Row Level Security**: Mỗi user chỉ đọc/ghi được dữ liệu của chính mình
- **Facebook API**: Chỉ Fanpage hỗ trợ Graph API; Group và Substack nhập tay do giới hạn API
