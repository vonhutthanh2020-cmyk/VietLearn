import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { CheckCircle2, ChevronLeft } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../auth/AuthContext';
import { markRead, track } from '../lib/db';
import { Lesson as L, TOPICS } from './topics';

const THEME: Record<string, [string, string]> = {
  BAO_LUC_HOC_DUONG: ['#E74C3C', 'Bạo lực học đường'], GIOI_TINH: ['#F06292', 'Giáo dục giới tính'], KY_NANG_SONG: ['#27AE60', 'Kỹ năng sống'],
  PHAP_LUAT: ['#E67E22', 'Góc pháp luật'], GOC_PHAP_LUAT: ['#E67E22', 'Góc pháp luật'], TAM_LY: ['#9B59B6', 'Tâm lý học đường'], PHONG_CHONG_XAM_HAI: ['#B71C1C', 'Phòng chống xâm hại']
};
/** Dựng theo DetailScreen.kt: dòng ">" là ô gợi ý 💡; "-", "●", "*" là gạch đầu dòng; còn lại là đoạn văn. */
export default function Lesson() {
  const { id = '' } = useParams(); const { user } = useAuth(); const nav = useNavigate(); const [l, setL] = useState<L | null>(null); const [err, setErr] = useState('');
  useEffect(() => { getDoc(doc(db, 'Lessons', id)).then((s) => (s.exists() ? (setL({ ...(s.data() as Omit<L, 'id'>), id: s.id }), user && (void track(user.uid, 'd1'), void markRead(user.uid, id))) : setErr('Không tìm thấy bài học'))).catch((e) => setErr(e.code || e.message)); }, [id]);
  const [c, disp] = THEME[l?.category ?? ''] ?? ['#1A237E', 'Bài học']; void TOPICS;
  return (
    <div className="min-h-full bg-[#F8F9FA]">
      <div className="flex items-center gap-2 px-3 py-3 text-white" style={{ background: c }}><button onClick={() => nav(-1)}><ChevronLeft /></button><div className="min-w-0"><p className="text-[11px] opacity-80">{disp}</p><p className="truncate font-bold">{l?.title ?? '...'}</p></div></div>
      <div className="h-[100px]" style={{ background: `linear-gradient(180deg,${c},#F8F9FA)` }} />
      <div className="relative -mt-[60px] mx-4 mb-16 rounded-[28px] bg-white p-6 shadow">
        {err && <p className="text-red-600">{err}</p>}
        {!l && !err && <p className="text-gray-500">Đang tải...</p>}
        {l && (<>
          <span className="inline-block rounded-xl px-3 py-1.5 text-xs font-black tracking-wide" style={{ background: c + '1a', color: c }}>TƯ LIỆU CHUYÊN SÂU</span>
          <h2 className="mt-5 text-2xl font-extrabold leading-[34px] text-[#263238]">{l.title}</h2><hr className="my-6 border-[#ECEFF1]" />
          {l.content.split('\n').map((x) => x.trim()).filter(Boolean).map((t, i) =>
            t.startsWith('>') ? <div key={i} className="my-3 flex items-center gap-4 rounded-2xl border p-4" style={{ background: c + '0d', borderColor: c + '33' }}><span className="text-2xl">💡</span><b className="text-sm leading-[22px] text-gray-600">{t.slice(1).trim()}</b></div>
            : /^[-●*]/.test(t) ? <div key={i} className="flex gap-3 px-1 py-1"><CheckCircle2 size={18} className="mt-1 shrink-0" style={{ color: c }} /><span className="text-base leading-[26px] text-[#455A64]">{t.slice(1).trim()}</span></div>
            : <p key={i} className="my-1.5 text-base leading-7 text-[#37474F]">{t}</p>)}
          <button onClick={() => nav(-1)} className="mt-10 h-14 w-full rounded-2xl font-black text-white" style={{ background: c }}>ĐÃ HIỂU &amp; QUAY LẠI</button>
        </>)}
      </div>
    </div>
  );
}
