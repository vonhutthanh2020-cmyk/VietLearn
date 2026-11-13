// Kiểm tra mã xác nhận Nhà phát hành Ở MÁY CHỦ. Mã nằm trong biến môi trường PUBLISHER_CODE (Vercel), không có trong mã web hay Firestore.
// Thành công: cấp Custom Claims { pub: true, pubExp } có hạn 4 giờ. Sai 5 lần: khóa 15 phút. Mọi lần thử đều ghi vào moderation_logs.
import crypto from 'node:crypto';
import { admin, caller, logAction } from './_lib.js';

const MAX = 5, LOCK_MS = 15 * 60 * 1000, SESSION_MS = 4 * 3600 * 1000;
const eq = (a, b) => { const x = crypto.createHash('sha256').update(String(a)).digest(), y = crypto.createHash('sha256').update(String(b)).digest(); return crypto.timingSafeEqual(x, y); };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const dec = await caller(req); if (!dec) return res.status(401).json({ error: 'Chưa đăng nhập hoặc phiên đăng nhập hết hạn.' });
    const expected = process.env.PUBLISHER_CODE; if (!expected) return res.status(500).json({ error: 'Máy chủ chưa cấu hình PUBLISHER_CODE.' });
    const { auth, db } = admin(); const uid = dec.uid;
    const u = (await db.doc(`users/${uid}`).get()).data();
    if (!u || u.role !== 'publisher') { await logAction(db, { actorUid: uid, actorRole: String(u?.role || 'UNKNOWN').toUpperCase(), action: 'PUBLISHER_VERIFY_DENIED', targetType: 'SESSION', targetId: uid }); return res.status(403).json({ error: 'Tài khoản không có vai trò Nhà phát hành.' }); }
    const ref = db.doc(`publisher_attempts/${uid}`); const st = (await ref.get()).data() || { count: 0, lockUntil: 0 }; const now = Date.now();
    if (st.lockUntil > now) return res.status(429).json({ error: 'Tạm khóa do nhập sai nhiều lần.', retryAfter: Math.ceil((st.lockUntil - now) / 1000) });
    let body = req.body; if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
    const code = String(body?.code ?? '');
    if (!code || !eq(code, expected)) {
      const count = (st.count || 0) + 1; const lock = count >= MAX ? now + LOCK_MS : 0;
      await ref.set({ count: lock ? 0 : count, lockUntil: lock, lastFail: now }, { merge: true });
      await logAction(db, { actorUid: uid, action: 'PUBLISHER_VERIFY_FAILED', targetType: 'SESSION', targetId: uid, reason: lock ? 'Khóa 15 phút' : `Lần sai thứ ${count}` });
      return res.status(403).json({ error: lock ? 'Nhập sai quá nhiều lần. Tài khoản bị tạm khóa 15 phút.' : 'Mã xác nhận không đúng.', remaining: Math.max(0, MAX - count), retryAfter: lock ? LOCK_MS / 1000 : 0 });
    }
    await ref.set({ count: 0, lockUntil: 0, lastOk: now }, { merge: true });
    const prev = (await auth.getUser(uid)).customClaims || {}; const exp = now + SESSION_MS;
    await auth.setCustomUserClaims(uid, { ...prev, pub: true, pubExp: exp });
    await logAction(db, { actorUid: uid, action: 'PUBLISHER_VERIFY_OK', targetType: 'SESSION', targetId: uid });
    return res.status(200).json({ ok: true, exp });
  } catch (e) {
    if (String(e.message) === 'NO_SERVICE_ACCOUNT') return res.status(500).json({ error: 'Máy chủ chưa cấu hình FIREBASE_SERVICE_ACCOUNT.' });
    return res.status(500).json({ error: 'Lỗi máy chủ xác thực.' });
  }
}
