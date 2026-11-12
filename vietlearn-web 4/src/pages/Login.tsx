import { useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { signOut as fbOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { KeyRound } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { STAFF_CODE, needsCode } from '../lib/staff';
import { useAuth, viError } from '../auth/AuthContext';

const ROLES: [string, string][] = [['student', 'Học sinh'], ['teacher', 'Giáo viên'], ['publisher', 'Phát hành'], ['moderator', 'Kiểm duyệt']]; // đủ 4 vai trò như app Android
function Field({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return <div className="mb-4 flex items-center gap-3 border-b border-white/20 focus-within:border-white/50"><span className="text-vl-blue">{icon}</span>{children}</div>;
}
const inp = 'flex-1 bg-transparent py-3.5 text-white placeholder-white/60 outline-none';
/** Dựng theo LoginScreen.kt / RegisterScreen.kt và ảnh chụp 1–2. */
export default function Login() {
  const nav = useNavigate(); const { signIn, signUp } = useAuth();
  const [up, setUp] = useState(false); const [show, setShow] = useState(false); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const [f, setF] = useState({ name: '', email: '', school: '', role: 'student', pw: '', pw2: '', code: '' });
  const on = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const submit = async () => {
    setErr('');
    if (!f.email || !f.pw) return setErr('Vui lòng nhập đủ thông tin');
    if (up && !f.name.trim()) return setErr('Vui lòng nhập họ và tên');
    if (up && f.pw !== f.pw2) return setErr('Mật khẩu xác nhận không khớp');
    if (up && needsCode(f.role) && f.code.trim() !== STAFF_CODE) return setErr('Mã xác thực giáo viên / kiểm duyệt không đúng.');
    setBusy(true);
    try {
      if (up) await signUp(f.email.trim(), f.pw, f.name.trim(), f.school.trim(), f.role);
      else {
        await signIn(f.email.trim(), f.pw);
        const uid = auth.currentUser?.uid; const role = uid ? (await getDoc(doc(db, 'users', uid))).data()?.role : '';
        if (needsCode(role) && f.code.trim() !== STAFF_CODE) { await fbOut(auth); return setErr('Tài khoản giáo viên / kiểm duyệt cần nhập đúng mã xác thực.'); }
      }
      nav('/home', { replace: true });
    } catch (e) { setErr(viError(e)); } finally { setBusy(false); }
  };
  const Eyes = <button type="button" onClick={() => setShow(!show)} className="text-white/70">{show ? <Eye size={22} /> : <EyeOff size={22} />}</button>;
  return (
    <div className="relative h-full overflow-y-auto bg-cover bg-center text-white" style={{ backgroundImage: 'url(/assets/img_09.webp)' }}>
      <div className="fixed inset-0 bg-black/40" />
      <div className="relative mx-auto flex min-h-full max-w-md flex-col items-center justify-center px-6 py-8 text-center">
        <img src="/assets/ic_logo2.webp" alt="" className="h-[90px] w-[90px] rounded-full bg-white object-contain shadow-xl" />
        <h1 className={`mt-8 font-black tracking-tight ${up ? 'text-3xl' : 'text-[34px]'}`}>{up ? 'GIA NHẬP EDU' : 'Chào bạn trở lại!'}</h1>
        <p className="mb-9 mt-2 text-[15px] opacity-80">{up ? 'Kiến tạo tương lai tri thức cùng cộng đồng' : 'Đăng nhập để tiếp tục hành trình tri thức'}</p>
        <div className="w-full rounded-[32px] border border-white/20 bg-white/10 p-5 text-left backdrop-blur-md">
          {up && <Field icon={<User size={22} />}><input className={inp} placeholder="Họ và tên của bạn" value={f.name} onChange={on('name')} /></Field>}
          <Field icon={<Mail size={22} />}><input className={inp} type="email" placeholder="Địa chỉ Email" value={f.email} onChange={on('email')} /></Field>
          {up && <Field icon={<GraduationCap size={22} />}><input className={inp} placeholder="Mã trường / Tên trường" value={f.school} onChange={on('school')} /></Field>}
          {up && (
            <div className="mb-4"><p className="mb-2 text-xs font-black tracking-widest opacity-80">BẠN LÀ AI?</p>
              <div className="grid grid-cols-2 gap-3">{ROLES.map(([k, l]) => <button key={k} type="button" onClick={() => setF({ ...f, role: k })} className={`rounded-2xl border py-3 text-sm font-bold ${f.role === k ? 'border-vl-blue bg-vl-blue/40' : 'border-white/20 bg-white/10'}`}>{l}</button>)}</div></div>
          )}
          <Field icon={<Lock size={22} />}><input className={inp} type={show ? 'text' : 'password'} placeholder="Mật khẩu" value={f.pw} onChange={on('pw')} />{Eyes}</Field>
          {(!up || needsCode(f.role)) && <Field icon={<KeyRound size={22} />}><input className={inp} placeholder={up ? 'Mã xác thực giáo viên / kiểm duyệt' : 'Mã xác thực (chỉ giáo viên / kiểm duyệt)'} value={f.code} onChange={on('code')} /></Field>}
          {up && <Field icon={<ShieldCheck size={22} />}><input className={inp} type={show ? 'text' : 'password'} placeholder="Xác nhận mật khẩu" value={f.pw2} onChange={on('pw2')} />{Eyes}</Field>}
        </div>
        <button onClick={submit} disabled={busy} className="mt-9 h-[60px] w-full rounded-[20px] bg-vl-blue text-base font-black tracking-widest shadow-[0_12px_28px_#3B82F680] disabled:opacity-60">{busy ? '…' : up ? 'TẠO TÀI KHOẢN' : 'BẮT ĐẦU NGAY'}</button>
        {err && <p className="mt-4 text-sm font-bold text-vl-err">{err}</p>}
        <p className="mt-7 opacity-90">{up ? 'Đã có tài khoản? ' : 'Bạn là thành viên mới? '}<button className="font-black text-vl-link" onClick={() => { setUp(!up); setErr(''); }}>{up ? 'Đăng nhập' : 'Tạo tài khoản'}</button></p>
      </div>
    </div>
  );
}
