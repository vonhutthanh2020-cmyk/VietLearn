import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
/** Dựng theo SplashScreen.kt: nền img_09, lớp phủ tối dần, vòng sáng xoay, logo nhấp nhô, nút KHÁM PHÁ. */
export default function Splash() {
  const nav = useNavigate(); const { user } = useAuth();
  return (
    <div className="relative h-full overflow-hidden bg-black bg-cover bg-center text-white" style={{ backgroundImage: 'url(/assets/img_09.webp)' }}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/85" />
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="relative grid place-items-center">
          <div className="vl-ring absolute h-80 w-80 rounded-full opacity-35 blur-xl" style={{ background: 'conic-gradient(#00E5FF,transparent,#7C4DFF,transparent,#00E5FF)' }} />
          <div className="vl-logo relative h-64 w-64 rounded-full border-2 border-transparent p-2.5 shadow-[0_0_40px_#00E5FF88]" style={{ background: 'linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg,#00E5FF,#E91E63) border-box' }}>
            <img src="/assets/ic_logo2.webp" alt="VietLearn" className="h-full w-full rounded-full object-contain" />
          </div>
        </div>
        <h1 className="mt-8 text-[32px] font-black tracking-wide drop-shadow">VietLearn</h1>
        <p className="mt-2 text-base font-medium opacity-80">Hành trình tri thức và tâm hồn</p>
        <div className="mt-7 flex w-4/5 justify-around rounded-xl bg-white/10 py-3 text-xs"><span>📖<br />Tri thức</span><span>🤖<br />AI</span><span>🤝<br />Sẻ chia</span></div>
      </div>
      <div className="absolute inset-x-0 bottom-10 text-center">
        <p className="mb-3 text-xs font-bold tracking-wide opacity-90">Nhà phát hành: Võ Nhựt Thành</p>
        <button onClick={() => nav(user ? '/home' : '/login')} className="h-[46px] w-[140px] rounded-full bg-vl-pink text-[13px] font-black tracking-wide shadow-[0_8px_20px_#E91E6388]">KHÁM PHÁ ›</button>
      </div>
    </div>
  );
}
