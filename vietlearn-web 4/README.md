# VietLearn Web

Phiên bản web của ứng dụng Android VietLearn, dùng chung Firebase project `giaoduchocduong`.
Công nghệ: React 18, TypeScript, Vite, Tailwind CSS, Firebase Auth/Firestore, Firebase Hosting.

## Chạy thử
```bash
npm install
cp .env.example .env.local      # cấu hình Firebase Web (định danh công khai)
npm run dev                     # http://localhost:5173
```
Đăng nhập bằng tài khoản **thử** (không dùng tài khoản thật). `localhost` mặc định đã được Firebase cho phép.

## Triển khai lên Vercel (đang dùng)
1. Đẩy thư mục lên GitHub, import vào Vercel. `vercel.json` đã đặt Framework **Vite**, lệnh `npm run build`, thư mục `dist` và chuyển hướng SPA.
2. Nếu trang **trắng**: kiểm tra Vercel đang dùng Framework Preset = Vite (không phải "Other"), rồi Redeploy.
3. Firebase Console → Authentication → Settings → **Authorized domains** → thêm `vietlearn-web-4.vercel.app` (và mọi tên miền Vercel khác). Thiếu bước này đăng nhập báo `unauthorized-domain`.

## Triển khai Firebase Hosting (tùy chọn)
```bash
npm run build
npm i -g firebase-tools && firebase login
firebase deploy --only hosting   # chỉ Hosting. KHÔNG deploy Rules khi chưa kiểm thử.
```
Sau khi có địa chỉ `*.web.app`, đã nằm sẵn trong danh sách tên miền được phép của Firebase Auth.

## Tài liệu
- `docs/PROGRESS.md` – bảng tiến độ · `docs/SCREEN_MAP.md` – bản đồ Android → Web · `docs/SECURITY.md` – phân tích bảo mật.

## Trợ lý AI (Gemini `gemini-2.5-flash`)
Hai cách cấu hình (chọn một):
1. **Gọi trực tiếp từ trình duyệt**: đặt `VITE_GEMINI_API_KEY` (`.env.local` khi chạy máy; Vercel → Settings → Environment Variables khi triển khai; **Redeploy** sau khi thêm). Khóa sẽ nằm trong mã web gửi cho người dùng, nên bắt buộc giới hạn khóa theo *HTTP referrer* (tên miền web) và theo API *Generative Language* trong Google Cloud, đồng thời đặt hạn mức/ngân sách.
2. **Qua hàm trung gian (khuyến nghị)**: KHÔNG đặt biến `VITE_`; đặt `GEMINI_API_KEY` trên Vercel. Web gọi `/api/chat` (file `api/chat.js`), khóa không lộ ra trình duyệt.
