import { useEffect, useState } from 'react';
import { collection, doc, increment, onSnapshot, Query, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { nextLevelXp } from './gamification';
/** Lắng nghe realtime một truy vấn Firestore, trả về mảng {...data, id}. */
export function useQ(q: Query | null, key: string): any[] {
  const [l, setL] = useState<any[]>([]);
  useEffect(() => { if (!q) return; return onSnapshot(q, (s) => setL(s.docs.map((d) => ({ ...d.data(), id: d.id }))), () => setL([])); }, [key]); // eslint-disable-line
  return l;
}
export const userCol = (uid: string, name: string) => collection(db, 'users', uid, name);
/** Cộng XP/Coin; lên cấp khi vượt ngưỡng (150 → 450) giống GamificationViewModel. */
export async function award(uid: string, p: any, xp: number, coins: number) {
  const level = (p?.xp ?? 0) + xp >= nextLevelXp(p?.level ?? 1) ? (p?.level ?? 1) + 1 : p?.level ?? 1;
  await updateDoc(doc(db, 'users', uid), { xp: increment(xp), coins: increment(coins), level });
}
const day = () => new Date().toISOString().slice(0, 10).replace(/-/g, '');
export const missionDoc = (uid: string, id: string, type: string) => doc(db, 'users', uid, 'missions', type === 'DAILY' ? `${id}_${day()}` : id);
export const fmt = (ms?: number) => { if (!ms) return ''; const d = new Date(ms), z = (n: number) => String(n).padStart(2, '0'); return `${z(d.getHours())}:${z(d.getMinutes())}, ${z(d.getDate())}/${z(d.getMonth() + 1)}`; };
import { setDoc } from 'firebase/firestore';
/** Ghi tiến độ nhiệm vụ: users/{uid}/missions/{id}[_ngày]. */
export async function track(uid: string, id: string, type = 'DAILY', by = 1) { await setDoc(missionDoc(uid, id, type), { id, progress: increment(by) }, { merge: true }); }
import { getDoc } from 'firebase/firestore';
/** Đếm bài đã đọc: chỉ cộng totalLessonsRead một lần cho mỗi bài (users/{uid}/readLessons/{id}). */
export async function markRead(uid: string, id: string) { const r = doc(db, 'users', uid, 'readLessons', id); if ((await getDoc(r)).exists()) return; await setDoc(r, { at: Date.now() }); await updateDoc(doc(db, 'users', uid), { totalLessonsRead: increment(1) }); }
