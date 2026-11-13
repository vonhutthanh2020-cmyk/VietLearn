import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../auth/AuthContext';
import { dt, effStatus, STATUS_LABEL } from '../lib/mod';

/** Hiện khi tài khoản đang bị đình chỉ / cấm / đã xóa. Nếu quyết định cho phép, người dùng gửi yêu cầu xem xét lại. */
export default function Blocked() {
  const { profile: p, user, signOut } = useAuth(); const s = p?.sanction; const st = effStatus(p); const [t, setT] = useState(''); const [ok, setOk] = useState(false);
  const send = async () => { if (!user || !t.trim()) return; await addDoc(collection(db, 'supportRequests'), { uid: user.uid, content: `[Khiếu nại quyết định xử lý] ${t.trim()}`, status: 'pending', createdAt: serverTimestamp() }); setOk(true); };
  return <div className="grid min-h-full place-items-center bg-slate-100 p-6"><div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">
    <h1 className="text-2xl font-black text-red-600">Tài khoản {STATUS_LABEL[st]?.toLowerCase()}</h1>
    {s && <div className="mt-4 space-y-1 text-[#37474F]"><p><b>Lý do:</b> {s.reason}</p><p><b>Thời hạn:</b> {s.until ? `đến ${dt(s.until)}` : 'không thời hạn'}</p></div>}
    {st === 'DELETED' && <p className="mt-4 text-gray-600">Tài khoản này đã bị xóa khỏi hệ thống.</p>}
    {s?.allowAppeal && st !== 'DELETED' && (ok ? <p className="mt-6 rounded-2xl bg-green-50 p-4 font-bold text-green-700">Đã gửi yêu cầu xem xét lại. Chúng tôi sẽ phản hồi sớm.</p> : <div className="mt-6"><textarea value={t} onChange={(e) => setT(e.target.value)} rows={4} placeholder="Nội dung đề nghị xem xét lại…" className="w-full rounded-2xl border-2 border-gray-200 p-4 outline-none focus:border-vl-navy" /><button onClick={() => void send()} disabled={!t.trim()} className="mt-3 h-12 w-full rounded-2xl bg-vl-navy font-black text-white disabled:opacity-50">GỬI YÊU CẦU XEM XÉT LẠI</button></div>)}
    <button onClick={() => void signOut()} className="mt-4 h-12 w-full rounded-2xl border-2 font-black">Đăng xuất</button></div></div>;
}
