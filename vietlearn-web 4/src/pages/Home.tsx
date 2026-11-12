import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, CalendarDays, ChevronRight, Flag, Flame, Gift, Hourglass, LogOut, Mail, NotebookPen, PenLine, Radio, Sparkles, StickyNote, Trophy, Heart, ListChecks, Zap, HelpCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { badgeFor, nextLevelXp } from '../lib/gamification';
import { AnnouncementBox } from './Announcements';

function Card({ grad, icon, title, sub, text, btn, color, to }: { grad: string; icon: ReactNode; title: string; sub: string; text: string; btn: string; color: string; to: string }) {
  const nav = useNavigate();
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[40px] p-6 text-white shadow-xl lg:rounded-[28px]" style={{ background: grad }}>
      <div className="flex items-center gap-4"><div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white/20 lg:h-14 lg:w-14">{icon}</div>
        <div><h3 className="text-xl font-black tracking-[0.15em] lg:text-lg lg:tracking-wider">{title}</h3><p className="text-base font-medium text-white/85 lg:text-sm">{sub}</p></div></div>
      <p className="mt-5 flex-1 text-lg leading-snug text-white/95 lg:text-[15px]">{text}</p>
      <button onClick={() => nav(to)} className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white text-base font-black tracking-wide lg:h-12 lg:text-sm" style={{ color }}>{btn} <ChevronRight size={18} /></button>
    </div>
  );
}
const TOOLS: [string, string, ReactNode, string][] = [
  ['Nhật ký', '/diary', <NotebookPen />, '#43A047'], ['Viết thư', '/write-letter', <Mail />, '#1E88E5'], ['Mục tiêu', '/goals', <Flag />, '#FB8C00'],
  ['Ghi chú', '/notes', <StickyNote />, '#8E24AA'], ['Lịch học', '/timetable', <CalendarDays />, '#D81B60'], ['Đếm ngược', '/countdown', <Hourglass />, '#00ACC1'],
  ['Biết ơn', '/gratitude-corner', <Sparkles />, '#FBC02D'], ['Kế hoạch biểu', '/time-management', <ListChecks />, '#E53935'], ['Quan điểm', '/publisher-perspective', <PenLine />, '#607D8B']
];
/** Trang chủ: điện thoại xếp 1 cột như app; máy tính là bảng điều khiển nhiều cột. */
export default function Home() {
  const { profile, user, signOut } = useAuth(); const nav = useNavigate();
  const teacher = profile?.role === 'teacher';
  const level = profile?.level ?? 1, xp = profile?.xp ?? 0, next = nextLevelXp(level);
  const pct = Math.max(0, Math.min(100, Math.round((xp / next) * 100)));
  const name = profile?.userName ?? user?.email ?? '';
  return (
    <div className="min-h-full bg-[url(/assets/vnt1.webp)] bg-cover bg-center px-4 pb-6 pt-5 lg:bg-none lg:p-8">
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:gap-6">
        <section className="order-1 lg:col-span-8">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0"><p className="text-base text-vl-navy/60">Chào ngày mới 👋</p><h1 className="truncate text-[34px] font-black leading-tight tracking-tight text-vl-navy lg:text-4xl">{teacher ? 'Thầy ' : ''}{name}</h1></div>
            <div className="flex shrink-0 items-center gap-2 lg:hidden"><span className="flex items-center gap-1 rounded-2xl bg-white px-4 py-2 text-xl font-black shadow"><Flame className="text-orange-500" /> {profile?.streak ?? 0}</span>
              <button onClick={signOut} aria-label="Đăng xuất" className="grid h-14 w-14 place-items-center rounded-full bg-white text-red-500 shadow"><LogOut /></button></div>
          </div>
          <div className="mt-5 rounded-[40px] border-2 border-yellow-100 bg-white/95 p-6 shadow-xl lg:rounded-[28px] lg:border lg:border-slate-200 lg:shadow-sm">
            <div className="flex items-center gap-4 lg:gap-8">
              <div className="relative shrink-0"><div className="rounded-full p-1.5" style={{ background: 'conic-gradient(#7C4DFF,#29B6F6,#FDD835,#66BB6A,#7C4DFF)' }}><div className="rounded-full bg-white p-3"><img src={`/assets/badge_level_${badgeFor(level)}.webp`} className="h-24 w-24 object-contain" alt="" /></div></div>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-vl-navy px-4 py-1 text-sm font-black text-white">CẤP {level}</span></div>
              <div className="min-w-0 flex-1"><p className="text-xs font-black tracking-[0.25em] text-gray-500">TIẾN TRÌNH CHIẾN BINH</p><p className="mt-2 text-2xl font-black leading-tight text-vl-navy">Còn {Math.max(0, next - xp)} XP để thăng cấp</p>
                <p className="mt-1 text-sm text-gray-400">Mỗi bước đi đều đưa bạn đến gần hơn với thành công.</p>
                <div className="mt-4 hidden h-3 overflow-hidden rounded-full bg-slate-100 lg:block"><div className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-400" style={{ width: `${pct}%` }} /></div></div>
            </div>
            <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-100 lg:hidden"><div className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-400" style={{ width: `${pct}%` }} /></div>
            <div className="mt-3 flex items-center justify-between text-sm font-black text-vl-navy/60"><span>CẤP {level}</span><span className="rounded-xl bg-slate-100 px-4 py-2 text-vl-navy">{pct}% hoàn thành</span><span>CẤP {level + 1}</span></div>
          </div>
        </section>

        <section className="order-5 lg:order-2 lg:col-span-4"><AnnouncementBox /></section>

        <section className="order-3 lg:col-span-12">
          {teacher ? (
            <>
              <h2 className="mb-3 mt-2 text-2xl font-black tracking-wide text-vl-navy lg:text-xl">QUẢN LÝ LỚP HỌC</h2>
              <div className="grid gap-5 lg:grid-cols-2">
                <Card to="/teacher-exams" grad="linear-gradient(135deg,#1A237E,#3949AB)" color="#1A237E" icon={<HelpCircle size={30} />} title="QUẢN LÝ KIỂM TRA" sub="Hệ thống thi trực tuyến" text="Tạo bài thi mới, quản lý phòng thi và xem kết quả làm bài của học sinh." btn="VÀO TRUNG TÂM THI" />
                <Card to="/psychology-chat" grad="linear-gradient(135deg,#6200EE,#9C6FDE)" color="#6200EE" icon={<Brain size={30} />} title="PHÒNG TƯ VẤN" sub="Hỗ trợ tâm lý học sinh" text="Theo dõi và phản hồi các yêu cầu tư vấn từ học sinh." btn="XEM YÊU CẦU" />
              </div>
            </>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <button onClick={() => nav('/weekly-competition')} className="relative block w-full overflow-hidden rounded-[28px] text-left shadow-xl sm:col-span-2 lg:col-span-3"><img src="/assets/img_08.webp" alt="" className="max-h-72 w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute inset-x-5 bottom-4 text-white"><span className="rounded-xl bg-yellow-400 px-3 py-1 text-xs font-black text-black">SỰ KIỆN ĐẶC BIỆT</span><h3 className="mt-2 text-2xl font-black">ĐẤU TRƯỜNG TRI THỨC</h3><p className="text-sm">Vinh danh ngôi trường của bạn trên bảng tổng sắp!</p></div></button>
              <Card to="/join-exam" grad="linear-gradient(135deg,#1A237E,#3F51B5)" color="#1A237E" icon={<PenLine size={30} />} title="KIỂM TRA TRỰC TUYẾN" sub="Tham gia phòng thi" text="Nhập mã phòng và mật khẩu để bắt đầu làm bài kiểm tra của giáo viên." btn="VÀO PHÒNG THI" />
              <div className="flex flex-col rounded-[40px] bg-vl-navy p-6 text-white shadow-xl lg:rounded-[28px]"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="grid h-14 w-14 place-items-center rounded-full bg-white/15 text-yellow-300"><Zap /></span><h3 className="text-xl font-black tracking-wider lg:text-lg">NHIỆM VỤ CHIẾN BINH</h3></div><button onClick={() => nav('/missions')} className="text-sm font-black text-yellow-300">Tất cả</button></div>
                <div className="mt-6 grid flex-1 grid-cols-3 content-center text-center text-sm font-black">{([['Podcast', '/podcast', <Radio />], ['Quà tặng', '/lucky-wheel', <Gift />], ['BXH', '/leaderboard', <Trophy />]] as [string, string, ReactNode][]).map(([l, to, ic]) => <button key={l} onClick={() => nav(to)}><span className="mx-auto mb-2 grid h-16 w-16 place-items-center rounded-full border border-white/30 bg-white/10 lg:h-14 lg:w-14">{ic}</span>{l}</button>)}</div></div>
              <button onClick={() => nav('/learning')} className="flex w-full items-center gap-4 rounded-[36px] bg-white/95 p-5 text-left shadow-xl lg:rounded-[28px] lg:border lg:border-slate-200 lg:shadow-sm"><span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-sky-100 text-sky-600"><ListChecks /></span><span className="flex-1"><span className="block text-xs font-black tracking-[0.2em] text-gray-500">HÀNH TRÌNH HỌC TẬP</span><span className="block text-2xl font-black leading-tight text-vl-navy lg:text-xl">Kỹ năng &amp; Tư duy sống</span></span><ChevronRight className="text-sky-600" /></button>
              <Card to="/psychology-chat" grad="linear-gradient(135deg,#6200EE,#9C6FDE)" color="#6200EE" icon={<Brain size={30} />} title="PHÒNG TƯ VẤN" sub="Sẻ chia an tâm - Nhận lại bình yên" text="Nơi lắng nghe hoàn toàn ẩn danh. Đừng ngần ngại bày tỏ cùng các chuyên gia" btn="MỞ LÒNG NGAY" />
              <Card to="/ai-chat" grad="linear-gradient(135deg,#00695C,#00ACC1)" color="#00695C" icon={<Sparkles size={30} />} title="TRỢ LÝ EDU AI" sub="Đỉnh cao trí tuệ - Hỗ trợ 24/7" text="Vượt qua mọi rào cản học thuật và kỹ năng với sự hỗ trợ từ trí tuệ nhân tạo" btn="TRÒ CHUYỆN CÙNG AI" />
              <Card to="/empathy-corner" grad="linear-gradient(135deg,#E91E63,#FF80AB)" color="#D81B60" icon={<Heart size={30} />} title="GÓC ĐỒNG CẢM" sub="Kết nối tâm hồn - Sẻ chia yêu thương" text="Hơn 2.1k thông điệp yêu thương hôm nay. Khám phá những câu chuyện cảm động." btn="KHÁM PHÁ NGAY" />
            </div>
          )}
        </section>

        <section className="order-4 lg:col-span-12">
          <h2 className="mb-3 mt-2 text-2xl font-black tracking-wide text-vl-navy lg:text-xl">CÔNG CỤ ĐỒNG HÀNH</h2>
          <div className="grid grid-cols-3 gap-x-2 gap-y-8 rounded-[40px] bg-white p-6 shadow-xl sm:grid-cols-5 lg:grid-cols-9 lg:gap-y-4 lg:rounded-[28px] lg:border lg:border-slate-200 lg:shadow-sm">
            {TOOLS.map(([l, to, ic, c]) => <button key={l} onClick={() => nav(to)} className="flex flex-col items-center gap-3 text-sm font-bold text-slate-600"><span className="grid h-[88px] w-[88px] place-items-center rounded-full border-2 lg:h-16 lg:w-16 [&_svg]:h-9 [&_svg]:w-9 lg:[&_svg]:h-7 lg:[&_svg]:w-7" style={{ color: c, borderColor: c + '40', background: c + '12' }}>{ic}</span><span className="text-center leading-tight">{l}</span></button>)}
          </div>
        </section>
      </div>
    </div>
  );
}
