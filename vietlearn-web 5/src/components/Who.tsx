import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { BadgeCheck, ShieldCheck } from 'lucide-react';
import { db } from '../lib/firebase';

const cache = new Map<string, Promise<any>>();
export function useUser(uid?: string) {
  const [u, setU] = useState<any>(null);
  useEffect(() => { if (!uid) return; let on = true; if (!cache.has(uid)) cache.set(uid, getDoc(doc(db, 'users', uid)).then((s) => s.data() ?? null).catch(() => null)); void cache.get(uid)!.then((d) => on && setU(d)); return () => { on = false; }; }, [uid]);
  return u;
}
/** Tên + nhãn. Vai trò và dấu tích lấy từ hồ sơ `users/{uid}` (do hệ thống quản lý), KHÔNG lấy từ tên người dùng tự nhập. */
export function Who({ uid, name, anon }: { uid?: string; name: string; anon?: boolean }) {
  const u = useUser(anon ? undefined : uid); if (anon) return <>Ẩn danh</>;
  const r = u?.role;
  return <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">{u?.accountStatus === 'DELETED' ? 'Tài khoản đã xóa' : name}
    {u?.isVerified && <BadgeCheck size={18} className="fill-green-600 text-white" aria-label="Đã xác minh" />}
    {r === 'publisher' && <span className="rounded-md bg-vl-navy px-2 py-0.5 text-[10px] font-black tracking-wide text-white">NHÀ PHÁT HÀNH</span>}
    {r === 'moderator' && <span className="inline-flex items-center gap-1 rounded-md bg-teal-600 px-2 py-0.5 text-[10px] font-black tracking-wide text-white"><ShieldCheck size={12} />KIỂM DUYỆT VIÊN</span>}</span>;
}
