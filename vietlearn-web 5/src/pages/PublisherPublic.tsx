import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { BadgeCheck } from 'lucide-react';
import { db } from '../lib/firebase';
import { dt } from '../lib/mod';
import { Head } from '../lib/ui';

/** Trang hồ sơ nhà phát hành (công khai với người dùng đã đăng nhập). */
export default function PublisherPublic() {
  const { uid = '' } = useParams(); const [p, setP] = useState<any>(undefined); const [u, setU] = useState<any>(null);
  useEffect(() => { void getDoc(doc(db, 'publisher_profiles', uid)).then((s) => setP(s.data() ?? null)).catch(() => setP(null)); void getDoc(doc(db, 'users', uid)).then((s) => setU(s.data() ?? null)).catch(() => undefined); }, [uid]);
  const name = p?.displayName || u?.userName || 'Nhà phát hành';
  return <div className="min-h-full bg-vl-bg"><Head title="Nhà phát hành" />{p === undefined ? <p className="p-6 text-gray-500">Đang tải…</p> : <>
    <div className="h-40 bg-gradient-to-r from-vl-navy to-blue-500 bg-cover bg-center" style={p?.coverUrl ? { backgroundImage: `url(${p.coverUrl})` } : undefined} />
    <div className="-mt-12 px-6 pb-8"><div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full border-4 border-white bg-vl-navy text-4xl font-black text-white">{p?.avatarUrl ? <img src={p.avatarUrl} className="h-full w-full object-cover" alt="" /> : name[0]?.toUpperCase()}</div>
      <h1 className="mt-3 flex flex-wrap items-center gap-2 text-2xl font-black">{name}{u?.isVerified && <BadgeCheck className="fill-green-600 text-white" />}<span className="rounded-md bg-vl-navy px-2 py-1 text-[11px] font-black text-white">NHÀ PHÁT HÀNH</span></h1>
      <p className="mt-1 text-sm text-gray-500">{u?.createdAt ? `Tham gia ${dt(u.createdAt)}` : ''}</p><p className="mt-4 whitespace-pre-wrap leading-7 text-[#37474F]">{p?.introduction || 'Nhà phát hành chưa cập nhật phần giới thiệu.'}</p>
      {u?.isVerified && <p className="mt-6 rounded-2xl bg-green-50 p-4 text-sm text-green-800"><b>Dấu tích xanh</b> cho biết tài khoản này đã được nhà phát hành VietLearn xác minh.</p>}</div></>}</div>;
}
