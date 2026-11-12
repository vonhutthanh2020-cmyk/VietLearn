import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '../lib/firebase';
import { Lesson, TOPICS } from './topics';

/** Dựng theo các màn chủ đề: dữ liệu Firestore `Lessons` lọc theo `category`, sắp theo `order`. */
export default function Topic() {
  const { key = '' } = useParams(); const nav = useNavigate(); const T = TOPICS[key];
  const [list, setList] = useState<Lesson[] | null>(null); const [err, setErr] = useState('');
  useEffect(() => {
    if (!T) return;
    getDocs(query(collection(db, 'Lessons'), where('category', '==', key)))
      .then((s) => setList(s.docs.map((d) => ({ ...(d.data() as Omit<Lesson, 'id'>), id: d.id })).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))))
      .catch((e) => { setErr(e.code || e.message); setList([]); });
  }, [key, T]);
  if (!T) return <p className="p-6">Chủ đề không tồn tại.</p>;
  const n = list?.length ?? 0;
  return (
    <div className="min-h-full pb-6" style={{ background: T.bg }}>
      <div className="flex items-center gap-2 px-3 py-3 text-white" style={{ background: T.color }}><button onClick={() => nav(-1)}><ChevronLeft /></button><h1 className="text-lg font-black">{T.bar}</h1></div>
      <div className="h-[200px] p-6 text-white" style={{ background: `linear-gradient(180deg,${T.color},${T.grad2 ?? T.color + 'cc'},${T.bg})` }}>
        <div className="grid h-[50px] w-[50px] place-items-center rounded-full bg-white/20 text-xl">📘</div>
        <h2 className="mt-4 whitespace-pre-line text-[30px] font-black leading-[34px]">{T.hero}</h2><p className="mt-1 text-sm text-white/90">{T.sub(n)}</p>
      </div>
      <h3 className="px-5 pb-2 text-base font-black" style={{ color: T.dark }}>{T.head}</h3>
      {list === null && <p className="px-5 text-sm text-gray-500">Đang tải bài học...</p>}
      {err && <p className="px-5 text-sm text-red-600">Không đọc được bài học ({err}).</p>}
      {list?.length === 0 && !err && <p className="px-5 text-sm text-gray-500">Chưa có bài học.</p>}
      <div className="lg:grid lg:grid-cols-2 lg:px-4">{list?.map((l) => (
        <button key={l.id} onClick={() => nav(`/lesson/${l.id}`)} className="mx-4 my-1.5 flex w-[calc(100%-2rem)] items-center gap-4 rounded-[20px] bg-white p-4 text-left shadow">
          <span className="grid h-[45px] w-[45px] shrink-0 place-items-center rounded-xl font-black" style={{ background: T.color + '1a', color: T.color }}>{l.order}</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-base font-bold">{l.title}</span><span className="block truncate text-xs text-gray-500">{l.chapter}</span></span><ChevronRight className="text-gray-300" />
        </button>
      ))}</div>
    </div>
  );
}
