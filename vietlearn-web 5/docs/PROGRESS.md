# Bảng theo dõi tiến độ VietLearn Web

✅ đã kiểm thử · 🟡 đã viết, chưa chạy thử · ⬜ chưa làm · ⛔ bị chặn, chờ quyết định

| # | Phân hệ | Trạng thái | Ghi chú |
|---|---|---|---|
| 0 | Nền tảng (Vite, React, TS, Tailwind, Firebase, `vercel.json`) | 🟡 | Chưa chạy `npm install` trong môi trường của tôi (không có mạng) |
| 1 | Splash, Đăng nhập, Đăng ký (4 vai trò) | 🟡 | Khớp ảnh 1–2; ghi `users/{uid}` đúng schema Android |
| 1 | Hồ sơ, Cài đặt, Xác minh, Hỗ trợ | ⬜ | |
| 2 | Trang chủ HS / GV, thanh điều hướng nổi theo vai trò | 🟡 | Dữ liệu XP/cấp thật; thanh tiến độ nhiệm vụ chưa có (dữ liệu ở Room). Trang chủ Phát hành/Kiểm duyệt đang dùng bố cục học sinh |
| 3 | Học tập: menu 9 thẻ, 6 chủ đề, chi tiết bài | 🟡 | Đọc Firestore `Lessons` (category, order). Podcast, Khám phá VN, Trắc nghiệm chưa làm |
| 4 | Góc Đồng Cảm | ⬜ | Có ảnh mẫu 13 |
| 5 | Phòng Tư vấn | ⬜ | Có ảnh mẫu 8, 14, 19 |
| 6 | Kiểm tra trực tuyến (HS: vào phòng, làm bài, kết quả · GV: danh sách, tạo, thiết lập, câu hỏi, phòng, thí sinh, kết quả) | 🟡 | Đúng luật Android: mã 6 số, WAITING→ONGOING→FINISHED, điểm = đúng/tổng×10, mật khẩu so khớp thẳng. Chưa làm: tải file đề (Storage), thưởng XP sau bài thi |
| 7 | Gamification | ⛔ | Dữ liệu đang chỉ ở Room trên máy Android |
| 8 | Công cụ cá nhân | ⛔ | Chưa có collection; cần thiết kế + sửa Android |
| 9 | Trò chơi | ⬜ | |
| 10 | Lớp học, điểm danh | ⬜ | |
| 11 | Trợ lý AI | ⛔ | Chờ quyết định #6 |
| 12 | Kiểm duyệt, quản trị | ⬜ | Đợt 2 |
| 13 | Firestore Rules, kiểm thử, triển khai | ⛔ | Rules hiện mở hoàn toàn (SECURITY.md) |

## Quyết định đã chốt
- Web tự chấm điểm trên trình duyệt như Android (chấp nhận rủi ro đáp án đọc được, xem SECURITY.md S3).
- Đăng ký tự do mọi vai trò, không chặn Phát hành/Kiểm duyệt.

## Cập nhật đợt 3 (🟡 = đã viết, chưa chạy thử trên trình duyệt)
| Nhóm | Trạng thái | Ghi chú |
|---|---|---|
| Góc Đồng Cảm: danh sách, lọc, tìm, đăng bài, thả tim, bình luận, báo cáo | 🟡 | Đúng trường `empathy_posts`; ẩn bài `isReported`, bình luận ≥5 báo cáo |
| Phòng Tư vấn (HS + GV): tạo yêu cầu, nhận, nhắn tin, hoàn thành, đánh giá | 🟡 | `Consultations/{uid}/Messages`; GV chỉ thấy phòng cùng `schoolId` |
| Công cụ cá nhân (9): nhật ký, thư, mục tiêu, ghi chú, lịch học, đếm ngược, biết ơn, kế hoạch biểu, quan điểm | 🟡 | Lưu `users/{uid}/…` (Firestore, riêng tư theo tài khoản). **Android chưa đọc được dữ liệu này** (Android lưu Room) |
| Trò chơi: Lật hình, Cờ Caro, Tính nhanh, Đập chuột, 2048, Tháp Hà Nội, Sudoku | 🟡 | Chưa cộng XP |
| Hồ sơ, Chỉnh sửa hồ sơ, Cài đặt, Điều khoản, Chính sách | 🟡 | Điều khoản/Chính sách lấy từ chuỗi trong app |
| Bảng xếp hạng, Đấu trường tri thức, Nhiệm vụ, Cửa hàng, Huy hiệu | 🟡 | Nhiệm vụ/Cửa hàng lưu `users/{uid}/missions|unlockedItems` (web-only) |
| Podcast (5 tập), Khám phá Việt Nam (63 tỉnh), Trắc nghiệm (10 câu), Khảo sát | 🟡 | Dữ liệu trích từ app |
| Xác minh, Hỗ trợ, Báo cáo vi phạm (kiểm duyệt) | 🟡 | `verificationRequests`, `supportRequests`, `reports` |
| Trợ lý EDU AI | 🟡 | Firebase AI Logic (`gemini-2.5-flash`); cần bật AI Logic trong Console |
| **Chưa làm** | ⬜ | Tin tức, Thành tựu, Vòng quay may mắn, Bộ sưu tập, Lớp học/Bản đồ lớp/Điểm danh, Quy tắc Đồng Cảm, ảnh đính kèm bài Đồng Cảm, tải file đề thi, thông báo đẩy |

## Cập nhật đợt 4
| Màn hình | Trạng thái | Ghi chú |
|---|---|---|
| Hồ sơ (dựng theo ảnh chụp 1–3) | 🟡 | Nhãn dưới 3 ô chỉ số bị che trong ảnh nên chưa có; "Số huy hiệu" tạm tính theo cấp; đổi ảnh đại diện chưa làm (cần Storage); Ghim Widget chỉ có trên Android |
| Cài đặt (ảnh chụp 4) | 🟡 | "Báo cáo" lưu vào `supportRequests` với tiền tố [Báo cáo] |
| Kế hoạch biểu (ảnh chụp 5) | 🟡 | Dải tuần, thẻ tiến độ, lộ trình; menu ⋮ chỉ có "Xóa việc đã hoàn thành" (chưa có ảnh mẫu) |
| Bộ sưu tập & Ngoại trang | 🟡 | Trang bị vật phẩm đã mở khóa |
| Thông báo (khung cuối Trang chủ + trang đầy đủ) | 🟡 | Collection MỚI `announcements`; chỉ vai trò `publisher` thấy nút Đăng/Sửa/Xóa. Android chưa hiển thị. Rules đề xuất ở `firestore.rules.stage1.proposed` |

## Cập nhật đợt 5 – Giao diện web (máy tính)
| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| Khung web: thanh bên (7 nhóm, theo vai trò) + thanh trên (XP, xu, streak, thông báo, hồ sơ) | 🟡 | Từ 1024px trở lên; điện thoại giữ nguyên thanh điều hướng nổi |
| Trang chủ dạng bảng điều khiển (thẻ tiến trình + thông báo, lưới thẻ tính năng, lưới 9 công cụ) | 🟡 | Giáo viên: 2 thẻ quản lý |
| Học tập (lưới 3 cột), chủ đề (2 cột), Hồ sơ (2 cột), Đồng Cảm (bộ lọc + dòng bài), Tư vấn giáo viên (danh sách + khung chat), Quản lý kiểm tra, công cụ, trò chơi, Khám phá VN | 🟡 | Bố cục nhiều cột bằng breakpoint Tailwind |
| Trang biểu mẫu/đọc (kiểm tra, bài học, cài đặt…) | 🟡 | Khung hẹp căn giữa trên máy tính; đang làm bài thi thì ẩn thanh bên |

## Cập nhật đợt 6
| Trợ lý EDU AI | 🟡 | Gọi REST `generativelanguage.googleapis.com` (gemini-2.5-flash), trả lời hiện dần, nhớ ngữ cảnh; hàm trung gian `api/chat.js`. Chưa kiểm chứng gọi thật (máy tôi không có mạng) |

## Cập nhật đợt 7 – Quản trị
Trung tâm quản trị (9 mục), xác thực nhà phát hành qua máy chủ (Custom Claims), xử lý tài khoản (hạn chế/đình chỉ/cấm/xóa), trung tâm báo cáo, nhãn vai trò, tích xanh, hồ sơ nhà phát hành, điều khoản mới: 🟡 đã viết, chưa chạy thử. Chi tiết và danh sách còn tồn tại: `docs/ADMIN_GUIDE.md`.
