# Sửa lỗi "báo cáo xong bình luận biến mất" trên Android (CHƯA biên dịch/kiểm thử)

## Nguyên nhân (đọc từ `ui/EmpathyViewModel.kt`)
1. `reportComment` chỉ `increment("reportCount")` trên chính bình luận — **không tạo bản ghi `reports`**, nên quản trị không thấy gì.
2. **Không chống báo cáo trùng**: một người bấm 5 lần là đủ để đẩy `reportCount` lên 5.
3. Bộ lắng nghe bình luận (khoảng dòng 271) **loại bỏ mọi bình luận có `reportCount >= 5`** (`return@mapNotNull null`) — bình luận biến mất khỏi danh sách mà không có quyết định của người có thẩm quyền.
4. `reportPost` có cùng cơ chế tự ẩn bài (`isReported = true` khi `reportCount >= 5`).

## Cách sửa đề xuất
- `reportComment` / `reportPost`: tạo `reports/{uid}_{targetId}` bằng transaction (nếu đã tồn tại thì báo "đã báo cáo"), với các trường `reportId, reporterId, targetType, targetId, postId, reason, description, status="PENDING", assignedModeratorId=null, createdAt, reviewedAt=null, reviewedBy=null`. **Không** ghi gì lên bài/bình luận.
- Bộ lắng nghe bình luận: bỏ điều kiện `reportCount >= 5`; chỉ ẩn khi `status == "HIDDEN"`.
- `reportPost`: bỏ đoạn tự đặt `isReported = true`.
- Màn báo cáo: thêm 7 lý do theo đặc tả (BULLYING, MISINFO, HARASS, SPAM, UNSUITABLE, PRIVACY, OTHER) và ô mô tả.
- Nhãn vai trò: tra `users/{authorId}.role` / `isVerified` khi hiển thị; đừng lưu nhãn vào bình luận.

Bản web đã áp dụng đúng các thay đổi này. Cho đến khi Android được cập nhật, báo cáo từ Android vẫn dùng cơ chế cũ.
