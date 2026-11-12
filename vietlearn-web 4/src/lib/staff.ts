/** Mã xác thực để vào tài khoản Giáo viên / Kiểm duyệt. Có thể đổi bằng biến môi trường VITE_STAFF_CODE. */
export const STAFF_CODE = (import.meta.env.VITE_STAFF_CODE as string | undefined) || 'GV2026ACS';
export const needsCode = (role?: string) => role === 'teacher' || role === 'moderator';
/** Chuẩn hóa mã trường giống PsychologyChatViewModel.kt: trim → hoa → rỗng thì "CHUNG". */
export const normSchool = (s?: string) => (s ?? '').trim().toUpperCase() || 'CHUNG';
