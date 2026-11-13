import { ReactNode, useState } from 'react';
import { addDoc, deleteDoc, doc, query, updateDoc } from 'firebase/firestore';
import { Trash2, Plus } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { track, useQ, userCol } from '../lib/db';
import { Btn, Empty, Head, Inp } from '../lib/ui';
import { db } from '../lib/firebase';

type F = { k: string; l: string; t?: 'text' | 'area' | 'number' | 'date' | 'time' | 'select'; o?: string[]; d?: any };
interface Cfg { title: string; col: string; color: string; fields: F[]; main: (i: any) => string; sub?: (i: any) => string; extra?: (i: any, up: (p: any) => void) => ReactNode; mission?: string }
const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const EM = ['😊 Vui', '😭 Buồn', '😡 Tức giận', '😰 Lo lắng', '😴 Mệt mỏi', '🥰 Hạnh phúc'];
const dd = (ms: number) => new Date(ms).toLocaleDateString('vi-VN');
/** Dữ liệu cá nhân lưu ở users/{uid}/{col} với đúng tên trường của các Entity Room trong app Android (riêng tư theo tài khoản). */
const CFG: Record<string, Cfg> = {
  diary: { title: 'Nhật ký', col: 'diary', color: '#43A047', mission: 'd5', fields: [{ k: 'emotion', l: 'Cảm xúc', t: 'select', o: EM, d: EM[0] }, { k: 'content', l: 'Hôm nay bạn thế nào?', t: 'area' }], main: (i) => i.content, sub: (i) => `${i.emotion} · ${dd(i.date)}` },
  letters: { title: 'Viết thư', col: 'letters', color: '#1E88E5', fields: [{ k: 'recipientType', l: 'Gửi cho', t: 'select', o: ['Bản thân', 'Bạn bè', 'Gia đình', 'Thầy cô', 'Tương lai'], d: 'Bản thân' }, { k: 'content', l: 'Nội dung thư', t: 'area' }], main: (i) => i.content, sub: (i) => `Gửi ${i.recipientType} · ${dd(i.createdAt)}` },
  notes: { title: 'Ghi chú', col: 'notes', color: '#8E24AA', fields: [{ k: 'title', l: 'Tiêu đề' }, { k: 'content', l: 'Nội dung', t: 'area' }], main: (i) => i.title, sub: (i) => i.content, extra: (i, up) => <button onClick={() => up({ isPinned: !i.isPinned })} className="text-sm">{i.isPinned ? '📌 Đã ghim' : 'Ghim'}</button> },
  goals: { title: 'Mục tiêu', col: 'goals', color: '#FB8C00', fields: [{ k: 'title', l: 'Mục tiêu của bạn' }, { k: 'targetValue', l: 'Giá trị đích', t: 'number', d: 100 }], main: (i) => i.title, sub: (i) => `${i.currentValue}/${i.targetValue}${i.isCompleted ? ' · Hoàn thành 🎉' : ''}`, extra: (i, up) => <div className="mt-2"><div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full bg-orange-400" style={{ width: `${Math.min(100, (i.currentValue / i.targetValue) * 100)}%` }} /></div><div className="mt-2 flex gap-2 text-sm"><button onClick={() => up({ currentValue: Math.max(0, i.currentValue - 10), isCompleted: false })}>−10</button><button onClick={() => { const v = Math.min(i.targetValue, i.currentValue + 10); up({ currentValue: v, isCompleted: v >= i.targetValue }); }}>+10</button></div></div> },
  countdown: { title: 'Đếm ngược', col: 'countdowns', color: '#00ACC1', fields: [{ k: 'title', l: 'Sự kiện' }, { k: 'targetDate', l: 'Ngày diễn ra', t: 'date' }], main: (i) => i.title, sub: (i) => { const d = Math.ceil((i.targetDate - Date.now()) / 86400000); return d >= 0 ? `Còn ${d} ngày · ${dd(i.targetDate)}` : `Đã qua ${-d} ngày`; } },
  timetable: { title: 'Lịch học', col: 'timetable', color: '#D81B60', fields: [{ k: 'subject', l: 'Môn học' }, { k: 'dayOfWeek', l: 'Thứ', t: 'select', o: DAYS, d: 'Thứ 2' }, { k: 'startTime', l: 'Bắt đầu', t: 'time', d: '07:00' }, { k: 'endTime', l: 'Kết thúc', t: 'time', d: '07:45' }, { k: 'room', l: 'Phòng học' }], main: (i) => i.subject, sub: (i) => `${DAYS[i.dayOfWeek - 2] ?? ''} · ${i.startTime}–${i.endTime}${i.room ? ' · ' + i.room : ''}` },
  tasks: { title: 'Kế hoạch biểu', col: 'timeTasks', color: '#E53935', fields: [{ k: 'title', l: 'Công việc' }, { k: 'date', l: 'Ngày', t: 'date' }, { k: 'startTime', l: 'Giờ bắt đầu', t: 'time', d: '08:00' }, { k: 'duration', l: 'Thời lượng', d: '30 phút' }], main: (i) => i.title, sub: (i) => `${i.date} · ${i.startTime} · ${i.duration}`, extra: (i, up) => <label className="mt-1 flex items-center gap-2 text-sm"><input type="checkbox" checked={!!i.isCompleted} onChange={(e) => up({ isCompleted: e.target.checked })} />Hoàn thành</label> },
  gratitude: { title: 'Góc biết ơn', col: 'gratitude', color: '#FBC02D', fields: [{ k: 'content', l: 'Hôm nay bạn biết ơn điều gì?', t: 'area' }], main: (i) => i.content, sub: (i) => dd(i.createdAt) },
  perspective: { title: 'Quan điểm', col: 'perspectives', color: '#607D8B', fields: [{ k: 'content', l: 'Quan điểm của bạn', t: 'area' }], main: (i) => i.content, sub: (i) => dd(i.createdAt) }
};
export function Tool({ k }: { k: keyof typeof CFG }) {
  const c = CFG[k]; const { user, profile } = useAuth(); const items = useQ(user ? query(userCol(user.uid, c.col)) : null, c.col).sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  const [open, setOpen] = useState(false); const [v, setV] = useState<Record<string, any>>({});
  const val = (f: F) => v[f.k] ?? f.d ?? '';
  const add = async () => {
    if (!user) return; const data: any = { userId: user.uid, createdAt: Date.now() };
    for (const f of c.fields) { let x: any = val(f); if (f.t === 'number') x = +x || 0; if (f.t === 'date') x = x ? new Date(x).getTime() : Date.now(); if (f.k === 'dayOfWeek') x = DAYS.indexOf(x) + 2; data[f.k] = x; }
    if (!String(data[c.fields[0].k]).trim()) return;
    if (k === 'diary') { data.date = Date.now(); data.backgroundColor = '#FFFFFF'; data.isLocked = false; } if (k === 'goals') { data.currentValue = 0; data.isCompleted = false; } if (k === 'tasks') { data.isCompleted = false; data.color = '#E53935'; data.date = new Date(data.date).toISOString().slice(0, 10); }
    if (k === 'notes') { data.isChecklist = false; data.isPinned = false; data.category = 'General'; data.backgroundColor = '#FFFFFF'; data.updatedAt = Date.now(); } if (k === 'timetable') data.color = '#3498DB';
    await addDoc(userCol(user.uid, c.col), data); if (c.mission) void track(user.uid, c.mission); setV({}); setOpen(false); void profile;
  };
  return (
    <div className="min-h-full bg-vl-bg pb-28"><Head title={c.title} color={c.color} right={<button onClick={() => setOpen(!open)} aria-label="Thêm"><Plus /></button>} />
      <div className="p-4">{open && <div className="mb-4 rounded-3xl bg-white p-4 shadow">{c.fields.map((f) => f.t === 'select' ? <select key={f.k} value={val(f)} onChange={(e) => setV({ ...v, [f.k]: e.target.value })} className="mb-3 w-full rounded-2xl border-2 border-gray-200 p-4">{f.o!.map((o) => <option key={o}>{o}</option>)}</select> : <Inp key={f.k} area={f.t === 'area'} type={f.t === 'area' ? undefined : f.t ?? 'text'} placeholder={f.l} value={val(f)} onChange={(e: any) => setV({ ...v, [f.k]: e.target.value })} />)}<Btn c={c.color} onClick={() => void add()}>LƯU</Btn></div>}
        {items.length === 0 && <Empty t="Chưa có dữ liệu. Nhấn + để thêm." />}
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-4 xl:grid-cols-3">{items.map((i) => <div key={i.id} className="mb-3 rounded-3xl bg-white p-5 shadow"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="whitespace-pre-wrap font-black">{c.main(i)}</p><p className="text-sm text-gray-500">{c.sub?.(i)}</p></div><button onClick={() => user && void deleteDoc(doc(db, 'users', user.uid, c.col, i.id))} aria-label="Xóa"><Trash2 size={18} className="text-gray-400" /></button></div>{c.extra?.(i, (p) => user && void updateDoc(doc(db, 'users', user.uid, c.col, i.id), p))}</div>)}</div></div></div>
  );
}
