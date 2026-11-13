import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Heart, Map, Podcast, School, Scale, Shield, Spa, Star, Quiz } from './icons';
const N = '#1A237E';
const MENU: [string, ReactNode, string, string][] = [
  ['Trường học', <School />, '/topic/BAO_LUC_HOC_DUONG', '#FF5252'], ['Kỹ năng sống', <Spa />, '/topic/KY_NANG_SONG', '#4CAF50'], ['Pháp luật', <Scale />, '/topic/GOC_PHAP_LUAT', '#FFA000'],
  ['Tâm lý', <Brain />, '/topic/TAM_LY', '#7C4DFF'], ['Giới tính', <Heart />, '/topic/GIOI_TINH', '#F06292'], ['Phòng chống xâm hại', <Shield />, '/topic/PHONG_CHONG_XAM_HAI', '#D32F2F'],
  ['Khám phá VN', <Map />, '/explore-vietnam', '#1976D2'], ['Podcast', <Podcast />, '/podcast', '#E91E63'], ['Trắc nghiệm', <Quiz />, '/quiz', '#00BCD4']
];
/** Dựng theo LearningScreen.kt: 9 thẻ, nền img_oo. */
export default function Learning() {
  const nav = useNavigate();
  return (
    <div className="min-h-full bg-cover bg-center px-[22px] pb-6 pt-12 lg:px-10 lg:pt-10" style={{ backgroundImage: 'url(/assets/img_oo.webp)' }}>
      <p className="text-xs font-black tracking-[0.2em]" style={{ color: N + 'b3' }}>TRUNG TÂM</p>
      <h1 className="text-[34px] font-extrabold leading-[38px] tracking-tight" style={{ color: N }}>HÀNH TRÌNH TRI THỨC</h1>
      <div className="mb-8 mt-3 h-1.5 w-20 rounded-full" style={{ background: N }} />
      <div className="grid grid-cols-2 gap-x-[18px] gap-y-6 sm:grid-cols-3 lg:gap-6">
        {MENU.map(([t, ic, to, c]) => (
          <button key={t} onClick={() => nav(to)} className="flex h-[135px] flex-col justify-between rounded-[30px] border border-white bg-white/85 p-[18px] text-left" style={{ boxShadow: `0 10px 24px ${c}40` }}>
            <span className="grid h-11 w-11 place-items-center rounded-full [&_svg]:h-6 [&_svg]:w-6" style={{ background: c + '26', color: c }}>{ic}</span>
            <span><span className="block text-[15px] font-extrabold leading-[18px] text-[#263238]">{t}</span><span className="block text-[10px] font-black" style={{ color: c }}>Bắt đầu học</span></span>
          </button>
        ))}
      </div>
      <div className="mt-10 flex items-center gap-[18px] rounded-[32px] border border-[#F0F2F8] bg-white/90 p-6 shadow-lg"><span className="grid h-12 w-12 place-items-center rounded-full bg-yellow-300/20 text-yellow-600"><Star /></span><div><p className="text-[15px] font-black" style={{ color: N }}>Học tập không ngừng</p><p className="text-xs text-gray-500">Tích lũy XP để thăng hạng ngay hôm nay!</p></div></div>
    </div>
  );
}
