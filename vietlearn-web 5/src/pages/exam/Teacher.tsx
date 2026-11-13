import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { BarChart3, BookOpen, CircleMinus, CirclePlus, ClipboardList, Copy, FileText, UserPlus, Users } from 'lucide-react';
import { db } from '../../lib/firebase';
import { useAuth } from '../../auth/AuthContext';
import { Exam, Participant, Question, Submission } from '../../types';
import { Field, TopBar, fmtTime, score1 } from './ui';

const ST: Record<string, string> = { WAITING: 'Chờ', ONGOING: 'Đang diễn ra', FINISHED: 'Đã kết thúc' };
const copy = (t: string) => void navigator.clipboard?.writeText(t);
const useExam = (id: string) => { const [e, setE] = useState<Exam | null>(null); useEffect(() => onSnapshot(doc(db, 'exams', id), (s) => setE(s.exists() ? (s.data() as Exam) : null)), [id]); return e; };
const Box = ({ children, t }: { children: React.ReactNode; t?: string }) => <div className="mb-5 rounded-[32px] bg-white p-6 shadow">{t && <h3 className="mb-4 text-xl font-black text-vl-maroon">{t}</h3>}{children}</div>;

/** TeacherExamListScreen: exams where teacherId == uid (không orderBy, như Android). */
export function TeacherExamList() {
  const { user } = useAuth(); const nav = useNavigate(); const [l, setL] = useState<Exam[]>([]);
  useEffect(() => { if (!user) return; return onSnapshot(query(collection(db, 'exams'), where('teacherId', '==', user.uid)), (s) => setL(s.docs.map((d) => d.data() as Exam).sort((a, b) => (b.createdAt?.toDate().getTime() ?? 0) - (a.createdAt?.toDate().getTime() ?? 0)))); }, [user]);
  return (
    <div className="relative min-h-full bg-vl-bg"><TopBar title="Quản lý kiểm tra" />
      <div className="p-4">{l.length === 0 && <p className="mt-10 text-center text-gray-500">Chưa có bài kiểm tra nào.</p>}
        <div className="lg:grid lg:grid-cols-2 lg:gap-4 xl:grid-cols-3">{l.map((e) => (<div key={e.id} className="mb-4 lg:mb-0 rounded-[32px] bg-white p-6 shadow">
          <div className="flex items-center justify-between"><span className={`rounded-xl px-4 py-2 text-sm font-black ${e.type === 'LIVE' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>{e.type === 'LIVE' ? 'TRỰC TIẾP' : 'BÀI TẬP'}</span><span className="text-gray-500">{ST[e.status] ?? e.status}</span></div>
          <h2 className="mt-4 text-2xl font-black">{e.title}</h2><p className="text-lg text-gray-500">{e.subject}</p>
          <div className="mt-6 flex items-end justify-between"><div><p className="text-sm text-gray-400">Mã phòng</p><p className="flex items-center gap-3 text-2xl font-black tracking-wide text-vl-navy">{e.roomCode}<button onClick={() => copy(e.roomCode)} aria-label="Sao chép"><Copy size={22} className="text-gray-700" /></button></p></div>
            <button onClick={() => nav(`/exam-room/${e.id}`)} className="rounded-3xl bg-vl-maroon px-8 py-4 text-lg font-bold text-white">Quản lý</button></div></div>))}</div></div>
      <button onClick={() => nav('/create-exam')} aria-label="Tạo bài" className="fixed bottom-28 right-6 grid h-20 w-20 place-items-center rounded-3xl bg-vl-maroon text-white shadow-xl"><UserPlus size={30} /></button></div>
  );
}

/** CreateExamScreen: tạo exams/{id} với đúng các trường của ExamRepository.createExam. */
export function CreateExam() {
  const { user } = useAuth(); const nav = useNavigate(); const [t, setT] = useState(''); const [sub, setSub] = useState(''); const [d, setD] = useState(''); const [type, setType] = useState('LIVE'); const [busy, setBusy] = useState(false);
  const go = async () => {
    if (!user || !t.trim()) return; setBusy(true);
    const ref = doc(collection(db, 'exams'));
    await setDoc(ref, { id: ref.id, title: t.trim(), subject: sub.trim(), description: d.trim(), teacherId: user.uid, type, durationMinutes: 0, maxAttempts: 1, maxParticipants: 0, showScore: true, showAnswers: false, showSolutions: false, status: 'WAITING', roomCode: String(100000 + Math.floor(Math.random() * 900000)), roomPasswordHash: '', createdAt: serverTimestamp() });
    nav(`/exam-settings/${ref.id}`, { replace: true });
  };
  return (
    <div className="min-h-full bg-vl-bg"><TopBar title="Tạo bài kiểm tra" /><div className="p-5">
      <Box t="Thông tin cơ bản"><Field label="Tên bài kiểm tra" icon={<ClipboardList />} value={t} onChange={(e) => setT(e.target.value)} /><Field label="Môn học" icon={<BookOpen />} value={sub} onChange={(e) => setSub(e.target.value)} /><Field label="Mô tả" icon={<FileText />} value={d} onChange={(e) => setD(e.target.value)} /></Box>
      <Box t="Loại kiểm tra"><div className="grid grid-cols-2 gap-4">{([['LIVE', 'Trực tiếp', 'Làm bài tại lớp'], ['HOMEWORK', 'BTVN', 'Về nhà làm']] as const).map(([k, a, b]) => <button key={k} onClick={() => setType(k)} className={`rounded-3xl border-2 py-6 ${type === k ? 'border-transparent bg-[#EADDFF] text-vl-maroon' : 'border-gray-200'}`}><b className="block text-xl">{a}</b><span className="text-gray-500">{b}</span></button>)}</div></Box>
      <button onClick={go} disabled={busy || !t.trim()} className="h-20 w-full rounded-full bg-vl-maroon text-lg font-black text-white disabled:opacity-50">TẠO VÀ THIẾT LẬP CHI TIẾT</button></div></div>
  );
}

/** ExamSettingsScreen: tab Thiết lập (steppers + công tắc) và tab Câu hỏi. Tải file đề (Storage) chưa làm. */
export function ExamSettings() {
  const { examId = '' } = useParams(); const e = useExam(examId); const [tab, setTab] = useState(0); const [qs, setQs] = useState<Question[]>([]);
  const [qt, setQt] = useState(''); const [op, setOp] = useState(['', '', '', '']); const [ok, setOk] = useState(0); const [pt, setPt] = useState(1);
  useEffect(() => onSnapshot(collection(db, 'exams', examId, 'questions'), (s) => setQs(s.docs.map((d) => d.data() as Question).sort((a, b) => a.order - b.order))), [examId]);
  if (!e) return <p className="p-6">Đang tải...</p>;
  const up = (p: Partial<Exam>) => void updateDoc(doc(db, 'exams', examId), p);
  const Step = ({ l, k, min }: { l: string; k: 'durationMinutes' | 'maxAttempts' | 'maxParticipants'; min: number }) => <div className="flex items-center justify-between py-4"><span className="text-xl">{l}</span><span className="flex items-center gap-4"><button onClick={() => up({ [k]: Math.max(min, e[k] - 1) })}><CircleMinus size={34} /></button><b className="w-8 text-center text-xl">{e[k]}</b><button onClick={() => up({ [k]: e[k] + 1 })}><CirclePlus size={34} /></button></span></div>;
  const Sw = ({ l, k }: { l: string; k: 'showScore' | 'showAnswers' | 'showSolutions' }) => <div className="flex items-center justify-between py-4"><span className="text-xl">{l}</span><button onClick={() => up({ [k]: !e[k] })} className={`h-9 w-16 rounded-full p-1 ${e[k] ? 'bg-vl-maroon' : 'border-2 border-gray-500 bg-gray-200'}`}><span className={`block h-7 w-7 rounded-full bg-white shadow transition ${e[k] ? 'translate-x-7' : ''}`} /></button></div>;
  const add = async () => { if (!qt.trim() || op.some((o) => !o.trim())) return; const r = doc(collection(db, 'exams', examId, 'questions')); await setDoc(r, { id: r.id, questionText: qt.trim(), options: op.map((o) => o.trim()), correctAnswer: ok, questionType: 'MULTIPLE_CHOICE', points: pt, order: qs.length }); setQt(''); setOp(['', '', '', '']); setOk(0); };
  void addDoc;
  return (
    <div className="min-h-full bg-vl-bg"><TopBar title={e.title} />
      <div className="flex bg-white text-xl font-black text-vl-maroon">{['Thiết lập', `Câu hỏi (${qs.length})`].map((n, i) => <button key={n} onClick={() => setTab(i)} className={`flex-1 border-b-4 py-5 ${tab === i ? 'border-vl-maroon' : 'border-gray-200'}`}>{n}</button>)}</div>
      <div className="p-5">{tab === 0 ? (<>
        <Box><p className="mb-1 font-bold text-gray-500">Thời gian &amp; Lượt làm</p><Step l="Thời gian làm bài (phút)" k="durationMinutes" min={0} /><Step l="Số lần làm bài tối đa" k="maxAttempts" min={1} /><Step l="Số lượng học sinh tối đa" k="maxParticipants" min={0} /></Box>
        <Box><p className="mb-1 font-bold text-gray-500">Tùy chọn hiển thị</p><Sw l="Hiển thị điểm khi nộp bài" k="showScore" /><Sw l="Hiển thị đáp án đúng" k="showAnswers" /><Sw l="Hiển thị lời giải chi tiết" k="showSolutions" /></Box></>) : (<>
        <Box t="Thêm câu hỏi"><Field label="Nội dung câu hỏi" value={qt} onChange={(x) => setQt(x.target.value)} />
          {op.map((o, i) => <div key={i} className="flex items-center gap-3"><input type="radio" name="ok" checked={ok === i} onChange={() => setOk(i)} className="h-5 w-5 accent-[#800000]" /><div className="flex-1"><Field label={`Đáp án ${'ABCD'[i]}${ok === i ? ' (đúng)' : ''}`} value={o} onChange={(x) => setOp(op.map((v, k) => (k === i ? x.target.value : v)))} /></div></div>)}
          <Field label="Điểm" type="number" value={pt} onChange={(x) => setPt(Math.max(1, +x.target.value || 1))} /><button onClick={() => void add()} className="h-14 w-full rounded-2xl bg-vl-maroon font-black text-white">THÊM CÂU HỎI</button></Box>
        {qs.map((q, i) => <div key={q.id} className="mb-3 rounded-3xl bg-white p-5 shadow"><p className="font-black">Câu {i + 1}. {q.questionText}</p>{q.options.map((o, k) => <p key={k} className={`mt-1 ${k === q.correctAnswer ? 'font-bold text-green-700' : 'text-gray-600'}`}>{'ABCD'[k]}. {o}</p>)}</div>)}</>)}</div></div>
  );
}

/** ExamRoomScreen: mã phòng, trạng thái WAITING → ONGOING → FINISHED, lối vào Thí sinh / Kết quả. */
export function ExamRoom() {
  const { examId = '' } = useParams(); const nav = useNavigate(); const e = useExam(examId);
  if (!e) return <p className="p-6">Đang tải...</p>;
  const set = (status: string) => void updateDoc(doc(db, 'exams', examId), { status });
  return (
    <div className="min-h-full bg-vl-bg"><TopBar title="Phòng kiểm tra" right={<button onClick={() => nav(`/exam-settings/${examId}`)} className="text-sm font-black text-vl-maroon">THIẾT LẬP</button>} /><div className="p-5">
      <div className="mb-5 rounded-[36px] bg-white p-8 text-center shadow"><p className="text-lg text-gray-500">Mã phòng tham gia</p><p className="my-2 text-6xl font-black tracking-[0.15em] text-vl-maroon">{e.roomCode}</p>
        <button onClick={() => copy(e.roomCode)} className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-8 py-3 font-black text-blue-700"><Copy size={18} />SAO CHÉP MÃ</button></div>
      <Box><h3 className="text-2xl font-black text-gray-500">Trạng thái phòng</h3><p className="my-5 flex items-center gap-4 text-2xl font-black"><span className={`h-4 w-4 rounded-full ${e.status === 'ONGOING' ? 'bg-green-500' : 'bg-gray-400'}`} />{e.status === 'WAITING' ? 'Đang chờ học sinh...' : e.status === 'ONGOING' ? 'Đang diễn ra' : 'Đã kết thúc'}</p>
        {e.status === 'WAITING' && <button onClick={() => set('ONGOING')} className="h-16 w-full rounded-full bg-green-700 text-lg font-black text-white">BẮT ĐẦU KIỂM TRA</button>}
        {e.status === 'ONGOING' && <button onClick={() => set('FINISHED')} className="h-16 w-full rounded-full bg-red-700 text-lg font-black text-white">KẾT THÚC KIỂM TRA</button>}</Box>
      <div className="grid grid-cols-2 gap-5">{([['Thí sinh', <Users />, 'exam-participants'], ['Kết quả', <BarChart3 />, 'exam-submissions']] as const).map(([l, ic, to]) => <button key={l} onClick={() => nav(`/${to}/${examId}`)} className="grid h-32 place-items-center rounded-[28px] border-2 border-gray-400 font-black text-vl-maroon [&_svg]:h-8 [&_svg]:w-8"><span className="grid place-items-center gap-1">{ic}<span className="text-xl">{l}</span></span></button>)}</div></div></div>
  );
}

export function ExamParticipants() {
  const { examId = '' } = useParams(); const [l, setL] = useState<Participant[]>([]);
  useEffect(() => onSnapshot(collection(db, 'exams', examId, 'participants'), (s) => setL(s.docs.map((d) => d.data() as Participant))), [examId]);
  const lab: Record<string, string> = { NOT_STARTED: 'Chưa bắt đầu', DOING: 'Đang làm bài', SUBMITTED: 'Đã nộp' };
  return <div className="min-h-full bg-vl-bg"><TopBar title="Thí sinh" sub={`${l.length} thí sinh`} /><div className="p-4">{l.length === 0 && <p className="mt-10 text-center text-gray-500">Chưa có thí sinh nào vào phòng.</p>}{l.map((p) => <div key={p.uid} className="mb-3 flex items-center justify-between rounded-3xl bg-white p-5 shadow"><div><p className="text-xl font-black">{p.studentName}</p><p className="text-gray-500">MSHS: {p.studentCode}</p></div><span className="text-right text-sm font-bold text-gray-500">{lab[p.status] ?? p.status}<br />Lần làm: {p.attemptsUsed}</span></div>)}</div></div>;
}

export function ExamSubmissions() {
  const { examId = '' } = useParams(); const [l, setL] = useState<Submission[]>([]);
  useEffect(() => onSnapshot(collection(db, 'exams', examId, 'submissions'), (s) => setL(s.docs.map((d) => d.data() as Submission).filter((x) => x.status === 'SUBMITTED').sort((a, b) => (b.submittedAt?.toDate().getTime() ?? 0) - (a.submittedAt?.toDate().getTime() ?? 0)))), [examId]);
  return <div className="min-h-full bg-vl-bg"><TopBar title="Kết quả bài làm" sub={`${l.length} bài đã nộp`} /><div className="p-4">{l.map((s) => <div key={s.id} className="mb-3 flex items-center justify-between rounded-[32px] bg-white p-6 shadow"><div><p className="text-2xl font-black">{s.studentName}</p><p className="text-lg text-gray-500">MSHS: {s.studentCode}</p><p className="mt-3 flex items-center gap-4"><span className="rounded-xl bg-gray-100 px-4 py-2 font-black">Lần làm: {s.attemptNumber}</span><span className="text-gray-500">Nộp lúc: {fmtTime(s.submittedAt)}</span></p></div><div className="text-center"><p className="text-sm font-black text-gray-500">ĐIỂM</p><p className="text-5xl font-black text-green-700">{score1(s.score)}</p></div></div>)}</div></div>;
}
