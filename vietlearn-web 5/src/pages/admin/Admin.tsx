import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { arrayUnion, collection, collectionGroup, deleteDoc, doc, getCountFromServer, getDoc, getDocs, limit, orderBy, query, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { BadgeCheck, ShieldCheck } from 'lucide-react';
import { auth, db, storage } from '../../lib/firebase';
import { useAuth } from '../../auth/AuthContext';
import { useQ } from '../../lib/db';
import { Who } from '../../components/Who';
import { applySanction, audit, auditOps, dt, effStatus, REASONS, RSTATUS, STATUS_LABEL, ts } from '../../lib/mod';

const Card = ({ children, cls = '' }: { children: ReactNode; cls?: string }) => <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${cls}`}>{children}</div>;
const Pill = ({ c, children }: { c: string; children: ReactNode }) => <span className={`inline-block rounded-full px-3 py-1 text-xs font-black ${c}`}>{children}</span>;
const B = ({ c = 'bg-vl-navy text-white', ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { c?: string }) => <button {...p} className={`rounded-xl px-4 py-2 text-sm font-black disabled:opacity-40 ${c} ${p.className ?? ''}`} />;
const inp = 'w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 outline-none focus:border-vl-navy';
const ST_C: Record<string, string> = { ACTIVE: 'bg-green-100 text-green-700', RESTRICTED: 'bg-amber-100 text-amber-700', SUSPENDED: 'bg-orange-100 text-orange-700', BANNED: 'bg-red-100 text-red-700', DELETED: 'bg-slate-200 text-slate-600' };
const RS_C: Record<string, string> = { PENDING: 'bg-amber-100 text-amber-700', REVIEWING: 'bg-blue-100 text-blue-700', VERIFIED: 'bg-red-100 text-red-700', REJECTED: 'bg-slate-200 text-slate-600', RESOLVED: 'bg-green-100 text-green-700', CLOSED: 'bg-slate-200 text-slate-600' };
const ROLE: Record<string, string> = { student: 'Học sinh', teacher: 'Giáo viên', publisher: 'Nhà phát hành', moderator: 'Kiểm duyệt viên' };
type Actor = { uid: string; role: string };
const useUsers = () => useQ(query(collection(db, 'users'), limit(1000)), 'adm-users');
const need = (e: unknown) => ((e as { code?: string }).code === 'permission-denied' ? 'Bị từ chối quyền (kiểm tra Firestore Rules / phiên nhà phát hành).' : (e as Error).message);

const TABS: [string, string, ('publisher' | 'moderator')[]][] = [['overview', 'Tổng quan', ['publisher']], ['users', 'Tài khoản', ['publisher']], ['posts', 'Bài đăng', ['publisher', 'moderator']], ['comments', 'Bình luận', ['publisher', 'moderator']], ['reports', 'Báo cáo vi phạm', ['publisher', 'moderator']], ['mods', 'Kiểm duyệt viên', ['publisher']], ['profile', 'Hồ sơ nhà phát hành', ['publisher']], ['logs', 'Nhật ký quản trị', ['publisher', 'moderator']], ['security', 'Cài đặt & bảo mật', ['publisher']]];

/** Trung tâm quản trị. Publisher: cần phiên xác nhận (Custom Claims). Moderator: chỉ các mục được phân quyền. */
export default function Admin() {
  const { tab, } = useParams(); const nav = useNavigate(); const { profile, user, pubSession } = useAuth();
  const role = profile?.role as 'publisher' | 'moderator' | undefined;
  if (!profile || (role !== 'publisher' && role !== 'moderator')) return <Navigate to="/home" replace />;
  if (role === 'publisher' && !pubSession) return <Navigate to="/publisher-gate" replace />;
  const allowed = TABS.filter((t) => t[2].includes(role)); const cur = allowed.find((t) => t[0] === tab) ?? allowed.find((t) => t[0] === (role === 'publisher' ? 'overview' : 'reports'))!;
  const actor: Actor = { uid: user!.uid, role: role.toUpperCase() };
  const V = { overview: <Overview />, users: <Users actor={actor} />, posts: <Posts actor={actor} role={role} />, comments: <Comments actor={actor} role={role} />, reports: <Reports actor={actor} role={role} />, mods: <Mods actor={actor} />, profile: <PubProfile />, logs: <Logs />, security: <Security /> } as Record<string, ReactNode>;
  return (
    <div className="min-h-full bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-4 pt-4 lg:px-8"><h1 className="flex items-center gap-2 text-2xl font-black text-vl-navy"><ShieldCheck />Trung tâm quản trị <Pill c="bg-vl-navy/10 text-vl-navy">{ROLE[role]}</Pill></h1>
        <div className="-mb-px mt-3 flex gap-1 overflow-x-auto">{allowed.map(([k, l]) => <button key={k} onClick={() => nav(`/admin/${k}`)} className={`shrink-0 border-b-4 px-4 py-3 text-sm font-bold ${cur[0] === k ? 'border-vl-navy text-vl-navy' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{l}</button>)}</div></div>
      <div className="p-4 lg:p-8" key={cur[0]}>{V[cur[0]]}</div>
    </div>
  );
}

function Overview() {
  const us = useUsers(); const [c, setC] = useState<Record<string, number | null>>({});
  useEffect(() => { const q: [string, any][] = [['posts', collection(db, 'empathy_posts')], ['comments', collectionGroup(db, 'comments')], ['pending', query(collection(db, 'reports'), where('status', 'in', ['PENDING', 'REVIEWING']))], ['done', query(collection(db, 'reports'), where('status', 'in', ['RESOLVED', 'VERIFIED', 'REJECTED', 'CLOSED']))]];
    q.forEach(([k, qq]) => getCountFromServer(qq).then((s) => setC((p) => ({ ...p, [k]: (s.data() as { count: number }).count }))).catch(() => setC((p) => ({ ...p, [k]: null })))); }, []);
  const n = (f: (u: any) => boolean) => us.filter(f).length; const v = (x: number | null | undefined) => (x === undefined ? '…' : x === null ? '—' : x);
  const S: [string, ReactNode][] = [['Tổng số tài khoản', us.length], ['Đang hoạt động', n((u) => effStatus(u) === 'ACTIVE')], ['Bị hạn chế', n((u) => effStatus(u) === 'RESTRICTED')], ['Bị đình chỉ hoặc cấm', n((u) => ['SUSPENDED', 'BANNED'].includes(effStatus(u)))], ['Tổng số bài đăng', v(c.posts)], ['Tổng số bình luận', v(c.comments)], ['Báo cáo chờ xử lý', v(c.pending)], ['Báo cáo đã giải quyết', v(c.done)], ['Kiểm duyệt viên', n((u) => u.role === 'moderator')]];
  return <div><div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">{S.map(([l, x]) => <Card key={l}><p className="text-sm font-bold text-slate-500">{l}</p><p className="mt-2 text-4xl font-black text-vl-navy">{x}</p></Card>)}</div><p className="mt-4 text-xs text-slate-400">Số liệu lấy trực tiếp từ Firestore (tài khoản: tối đa 1000 bản ghi đầu tiên).</p></div>;
}

function Users({ actor }: { actor: Actor }) {
  const us = useUsers(); const [sp, setSp] = useSearchParams(); const [s, setS] = useState(''); const [rf, setRf] = useState(''); const [sf, setSf] = useState('');
  const vr = useQ(query(collection(db, 'verificationRequests'), where('status', '==', 'pending')), 'adm-vr'); const [err, setErr] = useState('');
  const sel = us.find((u) => u.id === sp.get('uid'));
  const list = us.filter((u) => (!rf || u.role === rf) && (!sf || effStatus(u) === sf) && (!s || `${u.userName} ${u.id} ${u.email}`.toLowerCase().includes(s.toLowerCase())));
  const decide = async (r: any, ok: boolean) => { try { const b = writeBatch(db); b.update(doc(db, 'verificationRequests', r.id), { status: ok ? 'approved' : 'rejected', reviewedBy: actor.uid, reviewedAt: Date.now() }); b.update(doc(db, 'users', r.uid), ok ? { isVerified: true, verificationStatus: 'approved' } : { verificationStatus: 'rejected' }); auditOps(b, actor, { action: ok ? 'VERIFY' : 'VERIFY_REJECT', targetType: 'USER', targetId: r.uid, targetUserId: r.uid, reason: r.reason ?? '' }); await b.commit(); } catch (e) { setErr(need(e)); } };
  return (
    <div className="grid gap-6 xl:grid-cols-3"><div className="space-y-4 xl:col-span-2">
      {vr.length > 0 && <Card cls="border-green-200 bg-green-50"><h3 className="mb-3 font-black text-green-800">Yêu cầu cấp tích xanh đang chờ ({vr.length})</h3>{vr.map((r) => <div key={r.id} className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-3"><div><b>{r.displayName}</b><p className="text-sm text-slate-500">{r.reason}</p></div><div className="flex gap-2"><B onClick={() => void decide(r, true)} c="bg-green-600 text-white">Cấp tích</B><B onClick={() => void decide(r, false)} c="bg-slate-200">Từ chối</B></div></div>)}</Card>}
      <Card><div className="mb-4 grid gap-3 sm:grid-cols-3"><input className={inp} placeholder="Tìm theo tên, UID, email…" value={s} onChange={(e) => setS(e.target.value)} />
        <select className={inp} value={rf} onChange={(e) => setRf(e.target.value)}><option value="">Mọi vai trò</option>{Object.entries(ROLE).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <select className={inp} value={sf} onChange={(e) => setSf(e.target.value)}><option value="">Mọi trạng thái</option>{Object.entries(STATUS_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
        {err && <p className="mb-2 text-sm font-bold text-red-600">{err}</p>}
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b text-xs uppercase text-slate-400"><th className="py-2">Tài khoản</th><th>UID</th><th>Vai trò</th><th>Tạo lúc</th><th>Hoạt động</th><th>Trạng thái</th></tr></thead><tbody>
          {list.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-slate-400">Không có tài khoản phù hợp.</td></tr>}
          {list.map((u) => <tr key={u.id} onClick={() => setSp({ uid: u.id })} className={`cursor-pointer border-b hover:bg-slate-50 ${sel?.id === u.id ? 'bg-blue-50' : ''}`}><td className="py-3"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-vl-navy font-black text-white">{(u.userName || '?')[0]?.toUpperCase()}</span><div><b className="flex items-center gap-1">{u.userName}{u.isVerified && <BadgeCheck size={16} className="fill-green-600 text-white" />}</b><span className="text-xs text-slate-400">{u.email}</span></div></div></td><td className="font-mono text-xs">{u.id.slice(0, 8)}…</td><td>{ROLE[u.role] ?? u.role}</td><td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}</td><td>{u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleDateString('vi-VN') : '—'}</td><td><Pill c={ST_C[effStatus(u)]}>{STATUS_LABEL[effStatus(u)]}</Pill></td></tr>)}</tbody></table></div></Card></div>
      <div>{sel ? <UserDetail u={sel} actor={actor} /> : <Card cls="text-center text-slate-400">Chọn một tài khoản để xem chi tiết và xử lý.</Card>}</div></div>
  );
}

function UserDetail({ u, actor }: { u: any; actor: Actor }) {
  const [mode, setMode] = useState<'' | 'RESTRICT' | 'SUSPEND' | 'BAN' | 'DELETE'>(''); const [scope, setScope] = useState('ALL'); const [reason, setReason] = useState(''); const [days, setDays] = useState('7'); const [appeal, setAppeal] = useState(true); const [policy, setPolicy] = useState('keep'); const [cf, setCf] = useState(''); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState('');
  const st = effStatus(u); const prot = u.id === actor.uid || u.role === 'publisher'; const s = u.sanction;
  const run = async () => {
    if (!reason.trim()) return setMsg('Vui lòng nhập lý do.'); setBusy(true); setMsg('');
    try {
      if (mode === 'DELETE') {
        if (cf !== 'XOA') return setMsg('Hãy gõ XOA để xác nhận.');
        const tk = await auth.currentUser?.getIdToken(); const r = await fetch('/api/admin-delete-user', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tk}` }, body: JSON.stringify({ uid: u.id, reason: reason.trim(), contentPolicy: policy }) });
        const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || `Lỗi máy chủ ${r.status}`);
      } else {
        const x: any = { type: mode, reason: reason.trim(), until: days === '0' ? null : Date.now() + Number(days) * 86400000, allowAppeal: appeal, by: actor.uid, at: Date.now() }; if (mode === 'RESTRICT') x.scope = scope;
        await applySanction(actor, u, x, reason.trim());
      }
      setMode(''); setReason(''); setCf('');
    } catch (e) { setMsg(need(e)); } finally { setBusy(false); }
  };
  const lift = async () => { if (confirm('Gỡ biện pháp xử lý đang áp dụng?')) try { await applySanction(actor, u, null, 'Gỡ biện pháp'); } catch (e) { setMsg(need(e)); } };
  const tick = async () => { if (!confirm(u.isVerified ? 'Thu hồi dấu tích xanh?' : 'Cấp dấu tích xanh cho tài khoản này?')) return; try { const b = writeBatch(db); b.update(doc(db, 'users', u.id), { isVerified: !u.isVerified, verificationStatus: u.isVerified ? 'none' : 'approved' }); auditOps(b, actor, { action: u.isVerified ? 'UNVERIFY' : 'VERIFY', targetType: 'USER', targetId: u.id, targetUserId: u.id }); await b.commit(); } catch (e) { setMsg(need(e)); } };
  return (
    <Card cls="space-y-3 xl:sticky xl:top-4"><div className="flex items-center gap-3"><span className="grid h-14 w-14 place-items-center rounded-full bg-vl-navy text-2xl font-black text-white">{(u.userName || '?')[0]?.toUpperCase()}</span><div><h3 className="text-xl font-black"><Who uid={u.id} name={u.userName} /></h3><Pill c={ST_C[st]}>{STATUS_LABEL[st]}</Pill></div></div>
      <dl className="grid grid-cols-[110px_1fr] gap-y-1 text-sm"><dt className="text-slate-400">UID</dt><dd className="break-all font-mono text-xs">{u.id}</dd><dt className="text-slate-400">Email</dt><dd>{u.email}</dd><dt className="text-slate-400">Vai trò</dt><dd>{ROLE[u.role] ?? u.role}</dd><dt className="text-slate-400">Trường</dt><dd>{u.schoolId || '—'}</dd><dt className="text-slate-400">Tạo lúc</dt><dd>{dt(u.createdAt)}</dd><dt className="text-slate-400">Hoạt động</dt><dd>{dt(u.lastActiveAt)}</dd><dt className="text-slate-400">Xác minh</dt><dd>{u.isVerified ? 'Đã xác minh' : 'Chưa'}</dd></dl>
      {s && st !== 'ACTIVE' && <div className="rounded-xl bg-amber-50 p-3 text-sm"><b>{s.type}</b>{s.scope ? ` · phạm vi ${s.scope}` : ''} · {s.until ? `đến ${dt(s.until)}` : 'không thời hạn'}<br />Lý do: {s.reason}</div>}
      {prot ? <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-500">Không thể xử lý tài khoản này (chính bạn hoặc nhà phát hành khác).</p> : u.accountStatus === 'DELETED' ? <p className="text-sm text-slate-500">Tài khoản đã bị xóa.</p> : <>
        <div className="flex flex-wrap gap-2"><B c="bg-amber-500 text-white" onClick={() => setMode('RESTRICT')}>Hạn chế</B><B c="bg-orange-600 text-white" onClick={() => setMode('SUSPEND')}>Đình chỉ</B><B c="bg-red-600 text-white" onClick={() => setMode('BAN')}>Cấm</B>{st !== 'ACTIVE' && <B c="bg-green-600 text-white" onClick={() => void lift()}>Gỡ biện pháp</B>}<B c="bg-slate-200" onClick={() => void tick()}>{u.isVerified ? 'Thu hồi tích xanh' : 'Cấp tích xanh'}</B><B c="bg-slate-800 text-white" onClick={() => setMode('DELETE')}>Xóa tài khoản</B></div>
        {mode && <div className="space-y-2 rounded-xl border-2 border-slate-200 p-3"><p className="font-black">{({ RESTRICT: 'Hạn chế tài khoản', SUSPEND: 'Đình chỉ tài khoản', BAN: 'Cấm tài khoản', DELETE: 'Xóa tài khoản (không thể hoàn tác)' } as Record<string, string>)[mode]}</p>
          {mode === 'RESTRICT' && <select className={inp} value={scope} onChange={(e) => setScope(e.target.value)}><option value="POST">Đăng bài</option><option value="COMMENT">Bình luận</option><option value="ALL">Toàn bộ tương tác cộng đồng</option></select>}
          {mode !== 'DELETE' && <><select className={inp} value={days} onChange={(e) => setDays(e.target.value)}>{[['1', '1 ngày'], ['3', '3 ngày'], ['7', '7 ngày'], ['30', '30 ngày'], ['0', 'Không thời hạn']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={appeal} onChange={(e) => setAppeal(e.target.checked)} />Cho phép gửi yêu cầu xem xét lại</label></>}
          {mode === 'DELETE' && <><select className={inp} value={policy} onChange={(e) => setPolicy(e.target.value)}><option value="keep">Giữ nội dung đã đăng (hiện "Tài khoản đã xóa")</option><option value="hide">Ẩn các bài đăng của tài khoản này</option></select><input className={inp} placeholder="Gõ XOA để xác nhận" value={cf} onChange={(e) => setCf(e.target.value)} /><p className="text-xs text-slate-500">Hồ sơ được ẩn danh hóa, tài khoản đăng nhập bị xóa. Nhật ký quản trị và bằng chứng báo cáo được giữ lại.</p></>}
          <textarea className={inp} rows={3} placeholder="Lý do (bắt buộc)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <div className="flex gap-2"><B disabled={busy} onClick={() => void run()}>{busy ? 'Đang xử lý…' : 'Xác nhận'}</B><B c="bg-slate-200" onClick={() => { setMode(''); setMsg(''); }}>Hủy</B></div></div>}</>}
      {msg && <p className="text-sm font-bold text-red-600">{msg}</p>}
    </Card>
  );
}

function Posts({ actor, role }: { actor: Actor; role: string }) {
  const ps = useQ(query(collection(db, 'empathy_posts'), orderBy('timestamp', 'desc'), limit(100)), 'adm-posts'); const [err, setErr] = useState('');
  const hide = async (p: any, h: boolean) => { const why = h ? prompt('Lý do ẩn bài đăng:') : 'Khôi phục'; if (h && !why?.trim()) return; try { const b = writeBatch(db); b.update(doc(db, 'empathy_posts', p.id), { isReported: h, status: h ? 'HIDDEN' : 'VISIBLE' }); auditOps(b, actor, { action: h ? 'HIDE' : 'RESTORE', targetType: 'POST', targetId: p.id, reason: why ?? '', targetUserId: p.authorId }); await b.commit(); } catch (e) { setErr(need(e)); } };
  const del = async (p: any) => { const why = prompt('Lý do XÓA bài đăng (không hoàn tác):'); if (!why?.trim()) return; try { await audit(actor, { action: 'DELETE_POST', targetType: 'POST', targetId: p.id, reason: why, targetUserId: p.authorId }); await deleteDoc(doc(db, 'empathy_posts', p.id)); } catch (e) { setErr(need(e)); } };
  return <Card>{err && <p className="mb-2 font-bold text-red-600">{err}</p>}<div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b text-xs uppercase text-slate-400"><th className="py-2">Bài đăng</th><th>Tác giả</th><th>Thời gian</th><th>Báo cáo</th><th>Hiển thị</th><th /></tr></thead><tbody>
    {ps.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-slate-400">Chưa có bài đăng.</td></tr>}
    {ps.map((p) => <tr key={p.id} className="border-b align-top"><td className="max-w-xs py-3"><b>{p.title}</b><p className="line-clamp-2 text-slate-500">{p.content}</p></td><td>{p.isAnonymous ? <span title="Ẩn danh">Ẩn danh ({p.authorName})</span> : <Who uid={p.authorId} name={p.authorName} />}</td><td>{dt(ts(p.timestamp))}</td><td>{p.reportCount ?? 0}</td><td>{p.isReported ? <Pill c="bg-red-100 text-red-700">Đã ẩn</Pill> : <Pill c="bg-green-100 text-green-700">Hiển thị</Pill>}</td><td className="space-x-2 whitespace-nowrap">{p.isReported ? <B c="bg-green-600 text-white" onClick={() => void hide(p, false)}>Khôi phục</B> : <B c="bg-amber-500 text-white" onClick={() => void hide(p, true)}>Ẩn</B>}{role === 'publisher' && <B c="bg-red-600 text-white" onClick={() => void del(p)}>Xóa</B>}</td></tr>)}</tbody></table></div></Card>;
}

function Comments({ actor, role }: { actor: Actor; role: string }) {
  const [l, setL] = useState<any[] | null>(null); const [err, setErr] = useState('');
  const load = () => getDocs(query(collectionGroup(db, 'comments'), limit(300))).then((s) => setL(s.docs.map((d) => ({ ...d.data(), id: d.id, path: d.ref.path, postId: d.ref.parent.parent?.id })).sort((a, b) => ts((b as any).timestamp) - ts((a as any).timestamp)))).catch((e) => { setErr(need(e)); setL([]); });
  useEffect(() => { void load(); }, []); // eslint-disable-line
  const set = async (c: any, h: boolean) => { const why = h ? prompt('Lý do ẩn bình luận:') : 'Khôi phục'; if (h && !why?.trim()) return; try { const b = writeBatch(db); b.update(doc(db, c.path), { status: h ? 'HIDDEN' : 'VISIBLE', hiddenBy: h ? actor.uid : null }); auditOps(b, actor, { action: h ? 'HIDE' : 'RESTORE', targetType: 'COMMENT', targetId: c.id, reason: why ?? '', targetUserId: c.authorId }); await b.commit(); void load(); } catch (e) { setErr(need(e)); } };
  const del = async (c: any) => { const why = prompt('Lý do XÓA bình luận (không hoàn tác):'); if (!why?.trim()) return; try { await audit(actor, { action: 'DELETE_COMMENT', targetType: 'COMMENT', targetId: c.id, reason: why, targetUserId: c.authorId }); await deleteDoc(doc(db, c.path)); void load(); } catch (e) { setErr(need(e)); } };
  return <Card>{err && <p className="mb-2 font-bold text-red-600">{err}</p>}{l === null ? <p className="text-slate-400">Đang tải…</p> : <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b text-xs uppercase text-slate-400"><th className="py-2">Bình luận</th><th>Tác giả</th><th>Bài đăng</th><th>Thời gian</th><th>Hiển thị</th><th /></tr></thead><tbody>
    {l.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-slate-400">Không có bình luận.</td></tr>}
    {l.map((c) => <tr key={c.path} className="border-b align-top"><td className="max-w-xs py-3 text-slate-700">{c.content}</td><td><Who uid={c.authorId} name={c.authorName} /></td><td className="font-mono text-xs">{c.postId?.slice(0, 8)}…</td><td>{dt(ts(c.timestamp))}</td><td>{c.status === 'HIDDEN' ? <Pill c="bg-red-100 text-red-700">Đã ẩn</Pill> : <Pill c="bg-green-100 text-green-700">Hiển thị</Pill>}</td><td className="space-x-2 whitespace-nowrap">{c.status === 'HIDDEN' ? <B c="bg-green-600 text-white" onClick={() => void set(c, false)}>Khôi phục</B> : <B c="bg-amber-500 text-white" onClick={() => void set(c, true)}>Ẩn</B>}{role === 'publisher' && <B c="bg-red-600 text-white" onClick={() => void del(c)}>Xóa</B>}</td></tr>)}</tbody></table></div>}</Card>;
}

function Reports({ actor, role }: { actor: Actor; role: string }) {
  const all = useQ(query(collection(db, 'reports'), limit(300)), 'adm-reports').sort((a, b) => ts(b.createdAt) - ts(a.createdAt)); const [f, setF] = useState(''); const [sel, setSel] = useState<string | null>(null);
  const list = all.filter((r) => !f || (r.status ?? 'PENDING') === f); const r = all.find((x) => x.id === sel);
  return (
    <div className="grid gap-6 xl:grid-cols-5"><Card cls="xl:col-span-2"><select className={`${inp} mb-3`} value={f} onChange={(e) => setF(e.target.value)}><option value="">Tất cả trạng thái ({all.length})</option>{Object.entries(RSTATUS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
      {list.length === 0 && <p className="py-8 text-center text-slate-400">Không có báo cáo.</p>}
      {list.map((x) => <button key={x.id} onClick={() => setSel(x.id)} className={`mb-2 w-full rounded-xl border p-3 text-left hover:bg-slate-50 ${sel === x.id ? 'border-vl-navy bg-blue-50' : 'border-slate-200'}`}><div className="flex items-center justify-between"><b>{REASONS[x.reason] ?? x.reason}</b><Pill c={RS_C[x.status ?? 'PENDING']}>{RSTATUS[x.status ?? 'PENDING'] ?? x.status}</Pill></div><p className="text-xs text-slate-400">{x.targetType === 'COMMENT' ? 'Bình luận' : 'Bài đăng'} · {dt(ts(x.createdAt))}{x.escalated ? ' · Đã chuyển lên nhà phát hành' : ''}</p></button>)}</Card>
      <div className="xl:col-span-3">{r ? <ReportDetail key={r.id} r={r} all={all} actor={actor} role={role} /> : <Card cls="text-center text-slate-400">Chọn một báo cáo để xem và xử lý.</Card>}</div></div>
  );
}
function ReportDetail({ r, all, actor, role }: { r: any; all: any[]; actor: Actor; role: string }) {
  const [t, setT] = useState<any | null | undefined>(undefined); const [msg, setMsg] = useState(''); const [hideToo, setHideToo] = useState(true); const nav = useNavigate();
  const tid = r.targetId || r.postId; const same = all.filter((x) => (x.targetId || x.postId) === tid).length; const st = r.status ?? 'PENDING';
  const load = async () => { try { const s = r.targetType === 'COMMENT' && r.targetId && r.postId ? await getDoc(doc(db, 'empathy_posts', r.postId, 'comments', r.targetId)) : await getDoc(doc(db, 'empathy_posts', r.postId || r.targetId)); setT(s.exists() ? { ...s.data(), id: s.id, ref: s.ref, isComment: r.targetType === 'COMMENT' } : null); } catch { setT(null); } };
  useEffect(() => { void load(); }, []); // eslint-disable-line
  const hidden = t ? (t.isComment ? t.status === 'HIDDEN' : !!t.isReported) : false;
  const setHidden = async (h: boolean, b: ReturnType<typeof writeBatch>) => { if (!t) return; b.update(t.ref, t.isComment ? { status: h ? 'HIDDEN' : 'VISIBLE', hiddenBy: h ? actor.uid : null } : { isReported: h, status: h ? 'HIDDEN' : 'VISIBLE' }); };
  const act = async (status: string | null, action: string, o: { hide?: boolean; escalate?: boolean } = {}) => {
    const note = prompt(`Ghi chú cho thao tác "${action}" (có thể để trống):`) ?? ''; setMsg('');
    try { const b = writeBatch(db); const upd: any = { reviewedAt: Date.now(), reviewedBy: actor.uid, history: arrayUnion({ at: Date.now(), by: actor.uid, role: actor.role, action, note }) }; if (status) upd.status = status; if (o.escalate) { upd.escalated = true; upd.assignedModeratorId = null; } else if (status === 'REVIEWING') upd.assignedModeratorId = actor.uid;
      b.update(doc(db, 'reports', r.id), upd); if (o.hide !== undefined) await setHidden(o.hide, b); auditOps(b, actor, { action: `REPORT_${action}`, targetType: 'REPORT', targetId: r.id, reason: note, targetUserId: t?.authorId }); await b.commit(); await load(); } catch (e) { setMsg(need(e)); }
  };
  const propose = async () => { const why = prompt('Đề xuất hạn chế người đăng — nêu lý do:'); if (!why?.trim() || !t?.authorId) return; try { await audit(actor, { action: 'PROPOSAL', targetType: 'USER', targetId: t.authorId, targetUserId: t.authorId, reason: `[Đề xuất từ báo cáo ${r.id}] ${why}` }); setMsg('Đã gửi đề xuất tới nhà phát hành.'); } catch (e) { setMsg(need(e)); } };
  return (
    <Card cls="space-y-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-black">{REASONS[r.reason] ?? r.reason}</h3><Pill c={RS_C[st]}>{RSTATUS[st] ?? st}</Pill></div>
      <dl className="grid grid-cols-[130px_1fr] gap-y-1 text-sm"><dt className="text-slate-400">Loại nội dung</dt><dd>{r.targetType === 'COMMENT' ? 'Bình luận' : 'Bài đăng'}</dd><dt className="text-slate-400">Số lần báo cáo</dt><dd><b>{same}</b> báo cáo cho nội dung này</dd><dt className="text-slate-400">Người báo cáo</dt><dd className="font-mono text-xs">{r.reporterId}</dd><dt className="text-slate-400">Gửi lúc</dt><dd>{dt(ts(r.createdAt))}</dd><dt className="text-slate-400">Mô tả</dt><dd>{r.description || '—'}</dd></dl>
      <div className="rounded-xl bg-slate-50 p-4"><p className="mb-1 text-xs font-black uppercase text-slate-400">Nội dung bị báo cáo {t && hidden && <Pill c="bg-red-100 text-red-700">đang ẩn</Pill>}</p>{t === undefined ? <p className="text-slate-400">Đang tải…</p> : t === null ? <p className="text-slate-500">Nội dung không còn tồn tại.</p> : <><p className="text-sm text-slate-500">Tác giả: <Who uid={t.authorId} name={t.authorName} /></p>{t.title && <b>{t.title}</b>}<p className="whitespace-pre-wrap">{t.content}</p></>}</div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={hideToo} onChange={(e) => setHideToo(e.target.checked)} />Khi chấp nhận báo cáo thì ẩn nội dung</label>
      <div className="flex flex-wrap gap-2">{st === 'PENDING' && <B onClick={() => void act('REVIEWING', 'ĐANG_XEM_XÉT')}>Đánh dấu đang xem xét</B>}
        <B c="bg-red-600 text-white" onClick={() => void act('VERIFIED', 'CHẤP_NHẬN', hideToo ? { hide: true } : {})}>Chấp nhận (có vi phạm)</B><B c="bg-slate-200" onClick={() => void act('REJECTED', 'TỪ_CHỐI')}>Từ chối</B>
        {t && !hidden && <B c="bg-amber-500 text-white" onClick={() => void act(null, 'ẨN_NỘI_DUNG', { hide: true })}>Ẩn nội dung</B>}{t && hidden && <B c="bg-green-600 text-white" onClick={() => void act(null, 'KHÔI_PHỤC_NỘI_DUNG', { hide: false })}>Khôi phục nội dung</B>}
        <B c="bg-green-700 text-white" onClick={() => void act('RESOLVED', 'ĐÃ_XỬ_LÝ')}>Đã xử lý</B><B c="bg-slate-300" onClick={() => void act('CLOSED', 'ĐÓNG')}>Đóng báo cáo</B>
        {role === 'moderator' && <><B c="bg-purple-600 text-white" onClick={() => void act(null, 'CHUYỂN_LÊN_NHÀ_PHÁT_HÀNH', { escalate: true })}>Chuyển lên nhà phát hành</B><B c="bg-teal-600 text-white" onClick={() => void propose()}>Đề xuất hạn chế người đăng</B></>}
        {role === 'publisher' && t?.authorId && <B c="bg-vl-navy text-white" onClick={() => nav(`/admin/users?uid=${t.authorId}`)}>Xử lý tài khoản người đăng</B>}</div>
      {msg && <p className="text-sm font-bold text-red-600">{msg}</p>}
      <div><p className="mb-1 text-xs font-black uppercase text-slate-400">Lịch sử xử lý</p>{(r.history ?? []).length === 0 ? <p className="text-sm text-slate-400">Chưa có.</p> : [...(r.history ?? [])].reverse().map((h: any, i: number) => <p key={i} className="border-l-2 border-slate-200 pl-3 text-sm"><b>{h.action}</b> · {h.role} · {dt(h.at)}{h.note ? ` — ${h.note}` : ''}</p>)}</div>
    </Card>
  );
}

function Mods({ actor }: { actor: Actor }) {
  const us = useUsers(); const [e, setE] = useState(''); const [msg, setMsg] = useState(''); const mods = us.filter((u) => u.role === 'moderator');
  const setRole = async (u: any, role: string) => { if (u.role === 'publisher') return setMsg('Không thể đổi vai trò của nhà phát hành.'); if (!confirm(role === 'moderator' ? `Cấp quyền kiểm duyệt viên cho ${u.userName}?` : `Thu hồi quyền kiểm duyệt của ${u.userName}?`)) return; try { const b = writeBatch(db); b.update(doc(db, 'users', u.id), { role }); auditOps(b, actor, { action: 'ROLE_CHANGE', targetType: 'USER', targetId: u.id, targetUserId: u.id, previousStatus: u.role, newStatus: role }); await b.commit(); setE(''); setMsg(''); } catch (x) { setMsg(need(x)); } };
  const found = e.trim() ? us.find((u) => (u.email ?? '').toLowerCase() === e.trim().toLowerCase()) : null;
  return <div className="grid gap-6 lg:grid-cols-2"><Card><h3 className="mb-3 font-black">Cấp quyền kiểm duyệt viên</h3><input className={inp} placeholder="Nhập chính xác email tài khoản" value={e} onChange={(x) => setE(x.target.value)} />
    {e.trim() && (found ? <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-3"><div><b>{found.userName}</b><p className="text-xs text-slate-500">{ROLE[found.role]}</p></div>{found.role !== 'moderator' && <B onClick={() => void setRole(found, 'moderator')}>Cấp quyền</B>}</div> : <p className="mt-3 text-sm text-slate-400">Không tìm thấy tài khoản.</p>)}{msg && <p className="mt-2 text-sm font-bold text-red-600">{msg}</p>}
    <p className="mt-4 text-xs text-slate-400">Kiểm duyệt viên không được cấp tích xanh, không đổi quyền nhà phát hành.</p></Card>
    <Card><h3 className="mb-3 font-black">Kiểm duyệt viên hiện tại ({mods.length})</h3>{mods.length === 0 && <p className="text-slate-400">Chưa có.</p>}{mods.map((u) => <div key={u.id} className="mb-2 flex items-center justify-between rounded-xl bg-slate-50 p-3"><div><b><Who uid={u.id} name={u.userName} /></b><p className="text-xs text-slate-500">{u.email}</p></div><B c="bg-red-600 text-white" onClick={() => void setRole(u, 'student')}>Thu hồi</B></div>)}</Card></div>;
}

function PubProfile() {
  const { user, profile } = useAuth(); const [p, setP] = useState<any>({ displayName: '', introduction: '', avatarUrl: '', coverUrl: '' }); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { if (user) void getDoc(doc(db, 'publisher_profiles', user.uid)).then((s) => s.exists() && setP((x: any) => ({ ...x, ...s.data() }))).catch(() => undefined); }, [user]);
  const up = async (f: File | undefined, kind: 'avatar' | 'cover') => { if (!f || !user) return; if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) return setMsg('Chỉ chấp nhận ảnh JPG, PNG hoặc WebP.'); if (f.size > 2 * 1024 * 1024) return setMsg('Ảnh tối đa 2 MB.'); setBusy(true); setMsg('');
    try { const r = ref(storage, `publisher/${user.uid}/${kind}.${f.type.split('/')[1]}`); await uploadBytes(r, f, { contentType: f.type }); setP((x: any) => ({ ...x, [kind === 'avatar' ? 'avatarUrl' : 'coverUrl']: '' })); const url = await getDownloadURL(r); setP((x: any) => ({ ...x, [kind === 'avatar' ? 'avatarUrl' : 'coverUrl']: url })); } catch (e) { setMsg('Tải ảnh thất bại: ' + ((e as Error).message ?? e) + ' (kiểm tra Firebase Storage đã được bật chưa).'); } finally { setBusy(false); } };
  const save = async () => { if (!user) return; setBusy(true); try { await setDoc(doc(db, 'publisher_profiles', user.uid), { publisherUid: user.uid, displayName: p.displayName.trim(), avatarUrl: p.avatarUrl ?? '', coverUrl: p.coverUrl ?? '', introduction: p.introduction.slice(0, 1000), verified: !!profile?.isVerified, updatedAt: Date.now() }); setMsg('Đã lưu hồ sơ.'); } catch (e) { setMsg(need(e)); } finally { setBusy(false); } };
  return <div className="grid gap-6 lg:grid-cols-2"><Card cls="space-y-3"><h3 className="font-black">Chỉnh sửa hồ sơ nhà phát hành</h3>
    <label className="block text-sm font-bold">Tên hiển thị<input className={inp} maxLength={60} value={p.displayName} onChange={(e) => setP({ ...p, displayName: e.target.value })} /></label>
    <label className="block text-sm font-bold">Giới thiệu ({p.introduction.length}/1000)<textarea className={inp} rows={6} maxLength={1000} value={p.introduction} onChange={(e) => setP({ ...p, introduction: e.target.value })} /></label>
    <label className="block text-sm font-bold">Ảnh đại diện (JPG/PNG/WebP, ≤ 2 MB)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => void up(e.target.files?.[0], 'avatar')} className="mt-1 block" /></label>
    <label className="block text-sm font-bold">Ảnh bìa<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => void up(e.target.files?.[0], 'cover')} className="mt-1 block" /></label>
    <B disabled={busy} onClick={() => void save()}>{busy ? 'Đang xử lý…' : 'Lưu hồ sơ'}</B>{msg && <p className="text-sm font-bold text-vl-navy">{msg}</p>}</Card>
    <Card cls="overflow-hidden p-0"><p className="p-3 text-xs font-black uppercase text-slate-400">Xem trước</p><div className="h-36 bg-gradient-to-r from-vl-navy to-blue-500 bg-cover bg-center" style={p.coverUrl ? { backgroundImage: `url(${p.coverUrl})` } : undefined} /><div className="-mt-10 px-5 pb-5"><div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full border-4 border-white bg-vl-navy text-3xl font-black text-white">{p.avatarUrl ? <img src={p.avatarUrl} className="h-full w-full object-cover" alt="" /> : (p.displayName || profile?.userName || '?')[0]?.toUpperCase()}</div>
      <h3 className="mt-2 flex items-center gap-2 text-xl font-black">{p.displayName || profile?.userName}{profile?.isVerified && <BadgeCheck className="fill-green-600 text-white" />}<Pill c="bg-vl-navy text-white">NHÀ PHÁT HÀNH</Pill></h3><p className="mt-2 whitespace-pre-wrap text-slate-600">{p.introduction || 'Chưa có phần giới thiệu.'}</p></div></Card></div>;
}

function Logs() {
  const lg = useQ(query(collection(db, 'moderation_logs'), limit(300)), 'adm-logs').sort((a, b) => ts(b.timestamp) - ts(a.timestamp)); const pr = useQ(query(collection(db, 'moderation_actions'), where('action', '==', 'PROPOSAL'), limit(100)), 'adm-prop').sort((a, b) => ts(b.createdAt) - ts(a.createdAt)); const { profile } = useAuth();
  return <div className="space-y-6">{profile?.role === 'publisher' && <Card><h3 className="mb-3 font-black">Đề xuất từ kiểm duyệt viên ({pr.length})</h3>{pr.length === 0 ? <p className="text-slate-400">Không có đề xuất.</p> : pr.map((x) => <div key={x.id} className="mb-2 rounded-xl bg-purple-50 p-3 text-sm"><b>{dt(ts(x.createdAt))}</b> · đề xuất cho tài khoản <a className="font-mono text-vl-navy underline" href={`/admin/users?uid=${x.targetUserId}`}>{x.targetUserId}</a><br />{x.reason}</div>)}</Card>}
    <Card><h3 className="mb-3 font-black">Nhật ký hoạt động quản trị</h3><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b text-xs uppercase text-slate-400"><th className="py-2">Thời gian</th><th>Người thực hiện</th><th>Hành động</th><th>Đối tượng</th><th>Lý do</th></tr></thead><tbody>
      {lg.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-slate-400">Chưa có nhật ký.</td></tr>}{lg.map((x) => <tr key={x.id} className="border-b"><td className="py-2 whitespace-nowrap">{dt(ts(x.timestamp))}</td><td><Pill c="bg-slate-100">{x.actorRole}</Pill> <span className="font-mono text-xs">{String(x.actorUid).slice(0, 6)}…</span></td><td className="font-bold">{x.action}</td><td>{x.targetType} <span className="font-mono text-xs">{String(x.targetId).slice(0, 8)}</span></td><td className="max-w-xs text-slate-500">{x.reason}</td></tr>)}</tbody></table></div></Card></div>;
}

function Security() {
  const { user, signOut } = useAuth(); const [r, setR] = useState(''); const [exp, setExp] = useState(0);
  useEffect(() => { void auth.currentUser?.getIdTokenResult().then((x) => setExp(Number(x.claims.pubExp ?? 0))); }, []);
  const ping = async () => { setR('Đang kiểm tra…'); try { const tk = await auth.currentUser?.getIdToken(); const x = await fetch('/api/publisher-verify', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tk}` }, body: JSON.stringify({ code: '' }) }); setR(x.status === 404 ? '❌ Chưa có máy chủ xác thực (thiếu thư mục api/).' : x.status === 500 ? '⚠️ Máy chủ có nhưng thiếu cấu hình biến môi trường (FIREBASE_SERVICE_ACCOUNT / PUBLISHER_CODE).' : '✅ Máy chủ xác thực đang hoạt động.'); } catch { setR('❌ Không kết nối được.'); } };
  return <div className="grid gap-6 lg:grid-cols-2"><Card cls="space-y-2"><h3 className="font-black">Phiên nhà phát hành</h3><p>Tài khoản: <b>{user?.email}</b></p><p>Phiên hết hạn lúc: <b>{dt(exp)}</b> (sau đó phải nhập lại mã)</p><B c="bg-slate-800 text-white" onClick={() => void signOut()}>Đăng xuất</B></Card>
    <Card cls="space-y-2"><h3 className="font-black">Kiểm tra cấu hình bảo mật</h3><B onClick={() => void ping()}>Kiểm tra máy chủ xác thực</B><p className="text-sm">{r}</p><ul className="list-disc space-y-1 pl-5 text-sm text-slate-600"><li>Mã xác nhận nằm trong biến môi trường <code>PUBLISHER_CODE</code> trên Vercel, không có trong mã web hay Firestore.</li><li>Quyền được kiểm tra bằng Custom Claims và Firestore Rules (xem <code>firestore.rules.stage2.proposed</code>).</li><li>Hãy đổi <code>PUBLISHER_CODE</code> sang mã mạnh, riêng tư trước khi phát hành công khai.</li></ul></Card></div>;
}
