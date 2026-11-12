/** Khớp 1:1 với model/User.kt của app Android (collection `users`). Không đổi tên trường. */
export interface UserProfile {
  uid: string; userName: string; email: string; role: string; schoolId: string; className: string; bio: string;
  isVerified: boolean; verificationStatus: string; fcmToken: string | null;
  xp: number; level: number; coins: number; streak: number; customAvatarUri: string | null;
  selectedAvatarId: string; selectedFrameId: string; selectedBackgroundId: string; selectedTitleId: string; selectedEffectId: string;
  totalLessonsRead: number; totalQuizzesCompleted: number; totalQuestionsAsked: number;
}
/** Giá trị mặc định đúng như User() trong Kotlin, dùng khi đăng ký (giống AuthViewModel.signUp). */
export const newUserDoc = (uid: string, userName: string, email: string, role: string, schoolId: string): UserProfile => ({
  uid, userName, email, role, schoolId, className: '', bio: '', isVerified: false, verificationStatus: 'none', fcmToken: null,
  xp: 0, level: 1, coins: 0, streak: 0, customAvatarUri: null,
  selectedAvatarId: 'avatar_male', selectedFrameId: 'frame_none', selectedBackgroundId: 'bg_none', selectedTitleId: 'title_none', selectedEffectId: 'effect_none',
  totalLessonsRead: 0, totalQuizzesCompleted: 0, totalQuestionsAsked: 0
});

/** Khớp model/Exam.kt, Question.kt, ExamSubmission.kt, ExamParticipant.kt */
export interface Exam { id: string; title: string; subject: string; description: string; teacherId: string; type: string; durationMinutes: number; maxAttempts: number; maxParticipants: number; showScore: boolean; showAnswers: boolean; showSolutions: boolean; status: string; roomCode: string; roomPasswordHash: string; createdAt?: { toDate(): Date } | null; fileName?: string | null; fileUrl?: string | null }
export interface Question { id: string; questionText: string; options: string[]; correctAnswer: number; questionType: string; points: number; order: number }
export interface Submission { id: string; studentName: string; studentCode: string; uid: string; attemptNumber: number; answers: Record<string, number>; score: number; startedAt?: { toDate(): Date } | null; submittedAt?: { toDate(): Date } | null; status: string }
export interface Participant { id: string; studentName: string; studentCode: string; uid: string; status: string; attemptsUsed: number }
