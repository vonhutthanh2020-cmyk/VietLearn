# Hướng dẫn cấu hình & vận hành phân hệ quản trị (web)

## 1. Cấu hình (một lần)
1. **Firebase Console → Project settings → Service accounts → Generate new private key.** Mở tệp JSON, copy toàn bộ nội dung.
2. **Vercel → Settings → Environment Variables** (Production + Preview):
   - `FIREBASE_SERVICE_ACCOUNT` = nội dung JSON ở bước 1 (bí mật; không commit).
   - `PUBLISHER_CODE` = mã xác nhận nhà phát hành (đặt `NPH10112010` để khởi tạo, **đổi sang mã mạnh trước khi phát hành công khai**).
3. **Redeploy.** Hàm `api/publisher-verify` và `api/admin-delete-user` chỉ chạy trên Vercel (hoặc `vercel dev`), không chạy bằng `npm run dev`.
4. (Khuyến nghị, sau khi kiểm thử) dán `firestore.rules.stage2.proposed` vào Firestore Rules và `storage.rules.proposed` vào Storage Rules. Storage cần được bật trong Console (có thể yêu cầu gói Blaze).

## 2. Cấp quyền
- **Nhà phát hành:** trong Firestore, đặt `users/{uid}.role = "publisher"` (hoặc đăng ký vai trò "Phát hành" trên màn đăng ký — nên chặn tự đăng ký bằng Rules khi vận hành thật). Vai trò này **chưa** đủ để quản trị: phải nhập đúng mã (bước 3).
- **Kiểm duyệt viên:** Nhà phát hành vào *Trung tâm quản trị → Kiểm duyệt viên*, nhập email và bấm Cấp quyền.
- **Tích xanh:** *Tài khoản → chọn người dùng → Cấp tích xanh*, hoặc duyệt trong danh sách yêu cầu chờ.

## 3. Đăng nhập nhà phát hành
Đăng nhập bình thường → màn **Xác nhận quyền Nhà phát hành** → nhập mã. Máy chủ kiểm tra mã, giới hạn 5 lần sai (khóa 15 phút), ghi nhật ký, rồi cấp Custom Claims hiệu lực 4 giờ. Hết phiên phải nhập lại.

## 4. Báo cáo kiểm thử (CHƯA chạy thử trên trình duyệt/Firebase thật)
| # | Trường hợp | Trạng thái | Cách kiểm tra |
|---|---|---|---|
| 1 | USER không vào được quản trị | Đã viết, chưa thử | Đăng nhập học sinh, mở `/admin` → về trang chủ |
| 2 | MODERATOR không cấp được quyền PUBLISHER | Đã viết, chưa thử | Mục "Kiểm duyệt viên" chỉ hiện với publisher; Rules chặn ghi `role` |
| 3 | PUBLISHER phải xác thực bổ sung | Đã viết, chưa thử | Đăng nhập publisher → màn nhập mã |
| 4 | Sai mã không vào được | Đã viết, chưa thử | Nhập sai → báo lỗi, đếm lần thử, khóa sau 5 lần |
| 5 | PUBLISHER sửa hồ sơ của mình | Đã viết, chưa thử | Mục "Hồ sơ nhà phát hành" |
| 6 | USER không sửa được hồ sơ nhà phát hành | Chỉ chặn ở giao diện cho đến khi dán Rules | Cần Rules stage 2 |
| 7 | Chỉ người có quyền cấp tích xanh | Giao diện + Rules stage 2 | |
| 8 | Báo cáo không làm bình luận biến mất | Đã sửa trên web | Báo cáo một bình luận → vẫn hiển thị |
| 9 | Báo cáo lưu trên Firebase | Đã viết, chưa thử | Collection `reports`, id `uid_targetId` |
| 10 | Kiểm duyệt viên xử lý theo quyền | Đã viết, chưa thử | Mục "Báo cáo vi phạm" |
| 11–12 | Nhãn NHÀ PHÁT HÀNH / KIỂM DUYỆT VIÊN | Đã viết, chưa thử | Bình luận bằng tài khoản tương ứng |
| 13–14 | Hạn chế có hiệu lực và tự hết hạn | Đã viết, chưa thử | Hạn chế 1 ngày; hết hạn thì tự coi là ACTIVE |
| 15 | Xóa tài khoản giữ nhật ký | Đã viết, chưa thử | Hàm `admin-delete-user` không đụng `moderation_*`/`reports` |
| 16 | Android và web đồng bộ | Một phần | Android chưa đọc `status`, `sanction`, `announcements` |
| 17 | Chức năng cũ vẫn chạy | Chưa thử | |

## 5. Còn tồn tại / chưa làm
- **Android:** chưa có khu vực quản trị; lỗi báo cáo bình luận chỉ có bản vá mô tả (`docs/ANDROID_PATCH.md`).
- Rules hiện tại trên Firebase vẫn mở: mọi kiểm soát ở trên chỉ chặn ở giao diện cho đến khi dán Rules stage 2 (và Rules đó chưa được kiểm thử).
- `email` trong `users` vẫn đọc được bởi mọi tài khoản đăng nhập (Rules không ẩn từng trường); cần tách sang collection riêng.
- Giới hạn tần suất báo cáo chưa có; hiện chỉ chống báo cáo trùng cùng một nội dung.
- Đổi mã `PUBLISHER_CODE` thực hiện bằng biến môi trường (chưa có giao diện đổi mã).
- Bài thi/đáp án và `roomPasswordHash` vẫn lộ như đã báo cáo trước đó.
