import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, increment, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { ArrowLeft, ArrowRight, CreditCard, DoorOpen, KeyRound, Timer, User } from 'lucide-react';
import { db } from '../../lib/firebase';
import { useAuth } from '../../auth/AuthContext';
import { Exam, Question, Submission } from '../../types';
import { Field, TopBar, score1 } from './ui';

const bg = { backgroundImage: 'url(/assets/img_09.webp)' };
const Glass = ({ children }: { children: React.ReactNode }) => <div className="h-full bg-cover bg-center" style={bg}><div className="flex h-full flex-col">{children}</div></div>;
const Err = ({ m }: { m: string }) => (m ? <p className="mt-3 text-center text-sm font-bold text-red-600">{m}</p> : null);

/** JoinExamScreen: tìm phòng theo roomCode; mật khẩu so khớp thẳng với roomPasswordHash (giống StudentExamViewModel.findExam). */
export function JoinExam() {
  const nav = useNavigate(); const [code, setCode] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const go = async () => {
    setErr(''); setBusy(true);
    try {
      const s = await getDocs(query(collection(db, 'exams'), where('roomCode', '==', code.trim())));
      const e = s.docs[0]?.data() as Exam | undefined;
      if (!e) setErr('Phòng kiểm tra không tồn tại.'); else if (e.status === 'FINISHED') setErr('Bài kiểm tra này đã kết thúc.'); else if (e.roomPasswordHash !== pw) setErr('Mật khẩu phòng không chính xác.'); else nav(`/student-info/${s.docs[0].id}`);
    } catch (x) { setErr('Lỗi: ' + ((x as Error).message || x)); } finally { setBusy(false); }
  };
  return (
    <Glass><TopBar light title="Tham gia kiểm tra" />
      <div className="flex flex-1 items-center px-4"><div className="w-full rounded-[32px] bg-[#F2F2F2] p-8 shadow-xl">
        <h2 className="text-center text-3xl font-black text-vl-navy">Nhập thông tin phòng</h2><p className="mb-8 mt-3 text-center text-lg text-gray-500">Vui lòng nhập đúng mã 6 ký tự và mật khẩu do giáo viên cung cấp.</p>
        <Field label="Mã phòng (6 số)" icon={<DoorOpen />} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" />
        <Field label="Mật khẩu phòng" icon={<KeyRound />} type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <button onClick={go} disabled={busy || code.length < 6} className="mt-4 h-16 w-full rounded-full bg-vl-navy text-lg font-black text-white disabled:opacity-60">{busy ? '…' : 'VÀO PHÒNG'}</button><Err m={err} /></div></div>
    </Glass>
  );
}

/** StudentInfoScreen: kiểm tra giới hạn học sinh và số lần làm, tạo participants/{uid} rồi tạo submission (như StudentExamViewModel). */
export function StudentInfo() {
  const { examId = '' } = useParams(); const nav = useNavigate(); const { profile, user } = useAuth();
  const [name, setName] = useState(profile?.userName ?? ''); const [sid, setSid] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const start = async () => {
    if (!user || !name.trim() || !sid.trim()) return setErr('Vui lòng nhập đủ họ tên và mã học sinh.');
    setErr(''); setBusy(true);
    try {
      const ex = (await getDoc(doc(db, 'exams', examId))).data() as Exam; const pRef = doc(db, 'exams', examId, 'participants', user.uid); const pd = await getDoc(pRef);
      if (ex.maxParticipants > 0 && !pd.exists() && (await getDocs(collection(db, 'exams', examId, 'participants'))).size >= ex.maxParticipants) return setErr('Phòng thi đã đủ số lượng học sinh.');
      const used = (pd.data()?.attemptsUsed as number) ?? 0;
      if (used >= ex.maxAttempts) return setErr('Bạn đã hết số lần làm bài.');
      await setDoc(pRef, { id: user.uid, studentName: name.trim(), studentCode: sid.trim(), uid: user.uid, joinedAt: serverTimestamp(), status: 'DOING', attemptsUsed: used }, { merge: true });
      const sRef = doc(collection(db, 'exams', examId, 'submissions'));
      await setDoc(sRef, { id: sRef.id, studentName: name.trim(), studentCode: sid.trim(), uid: user.uid, attemptNumber: used + 1, answers: {}, score: 0, startedAt: serverTimestamp(), status: 'IN_PROGRESS' });
      nav(`/exam/${examId}/${sRef.id}`, { replace: true });
    } catch (x) { setErr('Lỗi: ' + ((x as Error).message || x)); } finally { setBusy(false); }
  };
  return (
    <Glass><TopBar light title="Thông tin thí sinh" />
      <div className="flex flex-1 items-center px-4"><div className="w-full rounded-[32px] bg-[#F8F8F8] p-8 shadow-xl">
        <h2 className="text-3xl font-black text-vl-navy">Xác nhận danh tính</h2><p className="mb-8 mt-1 text-lg text-gray-500">Kiểm tra năng lực học tập</p>
        <Field label="Họ và tên" icon={<User />} value={name} onChange={(e) => setName(e.target.value)} />
        <Field label="Mã học sinh / SBD" icon={<CreditCard />} value={sid} onChange={(e) => setSid(e.target.value)} />
        <button onClick={start} disabled={busy} className="mt-4 h-16 w-full rounded-full bg-vl-navy text-lg font-black text-white disabled:opacity-60">{busy ? '…' : 'BẮT ĐẦU LÀM BÀI'}</button><Err m={err} /></div></div>
    </Glass>
  );
}

/** ExamScreen: lưu đáp án từng câu, đếm giờ theo durationMinutes (0 = không giới hạn), chấm điểm = số câu đúng / tổng × 10. */
export function ExamDoing() {
  const { examId = '', subId = '' } = useParams(); const nav = useNavigate(); const { user } = useAuth();
  const [ex, setEx] = useState<Exam | null>(null); const [qs, setQs] = useState<Question[]>([]); const [ans, setAns] = useState<Record<string, number>>({}); const [i, setI] = useState(0); const [left, setLeft] = useState(0); const [err, setErr] = useState('');
  const done = useRef(false); const ansRef = useRef(ans); ansRef.current = ans; const qsRef = useRef(qs); qsRef.current = qs;
  const submit = async () => {
    if (done.current) return; done.current = true;
    const list = qsRef.current; const correct = list.filter((q) => ansRef.current[q.id] === q.correctAnswer).length; const score = list.length ? (correct / list.length) * 10 : 0;
    try {
      await updateDoc(doc(db, 'exams', examId, 'submissions', subId), { score, submittedAt: serverTimestamp(), status: 'SUBMITTED' });
      if (user) await updateDoc(doc(db, 'exams', examId, 'participants', user.uid), { status: 'SUBMITTED', attemptsUsed: increment(1) });
      nav(`/exam-result/${examId}/${subId}`, { replace: true });
    } catch (x) { done.current = false; setErr('Không nộp được bài: ' + ((x as Error).message || x)); }
  };
  useEffect(() => {
    (async () => {
      const e = (await getDoc(doc(db, 'exams', examId))).data() as Exam; const s = (await getDoc(doc(db, 'exams', examId, 'submissions', subId))).data() as Submission;
      if (s.status === 'SUBMITTED') return nav(`/exam-result/${examId}/${subId}`, { replace: true });
      setEx(e); setAns(s.answers ?? {});
      setQs((await getDocs(query(collection(db, 'exams', examId, 'questions'), orderBy('order')))).docs.map((d) => d.data() as Question));
      if (e.durationMinutes > 0) { const end = (s.startedAt?.toDate().getTime() ?? Date.now()) + e.durationMinutes * 60000; setLeft(Math.max(0, Math.floor((end - Date.now()) / 1000))); }
    })().catch((x) => setErr('Lỗi tải đề: ' + (x.message || x)));
  }, [examId, subId]);
  useEffect(() => { if (!ex || ex.durationMinutes <= 0 || !qs.length) return; const t = setInterval(() => setLeft((l) => { if (l <= 1) { clearInterval(t); void submit(); return 0; } return l - 1; }), 1000); return () => clearInterval(t); }, [ex, qs.length]);
  const pick = (q: Question, k: number) => { setAns({ ...ans, [q.id]: k }); void updateDoc(doc(db, 'exams', examId, 'submissions', subId), { [`answers.${q.id}`]: k }); };
  if (!ex) return <p className="p-6">{err || 'Đang tải đề...'}</p>;
  const q = qs[i]; const z = (n: number) => String(n).padStart(2, '0');
  return (
    <div className="flex h-full flex-col bg-vl-bg">
      <div className="bg-[#FBF7FF] px-4 pt-3"><div className="flex items-start justify-between"><div><h1 className="text-xl font-black">{ex.title}</h1><p className="font-bold text-gray-400">{ex.subject}</p></div>
        <span className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-2 text-xl font-black text-red-600"><Timer size={20} />{z(Math.floor(left / 60))}:{z(left % 60)}</span></div>
        <div className="mt-3 flex gap-2 pb-1">{qs.map((_, k) => <div key={k} className={`h-1.5 flex-1 rounded-full ${k <= i ? 'bg-vl-maroon' : 'bg-gray-200'}`} />)}</div></div>
      <div className="flex-1 overflow-y-auto p-6">
        {!q ? <p className="text-gray-500">Bài kiểm tra chưa có câu hỏi.</p> : (<><p className="font-bold text-gray-500">Câu {i + 1} / {qs.length}</p><h2 className="my-5 text-2xl font-black">{q.questionText}</h2>
          {q.options.map((o, k) => { const on = ans[q.id] === k; return <button key={k} onClick={() => pick(q, k)} className={`mb-3 flex w-full items-center gap-4 rounded-3xl border-2 p-5 text-left ${on ? 'border-vl-maroon bg-[#EADDFF]' : 'border-transparent bg-white'}`}><span className={`grid h-11 w-11 place-items-center rounded-full font-black ${on ? 'bg-vl-maroon text-white' : 'bg-gray-100'}`}>{'ABCD'[k]}.</span><span className={`text-xl font-bold ${on ? 'text-vl-maroon' : ''}`}>{o}</span></button>; })}</>)}
        {err && <p className="text-sm font-bold text-red-600">{err}</p>}</div>
      <div className="flex items-center justify-between bg-[#F1DCE4] px-6 py-4"><button disabled={i === 0} onClick={() => setI(i - 1)} className="flex items-center gap-2 font-black text-gray-500 disabled:opacity-40"><ArrowLeft />CÂU TRƯỚC</button>
        {i < qs.length - 1 ? <button onClick={() => setI(i + 1)} className="flex items-center gap-2 rounded-2xl bg-vl-maroon px-6 py-4 font-black text-white">TIẾP THEO <ArrowRight /></button>
          : <button onClick={() => void submit()} className="rounded-2xl bg-vl-maroon px-6 py-4 font-black text-white">NỘP BÀI</button>}</div>
    </div>
  );
}

/** ExamResultScreen: điểm theo cờ showScore; hiện đáp án đúng theo cờ showAnswers. */
export function ExamResult() {
  const { examId = '', subId = '' } = useParams(); const nav = useNavigate(); const [d, setD] = useState<{ e: Exam; s: Submission; q: Question[] } | null>(null);
  useEffect(() => { (async () => { const e = (await getDoc(doc(db, 'exams', examId))).data() as Exam; const s = (await getDoc(doc(db, 'exams', examId, 'submissions', subId))).data() as Submission; const q = e.showAnswers ? (await getDocs(query(collection(db, 'exams', examId, 'questions'), orderBy('order')))).docs.map((x) => x.data() as Question) : []; setD({ e, s, q }); })(); }, [examId, subId]);
  if (!d) return <p className="p-6">Đang tải...</p>;
  return (
    <div className="min-h-full bg-vl-bg p-6"><div className="rounded-[32px] bg-white p-8 text-center shadow"><p className="font-bold text-gray-500">{d.e.title}</p><p className="mt-4 text-sm font-black tracking-widest text-gray-400">KẾT QUẢ</p>
      {d.e.showScore ? <p className="text-6xl font-black text-green-700">{score1(d.s.score)}</p> : <p className="mt-2 text-xl font-black text-vl-navy">Đã nộp bài thành công</p>}</div>
      {d.q.map((q, k) => <div key={q.id} className="mt-4 rounded-3xl bg-white p-5 shadow"><p className="font-black">Câu {k + 1}. {q.questionText}</p>{q.options.map((o, j) => <p key={j} className={`mt-2 rounded-xl px-3 py-2 ${j === q.correctAnswer ? 'bg-green-100 font-bold text-green-800' : d.s.answers[q.id] === j ? 'bg-red-100 text-red-700' : ''}`}>{'ABCD'[j]}. {o}</p>)}</div>)}
      <button onClick={() => nav('/home', { replace: true })} className="mt-6 h-14 w-full rounded-2xl bg-vl-maroon font-black text-white">VỀ TRANG CHỦ</button></div>
  );
}
