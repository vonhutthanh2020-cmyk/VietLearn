const inl = (t: string) => t.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith('**') && p.endsWith('**') && p.length > 4 ? <b key={i}>{p.slice(2, -2)}</b> : p));
/** Hiển thị văn bản markdown đơn giản (#, ##, ###, gạch đầu dòng, danh sách số, **đậm**). */
export function MdDoc({ t }: { t: string }) {
  return <div className="space-y-2 leading-7 text-[#37474F]">{t.split('\n').map((l, i) => {
    if (!l.trim()) return null; let m;
    if ((m = l.match(/^#\s+(.*)/))) return <h1 key={i} className="pt-2 text-2xl font-black text-vl-navy">{inl(m[1])}</h1>;
    if ((m = l.match(/^##\s+(.*)/))) return <h2 key={i} className="text-lg font-black text-vl-navy">{inl(m[1])}</h2>;
    if ((m = l.match(/^###\s+(.*)/))) return <h3 key={i} className="pt-4 text-xl font-black text-[#263238]">{inl(m[1])}</h3>;
    if ((m = l.match(/^\s*-\s+(.*)/))) return <p key={i} className="flex gap-2 pl-2"><span>•</span><span>{inl(m[1])}</span></p>;
    if ((m = l.match(/^(\d+)\.\s+(.*)/))) return <p key={i} className="flex gap-2 pl-2"><b>{m[1]}.</b><span>{inl(m[2])}</span></p>;
    return <p key={i}>{inl(l)}</p>; })}</div>;
}
