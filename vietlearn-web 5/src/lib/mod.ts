import { collection, deleteField, doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

export type Sanction = { type: 'RESTRICT' | 'SUSPEND' | 'BAN'; scope?: 'POST' | 'COMMENT' | 'ALL'; reason: string; until: number | null; allowAppeal: boolean; by: string; at: number };
export const REASONS: Record<string, string> = { BULLYING: 'Nội dung xúc phạm hoặc bắt nạt', MISINFO: 'Thông tin sai lệch hoặc giả mạo', HARASS: 'Quấy rối hoặc đe dọa', SPAM: 'Spam hoặc quảng cáo', UNSUITABLE: 'Nội dung không phù hợp với môi trường học đường', PRIVACY: 'Xâm phạm quyền riêng tư', OTHER: 'Lý do khác', INAPPROPRIATE: 'Không phù hợp' };
export const RSTATUS: Record<string, string> = { PENDING: 'Chờ tiếp nhận', REVIEWING: 'Đang xem xét', VERIFIED: 'Đã xác minh vi phạm', REJECTED: 'Không đủ căn cứ vi phạm', RESOLVED: 'Đã xử lý', CLOSED: 'Đã đóng báo cáo' };
export const STATUS_LABEL: Record<string, string> = { ACTIVE: 'Hoạt động', RESTRICTED: 'Bị hạn chế', SUSPENDED: 'Bị đình chỉ', BANNED: 'Bị cấm', DELETED: 'Đã xóa' };

/** Thời gian bất kỳ (Timestamp/Date/số) → mili giây. */
export const ts = (x: any): number => (x?.toMillis ? x.toMillis() : x?.toDate ? x.toDate().getTime() : x instanceof Date ? x.getTime() : typeof x === 'number' ? x : 0);
export const dt = (ms?: number | null) => (ms ? new Date(ms).toLocaleString('vi-VN') : '—');
export const sanctionActive = (s?: Sanction | null) => !!s && (s.until == null || s.until > Date.now());
/** Trạng thái hiệu lực: hạn chế/đình chỉ hết hạn thì TỰ ĐỘNG trở lại ACTIVE (không cần ghi lại Firestore). */
export function effStatus(u: any): string {
  if (u?.accountStatus === 'DELETED') return 'DELETED';
  if (!sanctionActive(u?.sanction)) return 'ACTIVE';
  return ({ RESTRICT: 'RESTRICTED', SUSPEND: 'SUSPENDED', BAN: 'BANNED' } as Record<string, string>)[u.sanction.type] ?? 'ACTIVE';
}
/** Trả về thông báo nếu tài khoản đang bị hạn chế ở phạm vi `scope`, ngược lại null. */
export function restrictionMsg(u: any, scope: 'POST' | 'COMMENT'): string | null {
  const s: Sanction | undefined = u?.sanction; if (effStatus(u) !== 'RESTRICTED' || !s) return null;
  if (s.scope !== 'ALL' && s.scope !== scope) return null;
  return `Tài khoản của bạn đang bị hạn chế ${scope === 'POST' ? 'đăng bài' : 'bình luận'}${s.until ? ' đến ' + dt(s.until) : ''}. Lý do: ${s.reason}`;
}

type Actor = { uid: string; role: string };
type Act = { action: string; targetType: string; targetId: string; reason?: string; targetUserId?: string; duration?: number | null; expiresAt?: number | null; previousStatus?: string; newStatus?: string };
/** Ghi moderation_logs (+ moderation_actions khi có targetUserId) trong cùng một batch. */
export function auditOps(b: ReturnType<typeof writeBatch>, a: Actor, x: Act) {
  const lr = doc(collection(db, 'moderation_logs')); const now = Date.now();
  b.set(lr, { logId: lr.id, actorUid: a.uid, actorRole: a.role, action: x.action, targetType: x.targetType, targetId: x.targetId, reason: x.reason ?? '', timestamp: now });
  if (x.targetUserId) { const ar = doc(collection(db, 'moderation_actions')); b.set(ar, { actionId: ar.id, targetUserId: x.targetUserId, moderatorId: a.uid, action: x.action, reason: x.reason ?? '', duration: x.duration ?? null, createdAt: now, expiresAt: x.expiresAt ?? null, previousStatus: x.previousStatus ?? '', newStatus: x.newStatus ?? '' }); }
}
export async function audit(a: Actor, x: Act) { const b = writeBatch(db); auditOps(b, a, x); await b.commit(); }
/** Áp dụng/gỡ biện pháp xử lý tài khoản (không xóa dữ liệu). s = null nghĩa là gỡ. */
export async function applySanction(a: Actor, target: any, s: Sanction | null, reason: string) {
  const b = writeBatch(db); const prev = effStatus(target);
  const next = s ? ({ RESTRICT: 'RESTRICTED', SUSPEND: 'SUSPENDED', BAN: 'BANNED' } as Record<string, string>)[s.type] : 'ACTIVE';
  b.update(doc(db, 'users', target.id), s ? { accountStatus: next, sanction: s } : { accountStatus: 'ACTIVE', sanction: deleteField() });
  auditOps(b, a, { action: s ? s.type : 'LIFT', targetType: 'USER', targetId: target.id, reason, targetUserId: target.id, duration: s?.until ? s.until - Date.now() : null, expiresAt: s?.until ?? null, previousStatus: prev, newStatus: next });
  await b.commit();
}
/** Báo cáo: mỗi người chỉ báo cáo MỘT lần cho mỗi nội dung (id xác định). KHÔNG đổi trạng thái/hiển thị nội dung. */
export async function submitReport(p: { reporterId: string; targetType: 'POST' | 'COMMENT'; targetId: string; postId: string; reason: string; description: string }) {
  const id = `${p.reporterId}_${p.targetId}`; const ref = doc(db, 'reports', id);
  if ((await getDoc(ref)).exists()) throw new Error('DUP');
  await setDoc(ref, { reportId: id, reporterId: p.reporterId, targetType: p.targetType, targetId: p.targetId, postId: p.postId, reason: p.reason, description: p.description, status: 'PENDING', assignedModeratorId: null, createdAt: Date.now(), reviewedAt: null, reviewedBy: null, history: [] });
}
