import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
export function Head({ title, sub, color = '#1A237E', right, dark = true }: { title: string; sub?: string; color?: string; right?: ReactNode; dark?: boolean }) {
  const nav = useNavigate();
  return <div className="flex items-center gap-3 px-3 py-3" style={{ background: color, color: dark ? '#fff' : '#111' }}><button onClick={() => nav(-1)} aria-label="Quay lại"><ArrowLeft /></button><div className="min-w-0 flex-1"><p className="truncate text-lg font-black">{title}</p>{sub && <p className="text-xs opacity-80">{sub}</p>}</div>{right}</div>;
}
export const Empty = ({ t }: { t: string }) => <p className="mt-10 text-center text-gray-500">{t}</p>;
export const Btn = ({ c = '#1A237E', ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { c?: string }) => <button {...p} style={{ background: c, ...p.style }} className={`h-14 w-full rounded-2xl font-black text-white disabled:opacity-50 ${p.className ?? ''}`} />;
export const Inp = (p: React.InputHTMLAttributes<HTMLInputElement> & { area?: boolean }) => p.area ? <textarea rows={4} {...(p as any)} className="mb-3 w-full rounded-2xl border-2 border-gray-200 bg-white p-4 outline-none focus:border-vl-navy" /> : <input {...p} className="mb-3 w-full rounded-2xl border-2 border-gray-200 bg-white p-4 outline-none focus:border-vl-navy" />;
