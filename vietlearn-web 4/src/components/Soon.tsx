import { useLocation, useNavigate } from 'react-router-dom';
/** Màn hình chưa được dựng: báo rõ thay vì hiển thị nội dung giả. Xem docs/PROGRESS.md. */
export default function Soon() {
  const { pathname } = useLocation(); const nav = useNavigate();
  return (
    <div className="grid h-full place-items-center p-8 text-center">
      <div className="rounded-3xl bg-white/90 p-8 shadow-lg"><p className="text-lg font-black text-vl-navy">Đang xây dựng</p>
        <p className="mt-2 text-sm text-gray-500">Màn hình <code>{pathname}</code> chưa có trên bản web.</p>
        <button onClick={() => nav(-1)} className="mt-5 rounded-full bg-vl-navy px-6 py-2 font-bold text-white">Quay lại</button></div>
    </div>
  );
}
