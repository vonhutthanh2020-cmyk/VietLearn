import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Head } from '../lib/ui';

const G = ({ t, children }: { t: string; children: React.ReactNode }) => <div className="min-h-full bg-vl-bg"><Head title={t} color="#7C4DFF" /><div className="p-5">{children}</div></div>;
export function Games() {
  const nav = useNavigate(); const L: [string, string, string][] = [['Lật hình', '🧠', '/memory-game'], ['Cờ Caro', '⭕', '/tic-tac-toe'], ['Tính nhanh', '➕', '/quick-math'], ['Đập chuột', '🐹', '/whack-a-mole'], ['2048', '🔢', '/game-2048'], ['Tháp Hà Nội', '🗼', '/tower-of-hanoi'], ['Sudoku', '🔲', '/sudoku']];
  return <G t="Trò chơi"><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{L.map(([n, i, to]) => <button key={n} onClick={() => nav(to)} className="rounded-3xl bg-white p-6 text-center shadow"><span className="text-4xl">{i}</span><b className="mt-2 block">{n}</b></button>)}</div></G>;
}
export function Memory() {
  const E = ['🐶', '🐱', '🦊', '🐼', '🦁', '🐸', '🐵', '🐯']; const [c, setC] = useState(() => [...E, ...E].sort(() => Math.random() - 0.5)); const [op, setOp] = useState<number[]>([]); const [dn, setDn] = useState<number[]>([]); const [mv, setMv] = useState(0);
  const tap = (i: number) => { if (op.length === 2 || op.includes(i) || dn.includes(i)) return; const n = [...op, i]; setOp(n); if (n.length === 2) { setMv(mv + 1); setTimeout(() => { if (c[n[0]] === c[n[1]]) setDn((d) => [...d, ...n]); setOp([]); }, 700); } };
  return <G t="Lật hình"><p className="mb-3 font-bold">Số lượt: {mv}{dn.length === 16 ? ' · Bạn đã thắng! 🎉' : ''}</p><div className="grid grid-cols-4 gap-2">{c.map((e, i) => <button key={i} onClick={() => tap(i)} className={`aspect-square rounded-2xl text-3xl ${op.includes(i) || dn.includes(i) ? 'bg-white shadow' : 'bg-violet-500 text-white'}`}>{op.includes(i) || dn.includes(i) ? e : '?'}</button>)}</div><button onClick={() => { setC([...E, ...E].sort(() => Math.random() - 0.5)); setDn([]); setOp([]); setMv(0); }} className="mt-5 w-full rounded-2xl border-2 border-violet-500 py-3 font-black text-violet-600">Chơi lại</button></G>;
}
export function TicTacToe() {
  const [b, setB] = useState<string[]>(Array(9).fill('')); const W = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]; const win = (x: string[], p: string) => W.some((w) => w.every((i) => x[i] === p));
  const over = win(b, '❌') ? 'Bạn thắng! 🎉' : win(b, '⭕') ? 'Máy thắng 😅' : b.every(Boolean) ? 'Hòa!' : '';
  const tap = (i: number) => { if (b[i] || over) return; const n = [...b]; n[i] = '❌'; const e = n.map((v, k) => (v ? -1 : k)).filter((k) => k >= 0); if (!win(n, '❌') && e.length) n[e[Math.floor(Math.random() * e.length)]] = '⭕'; setB(n); };
  return <G t="Cờ Caro 3x3"><p className="mb-3 text-center font-bold">{over || 'Bạn là ❌ – đi trước'}</p><div className="mx-auto grid max-w-xs grid-cols-3 gap-2">{b.map((v, i) => <button key={i} onClick={() => tap(i)} className="aspect-square rounded-2xl bg-white text-4xl shadow">{v}</button>)}</div><button onClick={() => setB(Array(9).fill(''))} className="mt-5 w-full rounded-2xl border-2 border-violet-500 py-3 font-black text-violet-600">Chơi lại</button></G>;
}
export function QuickMath() {
  const gen = () => { const a = 1 + Math.floor(Math.random() * 20), b = 1 + Math.floor(Math.random() * 20), op = ['+', '-', '×'][Math.floor(Math.random() * 3)]; return { a, b, op, r: op === '+' ? a + b : op === '-' ? a - b : a * b }; };
  const [q, setQ] = useState(gen); const [v, setV] = useState(''); const [s, setS] = useState(0); const [t, setT] = useState(30);
  useEffect(() => { if (t <= 0) return; const id = setTimeout(() => setT(t - 1), 1000); return () => clearTimeout(id); }, [t]);
  const ok = () => { if (+v === q.r) setS(s + 1); setV(''); setQ(gen()); };
  return <G t="Tính nhanh"><p className="text-right font-black">⏱ {t}s · Điểm {s}</p>{t > 0 ? <><p className="my-10 text-center text-5xl font-black">{q.a} {q.op} {q.b} = ?</p><input autoFocus value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ok()} inputMode="numeric" className="w-full rounded-2xl border-2 p-4 text-center text-3xl" /><button onClick={ok} className="mt-4 w-full rounded-2xl bg-violet-500 py-4 font-black text-white">TRẢ LỜI</button></> : <><p className="my-10 text-center text-3xl font-black">Hết giờ! Điểm: {s}</p><button onClick={() => { setT(30); setS(0); setQ(gen()); }} className="w-full rounded-2xl bg-violet-500 py-4 font-black text-white">Chơi lại</button></>}</G>;
}
export function WhackAMole() {
  const [m, setM] = useState(-1); const [s, setS] = useState(0); const [t, setT] = useState(30);
  useEffect(() => { if (t <= 0) return; const a = setTimeout(() => setT(t - 1), 1000); const b = setInterval(() => setM(Math.floor(Math.random() * 9)), 700); return () => { clearTimeout(a); clearInterval(b); }; }, [t]);
  return <G t="Đập chuột"><p className="mb-3 text-right font-black">⏱ {t}s · Điểm {s}</p><div className="grid grid-cols-3 gap-3">{Array.from({ length: 9 }, (_, i) => <button key={i} onClick={() => { if (t > 0 && i === m) { setS(s + 1); setM(-1); } }} className="aspect-square rounded-full bg-amber-900/20 text-5xl">{i === m && t > 0 ? '🐹' : ''}</button>)}</div>{t <= 0 && <button onClick={() => { setT(30); setS(0); }} className="mt-5 w-full rounded-2xl bg-violet-500 py-4 font-black text-white">Chơi lại</button>}</G>;
}
const slide = (row: number[]) => { const r = row.filter(Boolean); for (let i = 0; i < r.length - 1; i++) if (r[i] === r[i + 1]) { r[i] *= 2; r.splice(i + 1, 1); } while (r.length < 4) r.push(0); return r; };
const spawn = (g: number[][]) => { const e: [number, number][] = []; g.forEach((r, y) => r.forEach((v, x) => !v && e.push([y, x]))); if (!e.length) return g; const [y, x] = e[Math.floor(Math.random() * e.length)]; const n = g.map((r) => [...r]); n[y][x] = Math.random() < 0.9 ? 2 : 4; return n; };
export function Game2048() {
  const [g, setG] = useState(() => spawn(spawn(Array.from({ length: 4 }, () => Array(4).fill(0))))); const ref = useRef(g); ref.current = g;
  const move = (d: 'L' | 'R' | 'U' | 'D') => { const cur = ref.current; let n: number[][]; const T = (m: number[][]) => m[0].map((_, i) => m.map((r) => r[i]));
    if (d === 'L') n = cur.map(slide); else if (d === 'R') n = cur.map((r) => slide([...r].reverse()).reverse()); else if (d === 'U') n = T(T(cur).map(slide)); else n = T(T(cur).map((r) => slide([...r].reverse()).reverse()));
    if (JSON.stringify(n) !== JSON.stringify(cur)) setG(spawn(n)); };
  useEffect(() => { const h = (e: KeyboardEvent) => { const m: any = { ArrowLeft: 'L', ArrowRight: 'R', ArrowUp: 'U', ArrowDown: 'D' }; if (m[e.key]) { e.preventDefault(); move(m[e.key]); } }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, []);
  const col = (v: number) => (v ? `hsl(${40 - Math.log2(v) * 3},90%,${85 - Math.log2(v) * 4}%)` : '#eee');
  return <G t="2048"><div className="mx-auto grid max-w-xs grid-cols-4 gap-2 rounded-2xl bg-gray-300 p-2">{g.flat().map((v, i) => <div key={i} className="grid aspect-square place-items-center rounded-xl text-xl font-black" style={{ background: col(v) }}>{v || ''}</div>)}</div><div className="mx-auto mt-5 grid max-w-[200px] grid-cols-3 gap-2 text-2xl"><span /><button onClick={() => move('U')} className="rounded-xl bg-white py-3 shadow">↑</button><span /><button onClick={() => move('L')} className="rounded-xl bg-white py-3 shadow">←</button><button onClick={() => move('D')} className="rounded-xl bg-white py-3 shadow">↓</button><button onClick={() => move('R')} className="rounded-xl bg-white py-3 shadow">→</button></div></G>;
}
export function Hanoi() {
  const N = 4; const [p, setP] = useState<number[][]>([[4, 3, 2, 1], [], []]); const [s, setS] = useState<number | null>(null); const [mv, setMv] = useState(0);
  const tap = (i: number) => { if (s === null) { if (p[i].length) setS(i); return; } if (s !== i) { const a = p[s]; const d = a[a.length - 1]; const t = p[i]; if (!t.length || t[t.length - 1] > d) { const n = p.map((x) => [...x]); n[s].pop(); n[i].push(d); setP(n); setMv(mv + 1); } } setS(null); };
  return <G t="Tháp Hà Nội"><p className="mb-3 font-bold">Số bước: {mv}{p[2].length === N ? ' · Hoàn thành! 🎉' : ''}</p><div className="grid grid-cols-3 gap-3">{p.map((pg, i) => <button key={i} onClick={() => tap(i)} className={`flex h-64 flex-col-reverse items-center gap-1 rounded-2xl p-2 ${s === i ? 'bg-violet-200' : 'bg-white'} shadow`}>{pg.map((d) => <span key={d} className="h-8 rounded-full bg-violet-500" style={{ width: `${25 + d * 18}%` }} />)}</button>)}</div><button onClick={() => { setP([[4, 3, 2, 1], [], []]); setMv(0); setS(null); }} className="mt-5 w-full rounded-2xl border-2 border-violet-500 py-3 font-black text-violet-600">Chơi lại</button></G>;
}
const PUZ = '530070000600195000098000060800060003400803001700020006060000280000419005000080079'; const SOL = '534678912672195348198342567859761423426853791713924856961537284287419635345286179';
export function Sudoku() {
  const [g, setG] = useState(PUZ.split('').map(Number)); const [sel, setSel] = useState(-1); const fixed = (i: number) => PUZ[i] !== '0'; const done = g.join('') === SOL;
  return <G t="Sudoku"><div className="mx-auto grid max-w-sm grid-cols-9 border-2 border-gray-700 bg-white">{g.map((v, i) => <button key={i} onClick={() => setSel(i)} className={`grid aspect-square place-items-center border border-gray-200 text-lg ${fixed(i) ? 'font-black' : 'text-blue-600'} ${sel === i ? 'bg-yellow-100' : ''} ${v && !fixed(i) && String(v) !== SOL[i] ? 'text-red-600' : ''}`} style={{ borderRight: i % 9 === 2 || i % 9 === 5 ? '2px solid #444' : undefined, borderBottom: Math.floor(i / 9) === 2 || Math.floor(i / 9) === 5 ? '2px solid #444' : undefined }}>{v || ''}</button>)}</div>
    <div className="mx-auto mt-4 grid max-w-sm grid-cols-5 gap-2">{[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => <button key={n} onClick={() => sel >= 0 && !fixed(sel) && setG(g.map((x, i) => (i === sel ? n : x)))} className="rounded-xl bg-white py-3 font-black shadow">{n || '⌫'}</button>)}</div>{done && <p className="mt-4 text-center text-xl font-black text-green-700">Chính xác! 🎉</p>}</G>;
}
