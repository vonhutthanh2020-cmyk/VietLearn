// Xóa tài khoản đúng quy trình (chỉ Nhà phát hành có phiên hợp lệ): ghi nhật ký → ẩn danh hóa hồ sơ → (tùy chọn) ẩn bài đăng → xóa tài khoản đăng nhập.
// KHÔNG xóa moderation_logs / moderation_actions / reports. Không xóa dữ liệu của tài khoản khác.
import { admin, caller, logAction, pubSessionOk } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const dec = await caller(req); if (!dec) return res.status(401).json({ error: 'Chưa đăng nhập.' });
    if (!pubSessionOk(dec)) return res.status(403).json({ error: 'Cần phiên xác nhận nhà phát hành còn hiệu lực.' });
    const { auth, db } = admin();
    const me = (await db.doc(`users/${dec.uid}`).get()).data(); if (me?.role !== 'publisher') return res.status(403).json({ error: 'Không đủ quyền.' });
    let b = req.body; if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } }
    const uid = String(b?.uid || ''), reason = String(b?.reason || '').trim(), policy = b?.contentPolicy === 'hide' ? 'hide' : 'keep';
    if (!uid || !reason) return res.status(400).json({ error: 'Thiếu UID hoặc lý do.' });
    if (uid === dec.uid) return res.status(400).json({ error: 'Không thể tự xóa tài khoản của mình.' });
    const ref = db.doc(`users/${uid}`); const t = (await ref.get()).data(); if (!t) return res.status(404).json({ error: 'Không tìm thấy tài khoản.' });
    if (t.role === 'publisher') return res.status(403).json({ error: 'Không thể xóa tài khoản nhà phát hành khác.' });
    const now = Date.now();
    const ar = db.collection('moderation_actions').doc();
    await ar.set({ actionId: ar.id, targetUserId: uid, moderatorId: dec.uid, action: 'DELETE_ACCOUNT', reason, duration: null, createdAt: now, expiresAt: null, previousStatus: t.accountStatus || 'ACTIVE', newStatus: 'DELETED' });
    await logAction(db, { actorUid: dec.uid, action: 'DELETE_ACCOUNT', targetType: 'USER', targetId: uid, reason: `${reason} (nội dung: ${policy})` });
    await ref.update({ accountStatus: 'DELETED', userName: 'Tài khoản đã xóa', email: '', bio: '', fcmToken: null, customAvatarUri: null, isVerified: false, deletedAt: now, deletedBy: dec.uid });
    if (policy === 'hide') { const ps = await db.collection('empathy_posts').where('authorId', '==', uid).limit(400).get(); const w = db.batch(); ps.docs.forEach((d) => w.update(d.ref, { isReported: true, status: 'HIDDEN' })); await w.commit(); }
    try { await auth.deleteUser(uid); } catch (e) { if (e.code !== 'auth/user-not-found') throw e; }
    return res.status(200).json({ ok: true });
  } catch (e) {
    if (String(e.message) === 'NO_SERVICE_ACCOUNT') return res.status(500).json({ error: 'Máy chủ chưa cấu hình FIREBASE_SERVICE_ACCOUNT.' });
    return res.status(500).json({ error: 'Lỗi máy chủ.' });
  }
}
