# Content Planner App

Dashboard theo dõi và phân tích hiệu quả nội dung đa kênh, được xây dựng bằng Claude Code.

## Tính năng

- **Tổng quan** — KPI cards (tổng bài, views, tương tác, kênh hiệu quả nhất) + biểu đồ xu hướng
- **Quản lý bài đăng** — Thêm / sửa / xóa bài, xem bảng tổng hợp theo kênh
- **Phân tích hiệu quả** — So sánh kênh, phân bổ loại nội dung, top 10 bài
- **Tuyến nội dung (Kanban)** — Kéo thả qua 5 giai đoạn: Ý tưởng → Bản nháp → Chờ duyệt → Lên lịch → Đã đăng
- **Lịch nội dung** — Xem bài đăng theo ngày/tháng, click ngày để xem chi tiết
- **Cài đặt kênh** — Quản lý kênh, đồng bộ tự động Facebook Fanpage qua Graph API
- **Xác thực** — Đăng ký / đăng nhập, mỗi user chỉ thấy dữ liệu của mình

## Kênh hỗ trợ

| Kênh | Nhập dữ liệu |
|---|---|
| Facebook Fanpage | Tự động qua Facebook Graph API |
| Facebook Group | Nhập tay |
| Substack | Nhập tay |

## Tech Stack

- **Frontend & Backend:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4
- **Database & Auth:** Supabase (PostgreSQL + Row Level Security)
- **Charts:** Recharts
- **Drag & Drop:** @hello-pangea/dnd

## Cài đặt local

```bash
# 1. Clone repo
git clone <repo-url>
cd content-planner-app

# 2. Cài dependencies
npm install

# 3. Tạo file môi trường
cp .env.example .env.local
# Điền NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY

# 4. Chạy dev server
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

## Cấu trúc project

```
app/
├── (auth)/login & signup   # Trang xác thực
├── dashboard/              # Dashboard chính
│   ├── page.tsx            # Tổng quan
│   ├── posts/              # Quản lý bài đăng
│   ├── analytics/          # Phân tích
│   ├── pipeline/           # Kanban
│   ├── calendar/           # Lịch
│   └── settings/           # Cài đặt kênh
├── api/facebook-sync/      # API đồng bộ Facebook
lib/
├── supabase/               # Client, server, actions
└── types.ts                # TypeScript types
proxy.ts                    # Bảo vệ routes (Next.js 16)
```

## Được xây dựng bằng Claude Code

Toàn bộ app được lên kế hoạch và xây dựng với sự hỗ trợ của [Claude Code](https://claude.ai/code) — CLI AI của Anthropic.
