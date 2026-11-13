import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, doc, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { BadgeCheck, BarChart3, BookOpen, Camera, ChevronRight, CircleDollarSign, FileQuestion, FileText, Flag, Flame, GraduationCap, HelpCircle, Home, Lock, LogOut, Archive, PenSquare, Pencil, ClipboardList, Settings as Cog, Star, Store, Trophy, CalendarDays, UserRound } from 'lucide-react';
import { db } from '../lib/firebase';
import { badgeFor, nextLevelXp } from '../lib/gamification';
import { useQ } from '../lib/db';
import { useAuth } from '../auth/AuthContext';
import { ITEMS } from '../data/items';
import { Btn, Head, Inp } from '../lib/ui';

const Row = ({ icon, c, t, s, to, onClick }: { icon: ReactNode; c: string; t: string; s?: string; to?: string; onClick?: () => void }) => {
  const nav = useNavigate();
  return <button onClick={() => (onClick ? onClick() : to && nav(to))} className="mb-4 flex w-full items-center gap-5 rounded-[32px] bg-white/90 px-6 py-5 text-left shadow-md"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl" style={{ background: c + '1f', color: c }}>{icon}</span><span className="flex-1"><b className="block text-[22px] text-[#263238]">{t}</b>{s && <span className="text-[17px] text-gray-500">{s}</span>}</span><ChevronRight className="text-gray-300" /></button>;
};
const Sec = ({ t }: { t: string }) => <h2 className="mb-3 mt-7 px-2 text-[22px] font-black uppercase tracking-wide text-[#263238]">{t}</h2>;

/** ProfileScreen (ảnh chụp 1–3): hồ sơ, 3 chỉ số, thẻ cấp độ, các nhóm menu và thống kê hành trình. */
export function Profile() {
  const { profile: p, user, signOut } = useAuth(); const nav = useNavigate();
  const stats = useQ(user ? query(collection(db, 'users', user.uid, 'stats')) : null, 'st'); const qs = stats.find((s) => s.id === 'quiz');
  if (!p) return <p className="p-6">Chưa có hồ sơ.</p>;
  const next = nextLevelXp(p.level), pct = Math.min(100, Math.round((p.xp / next) * 100)); const teacher = p.role === 'teacher';
  const title = ITEMS.find((i) => i.id === p.selectedTitleId)?.name ?? 'Tân binh học đường';
  const start = user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
  const S = ({ i, v }: { i: ReactNode; v: number }) => <div className="grid place-items-center gap-1 rounded-[32px] bg-white/85 py-6 shadow-lg"><span>{i}</span><b className="text-[40px] leading-none">{v}</b></div>;
  const R = ({ i, l, v }: { i: ReactNode; l: string; v: ReactNode }) => <div className="flex items-center gap-4 py-3"><span className="w-10">{i}</span><span className="flex-1 text-xl font-medium text-[#37474F]">{l}</span><b className="text-xl">{v}</b></div>;
  return (
    <div className="min-h-full bg-[url(/assets/vnt1.webp)] bg-cover bg-center px-4 pb-6 pt-5 lg:bg-none lg:p-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-10"><div>
      <div className="flex items-center justify-between"><h1 className="text-[34px] font-black tracking-tight text-vl-navy">HỒ SƠ CỦA BẠN</h1><div className="flex gap-5"><button onClick={() => nav('/settings')} aria-label="Cài đặt"><Cog size={34} className="text-vl-navy" /></button><button onClick={signOut} aria-label="Đăng xuất"><LogOut size={34} className="text-red-600" /></button></div></div>
      <div className="mt-6 flex flex-col items-center">
        <div className="relative"><div className="grid h-[150px] w-[150px] place-items-center rounded-full bg-white shadow-xl">{p.customAvatarUri ? <img src={p.customAvatarUri} className="h-full w-full rounded-full object-cover" alt="" /> : <UserRound size={90} className="fill-vl-navy text-vl-navy" />}</div>
          <img src={`/assets/badge_level_${badgeFor(p.level)}.webp`} className="absolute -bottom-1 -left-6 h-14 w-14 rounded-full border-[3px] border-yellow-300 bg-white object-contain p-0.5" alt="" />
          <button onClick={() => alert('Tải ảnh đại diện sẽ có ở phiên bản sau.')} aria-label="Đổi ảnh" className="absolute -bottom-1 -right-2 grid h-11 w-11 place-items-center rounded-full bg-white text-gray-500 shadow"><Camera size={22} /></button></div>
        <div className="mt-6 flex items-center gap-3"><h2 className="text-[34px] font-black text-[#263238]">{p.userName}</h2><button onClick={() => nav('/edit-profile')} aria-label="Sửa"><Pencil size={22} className="text-gray-400" /></button>{p.isVerified && <BadgeCheck size={30} className="fill-green-600 text-white" />}</div>
        <span className="mt-3 flex items-center gap-2 rounded-2xl bg-vl-navy px-5 py-3 text-xl font-bold text-white"><GraduationCap size={24} className="text-yellow-300" />{title}</span></div>
      <div className="mt-8 grid grid-cols-3 gap-4"><S i={<Star size={36} className="fill-blue-500 text-white" />} v={p.xp} /><S i={<CircleDollarSign size={36} className="fill-amber-400 text-white" />} v={p.coins} /><S i={<Flame size={36} className="fill-orange-500 text-orange-500" />} v={p.streak} /></div>
      <div className="mt-6 flex items-center gap-5 rounded-[40px] bg-vl-navy p-6 text-white shadow-xl">
        <div className="shrink-0 rounded-full p-1.5" style={{ background: 'conic-gradient(#FDD835,#26C6DA,#66BB6A,#FDD835)' }}><div className="rounded-full bg-vl-navy p-1"><div className="grid h-[110px] w-[110px] place-items-center rounded-full bg-white"><img src={`/assets/badge_level_${badgeFor(p.level)}.webp`} className="h-20 w-20 object-contain" alt="" /></div></div></div>
        <div className="min-w-0 flex-1"><div className="flex items-baseline justify-between"><b className="text-[32px] font-black tracking-wide">CẤP ĐỘ {p.level}</b><b className="text-2xl text-yellow-300">{pct}%</b></div><div className="my-3 flex h-4 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-yellow-400" style={{ width: pct + '%' }} /></div><p className="text-lg text-white/60">Còn {Math.max(0, next - p.xp)} XP để lên cấp</p></div></div>
      </div><div>
      <Sec t="Hệ thống" /><Row icon={<Cog />} c="#607D8B" t="Cài đặt" to="/settings" />
      <Sec t="Học tập" />{teacher ? <Row icon={<ClipboardList />} c="#3949AB" t="Quản lý kiểm tra" to="/teacher-exams" /> : <Row icon={<PenSquare />} c="#3949AB" t="Tham gia phòng kiểm tra" to="/join-exam" />}
      <Sec t="Trung tâm cá nhân" /><Row icon={<Archive />} c="#8E24AA" t="Bộ sưu tập & Ngoại trang" to="/collection" /><Row icon={<Store />} c="#FBC02D" t="Cửa hàng vật phẩm" to="/shop" /><Row icon={<ClipboardList />} c="#1E88E5" t="Nhiệm vụ & Mục tiêu" to="/missions" />
      <Sec t="Tiện ích" /><Row icon={<BarChart3 />} c="#FB8C00" t="Bảng xếp hạng vinh danh" to="/leaderboard" /><Row icon={<Home />} c="#43A047" t="Ghim Widget học tập" onClick={() => alert('Widget chỉ có trên ứng dụng Android. Trên web bạn có thể dùng "Thêm vào màn hình chính" của trình duyệt.')} />
      <Sec t="Thống kê hành trình" />
      <div className="rounded-[40px] bg-white/90 px-6 py-4 shadow-lg"><R i={<BookOpen className="text-green-600" />} l="Số bài học đã đọc" v={p.totalLessonsRead ?? 0} /><R i={<FileQuestion className="text-pink-600" />} l="Số Quiz hoàn thành" v={p.totalQuizzesCompleted ?? 0} /><R i={<BadgeCheck className="fill-blue-500 text-white" />} l="Tỷ lệ trả lời đúng" v={`${qs?.total ? Math.round((qs.correct / qs.total) * 100) : 0}%`} /><R i={<Trophy className="text-amber-500" />} l="Số huy hiệu đạt được" v={Math.max(0, badgeFor(p.level) - 1)} /><R i={<CalendarDays className="text-slate-500" />} l="Ngày bắt đầu tham gia" v={start} /></div>
      </div></div>
    </div>
  );
}

/** SettingsScreen (ảnh chụp 4). */
export function Settings() {
  const { signOut } = useAuth(); const C = ({ children }: { children: ReactNode }) => <div className="rounded-[32px] bg-white px-4 py-2 shadow">{children}</div>;
  const It = ({ i, c, t, s, to, onClick }: { i: ReactNode; c: string; t: string; s?: string; to?: string; onClick?: () => void }) => { const nav = useNavigate(); return <button onClick={() => (onClick ? onClick() : to && nav(to))} className="flex w-full items-center gap-5 px-2 py-5 text-left"><span className="grid h-[52px] w-[52px] place-items-center rounded-2xl" style={{ background: c + '1a', color: c }}>{i}</span><span className="flex-1"><b className="block text-[22px] text-[#37474F]">{t}</b>{s && <span className="text-lg text-gray-500">{s}</span>}</span><ChevronRight className="text-gray-300" /></button>; };
  const L = ({ t }: { t: string }) => <h3 className="mb-3 mt-7 px-2 text-xl font-black uppercase text-gray-500">{t}</h3>;
  return <div className="min-h-full bg-[#F7F7FB]"><Head title="Cài đặt" color="#fff" dark={false} /><div className="p-4 pt-0">
    <L t="Tài khoản" /><C><It i={<UserRound />} c="#1E88E5" t="Chỉnh sửa tài khoản" s="Cập nhật thông tin cá nhân" to="/edit-profile" /><It i={<BadgeCheck />} c="#43A047" t="Gửi yêu cầu cấp tích xanh" s="Yêu cầu xác minh tài khoản" to="/verification-request" /><It i={<LogOut />} c="#E53935" t="Đăng xuất" s="Đăng xuất khỏi tài khoản" onClick={() => void signOut()} /></C>
    <L t="Hỗ trợ" /><C><It i={<Flag />} c="#FB8C00" t="Báo cáo" s="Báo cáo nội dung hoặc lỗi" to="/report" /><It i={<HelpCircle />} c="#8E24AA" t="Gửi yêu cầu hỗ trợ" s="Chúng tôi sẽ giúp đỡ bạn" to="/support-request" /></C>
    <L t="Pháp lý & Quyền riêng tư" /><C><It i={<FileText />} c="#546E7A" t="Điều khoản sử dụng" to="/terms" /><It i={<Lock />} c="#546E7A" t="Chính sách quyền riêng tư" to="/privacy" /></C></div></div>;
}

/** ReportScreen: gửi báo cáo lỗi/nội dung vào supportRequests (tiền tố [Báo cáo]) để không lẫn với báo cáo bài viết Đồng Cảm. */
export function Report() {
  const { user } = useAuth(); const nav = useNavigate(); const [k, setK] = useState('Nội dung không phù hợp'); const [c, setC] = useState('');
  return <div className="min-h-full bg-vl-bg"><Head title="Báo cáo" color="#FB8C00" /><div className="p-5"><select value={k} onChange={(e) => setK(e.target.value)} className="mb-3 w-full rounded-2xl border-2 border-gray-200 bg-white p-4">{['Nội dung không phù hợp', 'Lỗi ứng dụng', 'Khác'].map((o) => <option key={o}>{o}</option>)}</select><Inp area placeholder="Mô tả chi tiết" value={c} onChange={(e) => setC(e.target.value)} /><Btn c="#FB8C00" disabled={!c.trim()} onClick={async () => { if (!user) return; await addDoc(collection(db, 'supportRequests'), { uid: user.uid, content: `[Báo cáo – ${k}] ${c.trim()}`, status: 'pending', createdAt: serverTimestamp() }); nav(-1); }}>GỬI BÁO CÁO</Btn></div></div>;
}

/** Bộ sưu tập & Ngoại trang: vật phẩm đã mở khóa, bấm để trang bị (cập nhật selected*Id của users). */
export function Collection() {
  const { user, profile: p } = useAuth(); const owned = useQ(user ? query(collection(db, 'users', user.uid, 'unlockedItems')) : null, 'col').map((x) => x.id);
  const KEY: Record<string, string> = { AVATAR: 'selectedAvatarId', FRAME: 'selectedFrameId', BACKGROUND: 'selectedBackgroundId', TITLE: 'selectedTitleId', EFFECT: 'selectedEffectId' }; const LB: Record<string, string> = { AVATAR: 'Ảnh đại diện', FRAME: 'Khung', BACKGROUND: 'Nền', TITLE: 'Danh hiệu', EFFECT: 'Hiệu ứng' };
  const mine = ITEMS.filter((i) => KEY[i.type] && (i.price === 0 || owned.includes(i.id)));
  return <div className="min-h-full bg-vl-bg"><Head title="Bộ sưu tập & Ngoại trang" color="#8E24AA" /><div className="p-4">{Object.keys(KEY).map((t) => <div key={t}><h3 className="mb-2 mt-4 font-black text-gray-500">{LB[t]}</h3>{mine.filter((i) => i.type === t).map((i) => { const on = (p as any)?.[KEY[t]] === i.id; return <button key={i.id} onClick={() => user && void updateDoc(doc(db, 'users', user.uid), { [KEY[t]]: i.id })} className={`mb-2 flex w-full items-center justify-between rounded-2xl p-4 text-left shadow ${on ? 'bg-violet-100' : 'bg-white'}`}><span><b>{i.name}</b><span className="block text-xs text-gray-500">{i.desc}</span></span>{on && <b className="text-violet-700">Đang dùng</b>}</button>; })}</div>)}</div></div>;
}
void setDoc;
