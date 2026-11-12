import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const env = import.meta.env;
// Cấu hình Firebase Web là định danh CÔNG KHAI (không phải khóa bí mật). Có giá trị dự phòng để trang không bị trắng khi thiếu biến môi trường.
export const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyAQwyCMjKya1IrJInF2Uofyzivkk1vKxEw',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'giaoduchocduong.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'giaoduchocduong',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'giaoduchocduong.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '926883754001',
  appId: env.VITE_FIREBASE_APP_ID || '1:926883754001:web:ed578a66e9321787ae01b0'
});
export const auth = getAuth(app);
export const db = getFirestore(app);
