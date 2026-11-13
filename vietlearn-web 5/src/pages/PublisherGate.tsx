import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useAuth } from '../auth/AuthContext';

/** Xác nhận quyền Nhà phát hành: mã được kiểm tra Ở MÁY CHỦ (api/publisher-verify), thành công thì cấp Custom Claims có hạn. */
export default function PublisherGate() {
  const { profile, pubSession, refreshClaims, signOut } = useAuth(); const nav = useNavigate();
  const [code, setCode] = useState(''); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  if (profile && profile.role !== 'publisher') return <Navigate to="/home" replace />;
  if (pubSession) return <Navigate to="/admin" replace />;
  const go = async () => {
    setErr(''); setBusy(true);
    try {
      const tk = await auth.currentUser?.getIdToken();
      const r = await fetch('/api/publisher-verify', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tk}` }, body: JSON.stringify({ code }) });
      const d = await r.json().catch(() => ({}));
      if (r.status === 404) return setErr('Máy chủ xác thực chưa được triển khai (thiếu thư mục api/ trên Vercel).');
      if (r.status === 429) return setErr(`Bạn đã nhập sai quá nhiều lần. Thử lại sau ${Math.ceil((d.retryAfter ?? 900) / 60)} phút.`);
      if (!r.ok) return setErr((d.error ?? 'Xác thực thất bại.') + (typeof d.remaining === 'number' ? ` (còn ${d.remaining} lần thử)` : ''));
      await refreshClaims(); nav('/admin', { replace: true });
    } catch { setErr('Không kết nối được máy chủ xác thực.'); } finally { setBusy(false); }
  };
  return <div className="grid min-h-full place-items-center bg-gradient-to-br from-vl-navy to-blue-600 p-6"><div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
    <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-vl-navy/10 text-vl-navy"><ShieldCheck size={34} /></div>
    <h1 className="mt-4 text-center text-2xl font-black text-vl-navy">Xác nhận quyền Nhà phát hành</h1><p className="mt-2 text-center text-gray-500">Nhập mã xác nhận để truy cập khu vực quản trị. Phiên có hiệu lực 4 giờ.</p>
    <div className="mt-6 flex items-center gap-3 rounded-2xl border-2 border-gray-300 px-4 focus-within:border-vl-navy"><KeyRound className="text-gray-500" /><input type="password" autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && code && void go()} placeholder="Mã xác nhận" className="w-full bg-transparent py-4 text-lg outline-none" /></div>
    {err && <p className="mt-3 text-sm font-bold text-red-600">{err}</p>}
    <button onClick={() => void go()} disabled={busy || !code} className="mt-5 h-14 w-full rounded-2xl bg-vl-navy text-lg font-black text-white disabled:opacity-50">{busy ? 'Đang kiểm tra…' : 'XÁC NHẬN'}</button>
    <button onClick={() => nav('/home')} className="mt-3 w-full py-2 font-bold text-gray-500">Để sau</button><button onClick={() => void signOut()} className="w-full py-1 text-sm text-gray-400">Đăng xuất</button></div></div>;
}
