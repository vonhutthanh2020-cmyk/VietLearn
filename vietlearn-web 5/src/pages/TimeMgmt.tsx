import { useState } from 'react';
import { addDoc, deleteDoc, doc, query, updateDoc, writeBatch } from 'firebase/firestore';
import { CalendarDays, History, MoreVertical, Plus, Trash2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { useQ, userCol } from '../lib/db';
import { useAuth } from '../auth/AuthContext';
import { Btn, Inp } from '../lib/ui';

const z = (n: number) => String(n).padStart(2, '0'); const key = (d: Date) => `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
const DN = ['T.2', 'T.3', 'T.4', 'T.5', 'T.6', 'T.7', 'CN'];
/** TimeManagementScreen (ảnh chụp 5): dải tuần, thẻ tiến độ hôm nay, lộ trình theo ngày. Lưu users/{uid}/timeTasks. */
export default function TimeMgmt() {
  const { user } = useAuth(); const [sel, setSel] = useState(new Date()); const [open, setOpen] = useState(false); const [menu, setMenu] = useState(false); const [t, setT] = useState(''); const [tm, setTm] = useState('08:00'); const [du, setDu] = useState(30);
  const all = useQ(user ? query(userCol(user.uid, 'timeTasks')) : null, 'tt'); const k = key(sel);
  const list = all.filter((x) => x.date === k).sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
  const mon = new Date(sel); mon.setDate(sel.getDate() - ((sel.getDay() + 6) % 7)); const week = Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; });
  const done = list.filter((x) => x.isCompleted), pct = list.length ? Math.round((done.length / list.length) * 100) : 0, mins = done.reduce((s, x) => s + (parseInt(x.duration) || 0), 0);
  const add = async () => { if (!user || !t.trim()) return; await addDoc(userCol(user.uid, 'timeTasks'), { userId: user.uid, title: t.trim(), date: k, startTime: tm, duration: du, isCompleted: false, color: '#E91E63', createdAt: Date.now() }); setT(''); setOpen(false); };
  const clearDone = async () => { if (!user) return; const b = writeBatch(db); all.filter((x) => x.isCompleted).forEach((x) => b.delete(doc(db, 'users', user.uid, 'timeTasks', x.id))); await b.commit(); setMenu(false); };
  return (
    <div className="relative min-h-full bg-[#FCF8FA] pb-32">
      <div className="flex items-center justify-between px-4 pt-3"><div><h1 className="text-2xl font-black">Tháng {sel.getMonth() + 1}</h1><p className="text-gray-500">{sel.getFullYear()}</p></div>
        <div className="relative flex items-center gap-5"><button onClick={() => setSel(new Date())} aria-label="Hôm nay"><CalendarDays size={30} /></button><button onClick={() => setMenu(!menu)} aria-label="Thêm"><MoreVertical /></button>
          {menu && <div className="absolute right-0 top-9 z-10 rounded-2xl bg-white p-2 shadow-xl"><button onClick={() => void clearDone()} className="flex items-center gap-2 whitespace-nowrap px-4 py-3 font-bold"><Trash2 size={18} />Xóa việc đã hoàn thành</button></div>}</div></div>
      <div className="mx-4 mt-4 flex justify-between rounded-[32px] bg-white p-3 shadow">{week.map((d, i) => { const on = key(d) === k; return <button key={i} onClick={() => setSel(d)} className={`grid w-[13%] place-items-center rounded-[24px] py-4 ${on ? 'bg-pink-600 text-white shadow-lg' : ''}`}><span className={`text-sm font-bold ${on ? '' : 'text-gray-500'}`}>{DN[i]}</span><b className="text-2xl">{d.getDate()}</b></button>; })}</div>
      <div className="mx-4 mt-6 rounded-[32px] bg-gradient-to-r from-pink-600 to-pink-400 p-6 text-white shadow-xl"><div className="flex items-start justify-between"><div><p className="text-lg opacity-90">Tiến độ hôm nay</p><p className="text-3xl font-black">{done.length} / {list.length} hoàn thành</p></div><div className="text-right"><p className="text-4xl font-black">{pct}%</p><p className="text-sm opacity-90">{mins} phút đã vượt qua</p></div></div><div className="my-3 h-3 overflow-hidden rounded-full bg-white/30"><div className="h-full rounded-full bg-white" style={{ width: pct + '%' }} /></div><p className="font-bold">{pct === 100 && list.length ? 'Tuyệt vời! Bạn đã hoàn thành tất cả.' : 'Hãy kiên trì, thành công đang chờ bạn!'}</p></div>
      <h2 className="px-4 pb-2 pt-7 text-[28px] font-black">Lộ trình hôm nay</h2>
      {list.length === 0 ? <div className="mt-16 grid place-items-center text-gray-400"><History size={90} strokeWidth={1.5} /><p className="mt-3 text-2xl">Không có nhiệm vụ nào</p></div> : list.map((x) => <div key={x.id} className="mx-4 mb-3 flex items-center gap-4 rounded-3xl bg-white p-5 shadow"><input type="checkbox" checked={!!x.isCompleted} onChange={(e) => user && void updateDoc(doc(db, 'users', user.uid, 'timeTasks', x.id), { isCompleted: e.target.checked })} className="h-6 w-6 accent-pink-600" /><div className="flex-1"><p className={`text-lg font-black ${x.isCompleted ? 'text-gray-400 line-through' : ''}`}>{x.title}</p><p className="text-sm text-gray-500">{x.startTime} · {parseInt(x.duration) || 0} phút</p></div><button onClick={() => user && void deleteDoc(doc(db, 'users', user.uid, 'timeTasks', x.id))} aria-label="Xóa"><Trash2 size={18} className="text-gray-400" /></button></div>)}
      <button onClick={() => setOpen(true)} aria-label="Thêm nhiệm vụ" className="fixed bottom-28 right-6 z-10 grid h-[72px] w-[72px] place-items-center rounded-full bg-pink-600 text-white shadow-xl"><Plus size={34} /></button>
      {open && <div className="fixed inset-0 z-20 grid items-end bg-black/40" onClick={() => setOpen(false)}><div onClick={(e) => e.stopPropagation()} className="mx-auto w-full max-w-3xl rounded-t-[32px] bg-white p-6"><h3 className="mb-4 text-xl font-black">Nhiệm vụ mới · {sel.toLocaleDateString('vi-VN')}</h3><Inp placeholder="Bạn cần làm gì?" value={t} onChange={(e) => setT(e.target.value)} /><div className="grid grid-cols-2 gap-3"><Inp type="time" value={tm} onChange={(e) => setTm(e.target.value)} /><Inp type="number" min={5} placeholder="Phút" value={du} onChange={(e) => setDu(+e.target.value || 0)} /></div><Btn c="#E91E63" onClick={() => void add()}>THÊM NHIỆM VỤ</Btn></div></div>}
    </div>
  );
}
