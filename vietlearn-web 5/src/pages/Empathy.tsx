import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addDoc, collection, doc, increment, orderBy, query, updateDoc, getDoc } from 'firebase/firestore';
import { Heart, MessageSquare, Search, Flag } from 'lucide-react';
import { db } from '../lib/firebase';
import { fmt, useQ } from '../lib/db';
import { useAuth } from '../auth/AuthContext';
import { Btn, Empty, Head, Inp } from '../lib/ui';
import { Who } from '../components/Who';
import { REASONS, restrictionMsg, submitReport } from '../lib/mod';

/** Theo EmpathyData.kt */
export const EMO: Record<string, [string, string, string]> = { HAPPY: ['Vui', '😊', '#FFD54F'], SAD: ['Buồn', '😭', '#64B5F6'], ANGRY: ['Tức giận', '😡', '#E57373'], ANXIOUS: ['Lo lắng', '😰', '#81C784'], TIRED: ['Mệt mỏi', '😴', '#90A4AE'], LOVED: ['Hạnh phúc', '🥰', '#F06292'], DISAPPOINTED: ['Thất vọng', '😞', '#BA68C8'], GRATEFUL: ['Biết ơn', '❤️', '#FF8A65'], HOPEFUL: ['Hy vọng', '🌈', '#4DB6AC'] };
const key = (t: string) => t;

/** EmpathyCornerScreen: bài viết theo timestamp giảm dần; ẩn bài isReported; thả tim = +1 empathyCount. */
export function EmpathyCorner() {
  const nav = useNavigate(); const posts = useQ(query(collection(db, 'empathy_posts'), orderBy('timestamp', 'desc')), 'posts');
  const [s, setS] = useState(''); const [f, setF] = useState(''); const [liked, setLiked] = useState<string[]>([]);
  const list = posts.filter((p) => !p.isReported && (!f || p.emotion === f) && (!s || `${p.title} ${p.content}`.toLowerCase().includes(s.toLowerCase())));
  const tags: Record<string, number> = {}; posts.forEach((p) => (p.hashtags ?? []).forEach((h: string) => (tags[h] = (tags[h] ?? 0) + 1)));
  return (
    <div className="relative min-h-full bg-[#FAFAFD] pb-28">
      <div className="flex items-center gap-3 px-3 pt-3"><button onClick={() => nav(-1)}>←</button><div><p className="text-sm text-gray-500">Chào bạn ✨</p><h1 className="text-2xl font-black">Góc Đồng Cảm</h1></div></div>
      <div className="lg:grid lg:grid-cols-12 lg:gap-6 lg:p-6"><div className="lg:col-span-4 lg:self-start">
      <div className="mx-4 mt-3 flex items-center gap-3 rounded-full bg-white px-5 py-3 shadow lg:mx-0"><Search className="text-blue-500" /><input value={s} onChange={(e) => setS(e.target.value)} placeholder="Tìm kiếm sự thấu cảm…" className="w-full outline-none" /></div>
      <div className="mt-4 flex gap-2 overflow-x-auto px-4 lg:flex-wrap lg:px-0"><button onClick={() => setF('')} className={`shrink-0 rounded-full px-5 py-2 font-bold ${!f ? 'bg-[#E8DEF8]' : 'border'}`}>Tất cả</button>{Object.entries(EMO).map(([k, [l, i]]) => <button key={k} onClick={() => setF(k)} className={`shrink-0 rounded-full border px-4 py-2 font-bold ${f === k ? 'bg-[#E8DEF8]' : ''}`}>{i} {l}</button>)}</div>
      <div className="mx-4 mt-5 rounded-[32px] bg-gradient-to-br from-blue-500 to-purple-600 p-7 text-white"><span className="rounded-xl bg-white/20 px-3 py-1 text-xs font-black">CHỮA LÀNH</span><h2 className="mt-4 text-3xl font-black leading-tight">Nơi mọi nỗi lòng<br />đều được trân trọng.</h2></div>
      {Object.keys(tags).length > 0 && <><p className="px-5 pt-6 font-black text-gray-500">Đang được quan tâm</p><div className="flex gap-2 overflow-x-auto px-4 pt-2">{Object.keys(tags).sort((a, b) => tags[b] - tags[a]).slice(0, 8).map((h) => <button key={h} onClick={() => setS(h)} className="shrink-0 rounded-full bg-white px-4 py-2 font-black text-blue-600 shadow">#{h.replace('#', '')}</button>)}</div></>}
      </div><div className="lg:col-span-8">
      <h3 className="px-5 pb-2 pt-6 text-2xl font-black text-[#1F2D4D] lg:pt-0">Trạm dừng chân tâm hồn</h3>
      {list.length === 0 && <Empty t="Chưa có bài viết nào." />}
      {list.map((p) => { const [l, i, c] = EMO[p.emotion] ?? ['', '', '#ccc']; return (
        <div key={p.id} className="mx-4 mb-4 rounded-[32px] bg-white p-5 shadow">
          <div className="flex items-center gap-3"><span className="grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-blue-500">👤</span><div className="flex-1"><p className="text-lg font-black"><Who uid={p.authorId} name={p.authorName} anon={p.isAnonymous} /></p><p className="text-gray-400">{fmt(p.timestamp)}</p></div><span className="rounded-2xl px-4 py-2 font-black" style={{ background: c + '33' }}>{i} {l}</span></div>
          <h4 className="mt-4 text-xl font-black text-[#1F2D4D]" onClick={() => nav(`/empathy-post/${p.id}`)}>{p.title}</h4><p className="mt-1 text-gray-500">{p.content}</p>
          <div className="mt-4 flex gap-3"><button onClick={() => { if (!liked.includes(p.id)) { setLiked([...liked, p.id]); void updateDoc(doc(db, 'empathy_posts', p.id), { empathyCount: increment(1) }); } }} className="flex items-center gap-2 rounded-2xl bg-red-50 px-5 py-3 font-black"><Heart className="fill-red-500 text-red-500" size={20} />{p.empathyCount ?? 0}</button>
            <button onClick={() => nav(`/empathy-post/${p.id}`)} className="flex items-center gap-2 px-3 text-gray-500"><MessageSquare />{p.commentCount ?? 0}</button></div></div>); })}
      </div></div>
      <button onClick={() => nav('/create-empathy-post')} className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-blue-500 px-6 py-4 text-lg font-black text-white shadow-xl"><Heart size={22} className="fill-white" />Gieo yêu thương</button>
    </div>
  );
}

/** CreateEmpathyPostScreen: các trường đúng như EmpathyViewModel (empathy_posts). */
export function CreateEmpathyPost() {
  const nav = useNavigate(); const { user, profile } = useAuth(); const [t, setT] = useState(''); const [c, setC] = useState(''); const [e, setE] = useState('HAPPY'); const [h, setH] = useState(''); const [a, setA] = useState(false); const [busy, setBusy] = useState(false);
  const go = async () => { if (!user || !t.trim() || !c.trim()) return; const rm = restrictionMsg(profile, 'POST'); if (rm) return alert(rm); setBusy(true);
    await addDoc(collection(db, 'empathy_posts'), { authorId: user.uid, authorName: a ? 'Người dùng' : profile?.userName ?? 'Người dùng', authorAvatarUrl: null, title: t.trim(), content: c.trim(), emotion: e, hashtags: h.split(/[\s,]+/).filter(Boolean).map((x) => x.replace(/^#/, '')), isAnonymous: a, timestamp: Date.now(), empathyCount: 0, commentCount: 0, reportCount: 0, isReported: false });
    nav(-1); };
  return <div className="min-h-full bg-[#FAFAFD]"><Head title="Gieo yêu thương" color="#3B82F6" /><div className="p-5"><Inp placeholder="Tiêu đề" value={t} onChange={(x) => setT(x.target.value)} /><Inp area placeholder="Bạn đang nghĩ gì?" value={c} onChange={(x) => setC(x.target.value)} />
    <div className="mb-3 flex flex-wrap gap-2">{Object.entries(EMO).map(([k, [l, i]]) => <button key={k} onClick={() => setE(k)} className={`rounded-full border px-4 py-2 font-bold ${e === k ? 'bg-[#E8DEF8]' : ''}`}>{i} {l}</button>)}</div>
    <Inp placeholder="#hashtag (cách nhau bằng dấu cách)" value={h} onChange={(x) => setH(x.target.value)} /><label className="mb-4 flex items-center gap-3"><input type="checkbox" checked={a} onChange={(x) => setA(x.target.checked)} className="h-5 w-5" />Đăng ẩn danh</label><Btn c="#3B82F6" disabled={busy} onClick={() => void go()}>ĐĂNG BÀI</Btn></div></div>;
}

const RSN = Object.entries(REASONS).filter(([k]) => k !== 'INAPPROPRIATE');
function ReportDialog({ onClose, onSend }: { onClose: () => void; onSend: (reason: string, desc: string) => Promise<void> }) {
  const [r, setR] = useState('BULLYING'); const [d, setD] = useState(''); const [busy, setBusy] = useState(false);
  return <div className="fixed inset-0 z-30 grid items-end bg-black/40 lg:place-items-center" onClick={onClose}><div onClick={(e) => e.stopPropagation()} className="mx-auto w-full max-w-md rounded-t-[28px] bg-white p-6 lg:rounded-[28px]"><h3 className="mb-1 text-xl font-black">Báo cáo nội dung</h3><p className="mb-3 text-sm text-gray-500">Báo cáo không làm nội dung bị xóa hay ẩn. Người có thẩm quyền sẽ xem xét.</p>
    <div className="mb-3 space-y-1">{RSN.map(([k, l]) => <label key={k} className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50"><input type="radio" name="rs" checked={r === k} onChange={() => setR(k)} className="h-4 w-4" />{l}</label>)}</div>
    <textarea value={d} onChange={(e) => setD(e.target.value)} rows={3} maxLength={500} placeholder="Mô tả thêm (không bắt buộc)" className="mb-3 w-full rounded-2xl border-2 border-gray-200 p-3 outline-none focus:border-blue-500" />
    <div className="flex gap-3"><button disabled={busy} onClick={async () => { setBusy(true); await onSend(r, d.trim()); setBusy(false); }} className="h-12 flex-1 rounded-2xl bg-blue-500 font-black text-white disabled:opacity-50">GỬI BÁO CÁO</button><button onClick={onClose} className="rounded-2xl border-2 px-5 font-black">Hủy</button></div></div></div>;
}
/** EmpathyPostDetailScreen: báo cáo chỉ TẠO bản ghi trong `reports` (mỗi người 1 lần/nội dung), KHÔNG ẩn hay xóa bình luận. Chỉ nội dung có status=HIDDEN (do người có thẩm quyền) mới bị ẩn. */
export function EmpathyPostDetail() {
  const { id = '' } = useParams(); const { user, profile } = useAuth(); const [p, setP] = useState<any>(null); const [t, setT] = useState(''); const [rep, setRep] = useState<null | { type: 'POST' | 'COMMENT'; targetId: string }>(null); const [toast, setToast] = useState('');
  const staff = profile?.role === 'publisher' || profile?.role === 'moderator';
  const cs = useQ(query(collection(db, 'empathy_posts', id, 'comments'), orderBy('timestamp', 'asc')), id);
  useEffect(() => { void getDoc(doc(db, 'empathy_posts', id)).then((s) => setP(s.data() ?? null)); }, [id]);
  const send = async () => { if (!user || !t.trim()) return; const rm = restrictionMsg(profile, 'COMMENT'); if (rm) return alert(rm); await addDoc(collection(db, 'empathy_posts', id, 'comments'), { postId: id, authorId: user.uid, authorName: profile?.userName ?? 'Người dùng', authorAvatarUrl: null, content: t.trim(), timestamp: Date.now(), empathyCount: 0, parentCommentId: null, reportCount: 0, status: 'VISIBLE', isAuthorOfPost: p?.authorId === user.uid, isAuthorVerified: !!profile?.isVerified }); await updateDoc(doc(db, 'empathy_posts', id), { commentCount: increment(1) }); setT(''); };
  const sendReport = async (reason: string, description: string) => { if (!user || !rep) return; try { await submitReport({ reporterId: user.uid, targetType: rep.type, targetId: rep.targetId, postId: id, reason, description }); setToast('Đã gửi báo cáo. Cảm ơn bạn!'); } catch (e) { setToast((e as Error).message === 'DUP' ? 'Bạn đã báo cáo nội dung này rồi.' : 'Không gửi được báo cáo: ' + (e as Error).message); } setRep(null); setTimeout(() => setToast(''), 3500); };
  const hiddenPost = !!p?.isReported && !staff;
  return <div className="flex h-full flex-col bg-[#FAFAFD]"><Head title="Bài viết" color="#3B82F6" right={p && !hiddenPost ? <button onClick={() => setRep({ type: 'POST', targetId: id })} aria-label="Báo cáo bài viết"><Flag /></button> : undefined} />
    <div className="flex-1 overflow-y-auto p-4">{hiddenPost ? <p className="mt-10 text-center text-gray-500">Nội dung này đã bị ẩn bởi người kiểm duyệt.</p> : <>
      {p && <div className="mb-4 rounded-3xl bg-white p-5 shadow"><p className="text-sm text-gray-400"><Who uid={p.authorId} name={p.authorName} anon={p.isAnonymous} /> · {fmt(p.timestamp)}</p><h2 className="mt-2 text-2xl font-black">{p.title}</h2><p className="mt-2 whitespace-pre-wrap">{p.content}</p></div>}
      {cs.filter((c) => staff || c.status !== 'HIDDEN').map((c) => <div key={c.id} className={`mb-3 rounded-2xl bg-white p-4 shadow ${c.status === 'HIDDEN' ? 'opacity-60' : ''}`}><p className="text-sm font-black"><Who uid={c.authorId} name={c.authorName} />{c.isAuthorOfPost ? ' · Tác giả' : ''} <span className="font-normal text-gray-400">{fmt(c.timestamp)}</span>{c.status === 'HIDDEN' && <span className="ml-2 rounded bg-red-100 px-2 text-xs text-red-600">Đã ẩn</span>}</p><p className="whitespace-pre-wrap">{c.content}</p>
        <div className="mt-2 flex gap-4 text-sm text-gray-500"><button onClick={() => void updateDoc(doc(db, 'empathy_posts', id, 'comments', c.id), { empathyCount: increment(1) })}>❤️ {c.empathyCount ?? 0}</button><button onClick={() => setRep({ type: 'COMMENT', targetId: c.id })}>Báo cáo</button></div></div>)}</>}</div>
    {!hiddenPost && <div className="flex gap-2 bg-white p-3"><input value={t} onChange={(e) => setT(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && void send()} placeholder="Viết bình luận…" className="flex-1 rounded-full border px-4 py-3 outline-none" /><button onClick={() => void send()} className="rounded-full bg-blue-500 px-5 font-black text-white">Gửi</button></div>}
    {rep && <ReportDialog onClose={() => setRep(null)} onSend={sendReport} />}{toast && <div className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full bg-slate-900/90 px-5 py-3 text-sm font-bold text-white">{toast}</div>}</div>;
}
void key;
