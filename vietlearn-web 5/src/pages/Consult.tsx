import { useEffect, useRef, useState } from 'react';
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, setDoc, updateDoc, increment } from 'firebase/firestore';
import { Send } from 'lucide-react';
import { db } from '../lib/firebase';
import { fmt, useQ } from '../lib/db';
import { useAuth } from '../auth/AuthContext';
import { Empty, Head } from '../lib/ui';
import { normSchool } from '../lib/staff';

const G = 'linear-gradient(90deg,#00BFA5,#00796B)';
const LAB: Record<string, string> = { PENDING: 'Đang chờ', ACTIVE: 'Đang trò chuyện', COMPLETED: 'Đã hoàn thành' };
/** PsychologyChatScreen: Consultations/{uid học sinh}, tin nhắn ở Messages (TinNhan). Học sinh chỉ gửi 1 tin khi còn PENDING. */
export default function Consult() {
  const { user, profile } = useAuth(); const teacher = profile?.role === 'teacher'; const [sel, setSel] = useState<string | null>(null);
  const mySchool = normSchool(profile?.schoolId);
  // Giống Android: phòng của trường mình + phòng "CHUNG" + phòng trống; PENDING hoặc ACTIVE do mình phụ trách và chưa bấm Hoàn thành.
  const rooms = useQ(teacher ? query(collection(db, 'Consultations')) : null, 'rooms-' + mySchool)
    .filter((r) => [mySchool, 'CHUNG', ''].includes(String(r.schoolId ?? '').trim().toUpperCase()) && (r.status === 'PENDING' || (r.status === 'ACTIVE' && r.teacherId === user?.uid && !r.teacherCompleted)))
    .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
  const roomId = teacher ? sel : user?.uid ?? null; const [room, setRoom] = useState<any>(null); const [msgs, setMsgs] = useState<any[]>([]); const [t, setT] = useState(''); const [anon, setAnon] = useState(true); const end = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!roomId) return; const a = onSnapshot(doc(db, 'Consultations', roomId), (s) => setRoom(s.exists() ? { ...s.data(), id: s.id } : null)); const b = onSnapshot(query(collection(db, 'Consultations', roomId, 'Messages'), orderBy('thoiGian', 'asc')), (s) => setMsgs(s.docs.map((d) => d.data()))); return () => { a(); b(); }; }, [roomId]);
  useEffect(() => end.current?.scrollIntoView(), [msgs.length]);
  const create = async (ano: boolean) => { if (!user || !profile) return; setAnon(ano); await setDoc(doc(db, 'Consultations', user.uid), { id: user.uid, studentName: ano ? 'Học sinh ẩn danh' : profile.userName, studentId: user.uid, studentAvatar: null, teacherId: '', schoolId: normSchool(profile.schoolId), status: 'PENDING', lastMessage: 'Học sinh vừa tạo phòng...', timestamp: Date.now(), studentCompleted: false, teacherCompleted: false, rating: 0, feedback: '' }); };
  const send = async () => { if (!room || !t.trim() || !user) return; if (!teacher && room.status === 'PENDING' && msgs.length > 0) return alert('Vui lòng chờ giáo viên nhận yêu cầu.');
    await addDoc(collection(db, 'Consultations', room.id, 'Messages'), { idNguoiGui: user.uid, noiDung: t.trim(), thoiGian: Date.now(), anDanh: anon && !teacher, isGiaoVien: teacher }); await updateDoc(doc(db, 'Consultations', room.id), { lastMessage: t.trim(), timestamp: Date.now() }); setT(''); };
  const accept = async () => { if (user && room) await updateDoc(doc(db, 'Consultations', room.id), { status: 'ACTIVE', teacherId: user.uid, timestamp: Date.now() }); };
  const finish = async () => { if (!room) return; const f = teacher ? 'teacherCompleted' : 'studentCompleted'; await updateDoc(doc(db, 'Consultations', room.id), { [f]: true }); const s = (await getDoc(doc(db, 'Consultations', room.id))).data(); if (s?.studentCompleted && s?.teacherCompleted) await updateDoc(doc(db, 'Consultations', room.id), { status: 'COMPLETED' }); if (teacher) setSel(null); };
  const rate = async (n: number) => { if (!room) return; await updateDoc(doc(db, 'Consultations', room.id), { rating: n }); if (room.teacherId) await updateDoc(doc(db, 'users', room.teacherId), { xp: increment(200) }); };

  const listPane = <div className="min-h-full bg-[#EAF6F4]"><Head title="Yêu cầu Tư vấn" sub="Hỗ trợ tâm lý học đường" color={G} /><div className="p-4"><p className="mb-3 text-center text-xs text-teal-800/70">Mã trường của bạn: <b>{mySchool}</b> (xem cả phòng CHUNG)</p>{rooms.length === 0 && <Empty t="Chưa có yêu cầu tư vấn nào." />}
    {rooms.map((r) => <button key={r.id} onClick={() => setSel(r.id)} className="mb-3 flex w-full items-center gap-4 rounded-[32px] bg-white p-5 text-left shadow"><span className="grid h-16 w-16 place-items-center rounded-full bg-orange-50 text-2xl font-black text-teal-500">{(r.studentName || 'A')[0]}</span><span className="flex-1"><b className="block text-xl">{r.studentName}</b><span className="text-gray-500">{r.lastMessage || 'Học sinh vừa tạo phòng...'}</span><span className="block font-black text-orange-500">Trạng thái: {LAB[r.status]}</span></span>›</button>)}</div></div>;
  if (!teacher && !room) return <div className="min-h-full bg-[#EAF6F4]"><Head title="Góc Sẻ Chia" sub="Hỗ trợ tâm lý học đường" color={G} /><div className="grid place-items-center p-10 text-center"><div className="mt-24 text-7xl text-teal-500">🧠</div><p className="mt-8 text-2xl font-black">Chào bạn, bạn có chuyện gì muốn chia sẻ không?</p>
    <button onClick={() => void create(false)} className="mt-8 rounded-full bg-teal-500 px-10 py-4 text-lg font-bold text-white">Tạo yêu cầu tư vấn</button><button onClick={() => void create(true)} className="mt-6 text-lg text-gray-500">Gửi yêu cầu ẩn danh</button></div></div>;
  const chat = (
    <div className="flex h-full flex-col bg-[#EAF6F4]"><Head title={teacher ? room?.studentName ?? '' : 'Góc Sẻ Chia'} sub={`Trạng thái: ${LAB[room?.status] ?? ''}`} color={G} right={<>{teacher && room?.status === 'PENDING' && <button onClick={() => void accept()} className="rounded-full bg-white px-4 py-1 text-sm font-black text-teal-700">Nhận</button>}<button onClick={() => void finish()} className="ml-2 text-sm font-bold">Hoàn thành</button></>} />
      <div className="flex-1 overflow-y-auto p-4">{msgs.length === 0 && <p className="mt-6 text-center text-xl font-bold text-teal-500">Phòng đã tạo. Hãy gửi tin nhắn đầu tiên để giáo viên biết vấn đề của bạn nhé!</p>}
        {msgs.map((m, i) => { const mine = m.idNguoiGui === user?.uid; return <div key={i} className={`mb-3 flex ${mine ? 'justify-end' : ''}`}><div className={`max-w-[80%] rounded-3xl px-5 py-3 ${mine ? 'bg-teal-500 text-white' : 'bg-white'}`}>{m.noiDung}<p className="mt-1 text-[10px] opacity-60">{m.isGiaoVien ? 'Giáo viên' : m.anDanh ? 'Ẩn danh' : 'Học sinh'} · {fmt(m.thoiGian)}</p></div></div>; })}
        <p className="mt-6 text-center text-gray-400">Mọi chia sẻ của bạn đều được bảo mật tuyệt đối. Hãy thoải mái tâm sự để được thấu hiểu nhé!</p>
        {!teacher && room?.status !== 'PENDING' && room?.teacherCompleted && !room?.rating && <div className="mt-4 rounded-2xl bg-white p-4 text-center"><p className="font-bold">Đánh giá buổi tư vấn</p>{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => void rate(n)} className="text-3xl">⭐</button>)}</div>}<div ref={end} /></div>
      <div className="rounded-t-[32px] bg-white p-4">{!teacher && <button onClick={() => setAnon(!anon)} className="mb-2 text-sm text-gray-500">Danh tính: <b className="rounded-full bg-red-50 px-3 py-1 text-red-600">{anon ? 'Ẩn danh' : 'Công khai'}</b></button>}
        <div className="flex gap-2"><input value={t} onChange={(e) => setT(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && void send()} placeholder="Hãy chia sẻ những gì bạn đang nghĩ…" className="flex-1 rounded-full border px-5 py-3 outline-none" /><button onClick={() => void send()} aria-label="Gửi" className="grid h-12 w-12 place-items-center rounded-full bg-teal-500 text-white"><Send size={20} /></button></div></div>
    </div>
  );
  if (teacher) return (
    <div className="h-full lg:grid lg:grid-cols-[380px_1fr]">
      <div className={`h-full overflow-y-auto border-slate-200 lg:border-r ${sel ? 'hidden lg:block' : ''}`}>{listPane}</div>
      <div className={`h-full ${sel ? '' : 'hidden lg:grid lg:place-items-center'}`}>{sel ? chat : <p className="text-gray-400">Chọn một yêu cầu ở bên trái để bắt đầu trò chuyện.</p>}</div>
    </div>
  );
  return chat;
}
