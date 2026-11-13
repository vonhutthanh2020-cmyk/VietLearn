import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, BookOpen, Brain, CalendarDays, ClipboardList, Flag, Flame, Gamepad2, Heart, Hourglass, Home, LogOut, Map, NotebookPen, PenSquare, Radio, Settings, ShieldAlert, Sparkles, Star, StickyNote, Store, Trophy, User, Zap, FileQuestion, CircleDollarSign, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { dt, effStatus } from '../lib/mod';

type Item = [string, LucideIcon];
/** Thanh điều hướng nổi trên điện thoại (theo MainActivity.kt). */
const NAV: Record<string, Item[]> = {
  student: [['/home', Home], ['/learning', BookOpen], ['/time-management', CalendarDays], ['/join-exam', PenSquare], ['/ai-chat', Sparkles], ['/profile', User]],
  teacher: [['/home', Home], ['/teacher-exams', ClipboardList], ['/time-management', CalendarDays], ['/psychology-chat', Brain], ['/profile', User]],
  moderator: [['/home', Home], ['/moderator-reports', ShieldAlert], ['/time-management', CalendarDays], ['/profile', User]],
  publisher: [['/home', Home], ['/time-management', CalendarDays], ['/publisher-perspective', PenSquare], ['/profile', User]]
};
const HIDE = ['/admin', '/publisher-gate', '/publisher/', '/ai-chat', '/psychology-chat', '/empathy', '/exam', '/create-exam', '/empathy-post', '/create-empathy-post', '/quiz', '/survey', '/game', '/memory', '/tic-tac', '/quick-math', '/whack', '/tower', '/sudoku', '/podcast', '/diary', '/write-letter', '/future-letter', '/notes', '/goals', '/countdown', '/timetable', '/gratitude', '/publisher', '/shop', '/badges', '/missions', '/leaderboard', '/school-leaderboard', '/explore-vietnam', '/moderator-reports', '/games', '/student-info', '/lesson', '/settings', '/edit-profile', '/verification', '/report', '/support', '/terms', '/privacy', '/weekly-competition'];
/** Trang dạng biểu mẫu / đọc: giữ khung hẹp, căn giữa trên máy tính. */
const NARROW = ['/join-exam', '/student-info', '/create-exam', '/exam-settings', '/exam-room', '/exam-participants', '/exam-submissions', '/exam-result', '/lesson', '/edit-profile', '/settings', '/report', '/support', '/verification', '/survey', '/quiz', '/create-empathy-post', '/empathy-post', '/terms', '/privacy', '/podcast', '/missions', '/badges', '/collection', '/my-collection', '/announcements', '/ai-chat', '/memory', '/tic-tac', '/quick-math', '/whack', '/game-2048', '/tower', '/sudoku'];

type G = { t: string; i: [string, string, LucideIcon, string[]?][] };
const GROUPS: G[] = [
  { t: 'Chính', i: [['/home', 'Trang chủ', Home], ['/learning', 'Học tập', BookOpen], ['/announcements', 'Thông báo', Bell]] },
  { t: 'Kiểm tra', i: [['/join-exam', 'Tham gia phòng thi', PenSquare, ['student', 'moderator', 'publisher']], ['/teacher-exams', 'Quản lý kiểm tra', ClipboardList, ['teacher']], ['/quiz', 'Trắc nghiệm', FileQuestion]] },
  { t: 'Cộng đồng', i: [['/psychology-chat', 'Phòng tư vấn', Brain, ['student', 'teacher']], ['/empathy-corner', 'Góc Đồng Cảm', Heart], ['/ai-chat', 'Trợ lý EDU AI', Sparkles], ['/moderator-reports', 'Báo cáo vi phạm', ShieldAlert, ['moderator']]] },
  { t: 'Công cụ cá nhân', i: [['/time-management', 'Kế hoạch biểu', CalendarDays], ['/diary', 'Nhật ký', NotebookPen], ['/notes', 'Ghi chú', StickyNote], ['/goals', 'Mục tiêu', Flag], ['/timetable', 'Lịch học', CalendarDays], ['/countdown', 'Đếm ngược', Hourglass], ['/gratitude-corner', 'Góc biết ơn', Sparkles], ['/publisher-perspective', 'Quan điểm', PenSquare]] },
  { t: 'Khám phá', i: [['/podcast', 'Podcast', Radio], ['/explore-vietnam', 'Khám phá Việt Nam', Map], ['/games', 'Trò chơi', Gamepad2]] },
  { t: 'Thành tích', i: [['/missions', 'Nhiệm vụ', Zap], ['/leaderboard', 'Bảng xếp hạng', Trophy], ['/shop', 'Cửa hàng', Store]] },
  { t: 'Quản trị', i: [['/admin', 'Trung tâm quản trị', ShieldCheck, ['publisher', 'moderator']]] },
  { t: 'Tài khoản', i: [['/profile', 'Hồ sơ', User], ['/settings', 'Cài đặt', Settings]] }
];
const ROLE: Record<string, string> = { student: 'Học sinh', teacher: 'Giáo viên', publisher: 'Nhà phát hành', moderator: 'Kiểm duyệt viên' };

export default function Shell() {
  const { profile, signOut } = useAuth(); const { pathname } = useLocation(); const nav = useNavigate();
  const role = profile?.role ?? 'student'; const items = NAV[role] ?? NAV.student;
  const hide = HIDE.some((p) => pathname.startsWith(p)); const focus = pathname.startsWith('/exam/'); // đang làm bài: ẩn thanh bên
  const narrow = NARROW.some((p) => pathname.startsWith(p));
  return (
    <div className="h-full lg:flex lg:bg-[#EEF3FB]">
      {!focus && (
        <aside className="hidden h-full w-72 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
          <button onClick={() => nav('/home')} className="flex items-center gap-3 px-6 py-5 text-left"><img src="/assets/ic_logo2.webp" alt="" className="h-12 w-12 rounded-full object-contain shadow" /><span><b className="block text-xl font-black text-vl-navy">VietLearn</b><span className="text-xs text-gray-500">Học hôm nay – Kiến tạo tương lai</span></span></button>
          <nav className="flex-1 overflow-y-auto px-3 pb-4">
            {GROUPS.map((g) => { const its = g.i.filter((x) => !x[3] || x[3].includes(role)); return its.length ? (
              <div key={g.t} className="mb-3"><p className="px-3 pb-1 pt-2 text-[11px] font-black uppercase tracking-widest text-slate-400">{g.t}</p>
                {its.map(([to, label, Icon]) => <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition ${isActive ? 'bg-vl-navy text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}><Icon size={19} />{label}</NavLink>)}</div>) : null; })}
          </nav>
          <div className="border-t border-slate-200 p-4"><button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-semibold text-red-600 hover:bg-red-50"><LogOut size={19} />Đăng xuất</button></div>
        </aside>
      )}
      <div className="flex h-full min-w-0 flex-1 flex-col">
        {!focus && (
          <header className="hidden h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur lg:flex">
            <p className="text-slate-500">Xin chào, <b className="text-vl-navy">{profile?.userName ?? ''}</b> <span className="ml-2 rounded-full bg-vl-navy/10 px-3 py-1 text-xs font-bold text-vl-navy">{ROLE[role] ?? role}</span></p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-black text-orange-600"><Flame size={16} />{profile?.streak ?? 0}</span>
              <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-black text-blue-600"><Star size={16} />{profile?.xp ?? 0} XP</span>
              <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-black text-amber-600"><CircleDollarSign size={16} />{profile?.coins ?? 0}</span>
              <button onClick={() => nav('/announcements')} aria-label="Thông báo" className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"><Bell size={19} /></button>
              <button onClick={() => nav('/profile')} aria-label="Hồ sơ" className="grid h-10 w-10 place-items-center rounded-full bg-vl-navy font-black text-white">{(profile?.userName ?? 'U')[0]?.toUpperCase()}</button>
            </div>
          </header>
        )}
        <div className={`relative min-h-0 flex-1 ${focus ? '' : 'lg:p-6'}`}>
          {effStatus(profile) === 'RESTRICTED' && profile?.sanction && <div className="absolute inset-x-0 top-0 z-20 bg-amber-100 px-4 py-2 text-center text-sm font-bold text-amber-800 lg:inset-x-6 lg:top-6 lg:rounded-t-3xl">Tài khoản đang bị hạn chế{profile.sanction.until ? ` đến ${dt(profile.sanction.until)}` : ''}. Lý do: {profile.sanction.reason}</div>}
          <div className={`h-full overflow-y-auto ${hide ? '' : 'pb-28'} lg:pb-0 ${focus ? '' : 'lg:rounded-3xl lg:bg-white lg:shadow-sm lg:ring-1 lg:ring-slate-200'}`}>
            <div className={`h-full ${narrow && !focus ? 'lg:mx-auto lg:max-w-3xl' : ''}`}><Outlet /></div>
          </div>
          {!hide && (
            <nav className="absolute inset-x-4 bottom-4 mx-auto flex max-w-3xl justify-around rounded-full border border-white/40 bg-white/20 px-2 py-3 shadow-lg backdrop-blur-xl lg:hidden">
              {items.map(([to, Icon]) => <NavLink key={to} to={to} className="flex flex-col items-center gap-1 px-2">{({ isActive }) => (<><Icon size={26} className={isActive ? 'text-sky-500' : 'text-slate-600/80'} /><span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-cyan-400' : 'bg-transparent'}`} /></>)}</NavLink>)}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
