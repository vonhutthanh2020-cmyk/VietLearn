import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, deleteDoc, doc, limit, orderBy, query, updateDoc } from 'firebase/firestore';
import { Bell, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { fmt, useQ } from '../lib/db';
import { useAuth } from '../auth/AuthContext';
import { Btn, Empty, Head, Inp } from '../lib/ui';

/** Collection MỚI `announcements` (Android chưa dùng): title, content, source ('publisher' | 'app'), authorId, authorName, createdAt, updatedAt. */
const SRC: Record<string, [string, string]> = { publisher: ['Nhà phát hành', '#1A237E'], app: ['Ứng dụng', '#00897B'] };
const Item = ({ a, full }: { a: any; full?: boolean }) => { const nav = useNavigate(); const [l, c] = SRC[a.source] ?? SRC.app; return <div className="mb-3 rounded-3xl bg-slate-50 p-4"><div className="flex items-center justify-between"><span onClick={() => a.source === 'publisher' && a.authorId && nav(`/publisher/${a.authorId}`)} className={`rounded-lg px-3 py-1 text-xs font-black text-white ${a.source === 'publisher' ? 'cursor-pointer' : ''}`} style={{ background: c }}>{l}</span><span className="text-xs text-gray-400">{fmt(a.createdAt)}</span></div><p className="mt-2 text-lg font-black text-[#263238]">{a.title}</p><p className={`mt-1 whitespace-pre-wrap text-gray-600 ${full ? '' : 'line-clamp-2'}`}>{a.content}</p></div>; };

/** Khung thông báo ở cuối Trang chủ. Chỉ tài khoản Nhà phát hành thấy nút Đăng. */
export function AnnouncementBox() {
  const nav = useNavigate(); const { profile, pubSession } = useAuth(); const list = useQ(query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(3)), 'ann');
  return <div className="mt-8 rounded-[40px] bg-white/95 p-6 shadow-xl lg:mt-0 lg:h-full lg:rounded-[28px] lg:border lg:border-slate-200 lg:shadow-sm"><div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-3 text-xl font-black tracking-wide text-vl-navy"><span className="grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-600"><Bell /></span>THÔNG BÁO</h2>{profile?.role === 'publisher' && pubSession && <button onClick={() => nav('/announcements')} className="flex items-center gap-1 rounded-full bg-vl-navy px-4 py-2 text-sm font-black text-white"><Plus size={16} />Đăng</button>}</div>
    {list.length === 0 ? <p className="py-4 text-center text-gray-400">Chưa có thông báo nào.</p> : list.map((a) => <Item key={a.id} a={a} />)}
    <button onClick={() => nav('/announcements')} className="mt-1 flex w-full items-center justify-center gap-1 font-black text-vl-navy">Xem tất cả<ChevronRight size={18} /></button></div>;
}

/** Trang đầy đủ; Nhà phát hành có thêm: đăng, sửa, xóa thông báo. */
export default function Announcements() {
  const { user, profile, pubSession } = useAuth(); const pub = profile?.role === 'publisher' && pubSession; const list = useQ(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')), 'annall');
  const [ed, setEd] = useState<any>(null); const [busy, setBusy] = useState(false);
  const save = async () => { if (!user || !ed?.title?.trim() || !ed?.content?.trim()) return; setBusy(true); const d = { title: ed.title.trim(), content: ed.content.trim(), source: ed.source ?? 'publisher' };
    if (ed.id) await updateDoc(doc(db, 'announcements', ed.id), { ...d, updatedAt: Date.now() }); else await addDoc(collection(db, 'announcements'), { ...d, authorId: user.uid, authorName: profile?.userName ?? '', createdAt: Date.now(), updatedAt: Date.now() }); setBusy(false); setEd(null); };
  return <div className="min-h-full bg-vl-bg pb-28"><Head title="Thông báo" sub="Từ ứng dụng và nhà phát hành" right={pub ? <button onClick={() => setEd({ source: 'publisher', title: '', content: '' })} aria-label="Đăng"><Plus /></button> : undefined} />
    <div className="p-4">{ed && <div className="mb-4 rounded-3xl bg-white p-4 shadow"><select value={ed.source} onChange={(e) => setEd({ ...ed, source: e.target.value })} className="mb-3 w-full rounded-2xl border-2 border-gray-200 p-4"><option value="publisher">Từ nhà phát hành</option><option value="app">Từ ứng dụng</option></select><Inp placeholder="Tiêu đề" value={ed.title} onChange={(e) => setEd({ ...ed, title: e.target.value })} /><Inp area placeholder="Nội dung thông báo" value={ed.content} onChange={(e) => setEd({ ...ed, content: e.target.value })} /><div className="flex gap-3"><Btn disabled={busy} onClick={() => void save()}>{ed.id ? 'LƯU THAY ĐỔI' : 'ĐĂNG THÔNG BÁO'}</Btn><button onClick={() => setEd(null)} className="rounded-2xl border-2 px-6 font-black">Hủy</button></div></div>}
      {list.length === 0 && <Empty t="Chưa có thông báo nào." />}
      {list.map((a) => <div key={a.id}><Item a={a} full />{pub && <div className="-mt-1 mb-4 flex justify-end gap-5 pr-3 text-sm font-bold text-gray-500"><button onClick={() => setEd(a)} className="flex items-center gap-1"><Pencil size={14} />Sửa</button><button onClick={() => confirm('Xóa thông báo này?') && void deleteDoc(doc(db, 'announcements', a.id))} className="flex items-center gap-1 text-red-500"><Trash2 size={14} />Xóa</button></div>}</div>)}</div></div>;
}
