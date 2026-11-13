import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as fbSignOut, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { newUserDoc, UserProfile } from '../types';

const MSG: Record<string, string> = {
  'auth/invalid-credential': 'Sai email hoặc mật khẩu', 'auth/invalid-email': 'Email không hợp lệ',
  'auth/email-already-in-use': 'Email đã được đăng ký', 'auth/weak-password': 'Mật khẩu tối thiểu 6 ký tự',
  'auth/too-many-requests': 'Thử quá nhiều lần, hãy đợi một lát', 'auth/network-request-failed': 'Lỗi kết nối mạng',
  'auth/unauthorized-domain': 'Tên miền chưa được cho phép trong Firebase Authentication', 'auth/user-disabled': 'Tài khoản đã bị vô hiệu hóa'
};
export const viError = (e: unknown): string => { const c = (e as { code?: string })?.code ?? ''; return MSG[c] ?? `Lỗi: ${c || (e as Error)?.message || 'không xác định'}`; };

interface Claims { pub: boolean; exp: number }
interface Ctx {
  user: User | null; profile: UserProfile | null; loading: boolean; pubSession: boolean; refreshClaims: () => Promise<void>;
  signIn: (email: string, pw: string) => Promise<void>;
  signUp: (email: string, pw: string, name: string, schoolId: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
}
const C = createContext<Ctx>(null as unknown as Ctx);
export const useAuth = () => useContext(C);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [profile, setProfile] = useState<UserProfile | null>(null); const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState<Claims>({ pub: false, exp: 0 }); const touched = useRef(false);
  const readClaims = async (u: User | null) => { if (!u) return setClaims({ pub: false, exp: 0 }); const r = await u.getIdTokenResult(); setClaims({ pub: r.claims.pub === true, exp: Number(r.claims.pubExp ?? 0) }); };
  useEffect(() => {
    let off: (() => void) | undefined;
    const unsub = onAuthStateChanged(auth, (u) => {
      off?.(); setUser(u); touched.current = false; void readClaims(u).catch(() => undefined);
      if (!u) { setProfile(null); setLoading(false); return; }
      off = onSnapshot(doc(db, 'users', u.uid), (s) => {
        setProfile(s.exists() ? (s.data() as UserProfile) : null); setLoading(false);
        if (s.exists() && !touched.current) { touched.current = true; void updateDoc(doc(db, 'users', u.uid), { lastActiveAt: Date.now() }).catch(() => undefined); }
      }, () => setLoading(false));
    });
    return () => { off?.(); unsub(); };
  }, []);
  const signIn = async (email: string, pw: string) => { await signInWithEmailAndPassword(auth, email, pw); };
  const signUp = async (email: string, pw: string, name: string, schoolId: string, role: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pw);
    await setDoc(doc(db, 'users', cred.user.uid), newUserDoc(cred.user.uid, name, email, role, schoolId));
  };
  const refreshClaims = async () => { const u = auth.currentUser; if (!u) return; await u.getIdToken(true); await readClaims(u); };
  return <C.Provider value={{ user, profile, loading, pubSession: claims.pub && claims.exp > Date.now(), refreshClaims, signIn, signUp, signOut: () => fbSignOut(auth) }}>{children}</C.Provider>;
}
