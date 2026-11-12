# Phân tích bảo mật & dữ liệu (từ mã Android + ảnh Firebase Console)

## Phát hiện

| # | Mức | Phát hiện | Bằng chứng |
|---|---|---|---|
| S1 | **Nghiêm trọng** | Firestore Rules đang là `allow read, write: if request.auth != null` cho toàn bộ dữ liệu. Bất kỳ ai tạo được tài khoản đều đọc/ghi/xóa mọi thứ. | Ảnh Rules, bản sửa 24/10/2026 |
| S2 | **Nghiêm trọng** | `signUp(..., role)` cho người dùng tự chọn mọi vai trò (kể cả `moderator`). Kết hợp S1, ai cũng có thể tự nâng quyền hoặc sửa `isVerified`. | `AuthViewModel.kt` dòng 93–108 |
| S3 | Cao | `correctAnswer` nằm trong `questions` và chấm điểm chạy trên máy học sinh: học sinh đọc được đáp án và sửa điểm. | `ExamDoingViewModel.kt` dòng 117–121 |
| S4 | Trung bình | `email`, `fcmToken` của mọi người dùng đọc được bởi mọi tài khoản đăng nhập. | Ảnh dữ liệu `users` |
| S5 | Ràng buộc | Dự án đang ở gói **Spark**: không dùng được Cloud Functions, nên chưa thể chấm điểm bằng Function. | Ảnh Console |
| S6 | Thông tin | Collection `PhongTuVan` và `Schools` (chữ S hoa) có trên Firestore nhưng **không mã nào dùng**. Không đụng tới. | grep mã nguồn |

## Phương án chấm điểm (cần bạn chọn)
- **A. Nâng lên Blaze** + Cloud Function chấm điểm (khuyến nghị; có hạn mức miễn phí, nên đặt cảnh báo ngân sách).
- **B. Hàm chạy ngoài Firebase** (Vercel/Cloud Run) dùng Admin SDK; khóa dịch vụ để ở biến môi trường.
- **C. Tạm thời:** đáp án tách ra tài liệu chỉ giáo viên đọc được, giáo viên chấm. Không tức thời.
Cả ba đều **cần sửa app Android** (hiện tự chấm và đọc `correctAnswer`).

## Lộ trình Rules
- **Giai đoạn 1** (`firestore.rules.stage1.proposed`): chặn tự nâng quyền và tự xác minh, giữ nguyên các collection khác. Chưa kiểm thử với Emulator và với app Android.
- **Giai đoạn 2:** khóa `exams/questions/submissions` sau khi có phương án chấm điểm và bản Android tương ứng.
- **Giai đoạn 3:** rà soát toàn bộ, bỏ truy cập `email`, `fcmToken`.

⚠️ Không triển khai Rules trước khi thử với Emulator **và** với app Android, vì thay đổi có thể làm app đang chạy bị lỗi.
