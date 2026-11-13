// Dùng chung cho các hàm quản trị (Vercel). File bắt đầu bằng "_" không trở thành endpoint.
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export function admin() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) throw new Error('NO_SERVICE_ACCOUNT');
    const sa = JSON.parse(raw); if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, '\n');
    initializeApp({ credential: cert(sa) });
  }
  return { auth: getAuth(), db: getFirestore() };
}
/** Xác thực ID token trong header Authorization: Bearer <token>. */
export async function caller(req) {
  const h = req.headers.authorization || ''; const tk = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!tk) return null;
  const { auth } = admin(); try { return await auth.verifyIdToken(tk); } catch { return null; }
}
export async function logAction(db, e) {
  const ref = db.collection('moderation_logs').doc();
  await ref.set({ logId: ref.id, actorUid: e.actorUid, actorRole: e.actorRole || 'PUBLISHER', action: e.action, targetType: e.targetType || 'USER', targetId: e.targetId || '', reason: e.reason || '', timestamp: Date.now() });
}
export const pubSessionOk = (dec) => dec && dec.pub === true && Number(dec.pubExp) > Date.now();
