import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
/** Thanh tiêu đề khu vực kiểm tra (nền tím nhạt, chữ đen đậm) theo ảnh chụp 4–12. */
export function TopBar({ title, sub, right, light }: { title: string; sub?: string; right?: ReactNode; light?: boolean }) {
  const nav = useNavigate();
  return (
    <div className={`flex items-center gap-3 px-3 py-3 ${light ? 'text-white' : 'bg-[#FBF7FF] text-[#1C1B1F]'}`}>
      <button onClick={() => nav(-1)} aria-label="Quay lại"><ArrowLeft /></button>
      <div className="min-w-0 flex-1"><h1 className="truncate text-xl font-black uppercase tracking-tight">{title}</h1>{sub && <p className="text-sm font-bold text-gray-400">{sub}</p>}</div>{right}
    </div>
  );
}
export function Field({ label, icon, ...p }: { label: string; icon?: ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <fieldset className="mb-5 rounded-2xl border-2 border-gray-400 px-4 pb-2 focus-within:border-vl-maroon"><legend className="px-1 text-sm text-gray-600 group-focus-within:text-vl-maroon">{label}</legend>
      <div className="flex items-center gap-4"><span className="text-gray-700">{icon}</span><input {...p} className="w-full bg-transparent py-2 text-xl outline-none" /></div></fieldset>
  );
}
export const fmtTime = (t?: { toDate(): Date } | null) => { if (!t) return ''; const d = t.toDate(); const z = (n: number) => String(n).padStart(2, '0'); return `${z(d.getHours())}:${z(d.getMinutes())}, ${z(d.getDate())}/${z(d.getMonth() + 1)}`; };
export const score1 = (n: number) => n.toFixed(1).replace('.', ',');
export const page = 'min-h-full bg-vl-bg';
