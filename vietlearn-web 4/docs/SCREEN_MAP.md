# Bản đồ màn hình Android → Web

Trạng thái: ⬜ chưa làm · 🟡 đã viết, chưa chạy thử · ✅ đã kiểm thử


## 1. Tài khoản & cài đặt
Dữ liệu: `users, verificationRequests, supportRequests, reports`

| Màn hình Android | Route Web | Trạng thái |
|---|---|---|
| SplashScreen | `/` | 🟡 |
| LoginScreen | `/login` | 🟡 |
| RegisterScreen | `/login (chế độ đăng ký)` | 🟡 |
| EditProfileScreen | `/edit-profile` | ⬜ |
| SettingsScreen | `/settings` | ⬜ |
| VerificationRequestScreen | `/verification-request` | ⬜ |
| SupportRequestScreen | `/support-request` | ⬜ |
| ReportScreen | `/report` | ⬜ |
| TermsOfServiceScreen | `/terms-of-service` | ⬜ |
| PrivacyPolicyScreen | `/privacy-policy` | ⬜ |

## 2. Trang chủ & điều hướng
Dữ liệu: `users` — **HS và GV có trang chủ khác nhau (ảnh 7, 16)**

| Màn hình Android | Route Web | Trạng thái |
|---|---|---|
| HomeScreen | `/home` | ⬜ |

## 3. Học tập
Dữ liệu: `Lessons (+ LessonData.kt dự phòng)` — **Cần mẫu dữ liệu Firestore `Lessons`**

| Màn hình Android | Route Web | Trạng thái |
|---|---|---|
| LearningScreen | `/learning` | ⬜ |
| SchoolViolenceScreen | `/school-violence` | ⬜ |
| LifeSkillsScreen | `/life-skills` | ⬜ |
| LegalCornerScreen | `/legal-corner` | ⬜ |
| PsychologyScreen | `/psychology` | ⬜ |
| SexEducationScreen | `/sex-education` | ⬜ |
| SexualAbusePreventionScreen | `/sexual-abuse-prevention` | ⬜ |
| DetailScreen | `/detail` | ⬜ |
| ExploreVietnamScreen | `/explore-vietnam` | ⬜ |
| ProvinceDetailScreen | `/province-detail` | ⬜ |
| PodcastScreen | `/podcast` | ⬜ |
| QuizScreen | `/quiz` | ⬜ |
| NewsScreen | `/news` | ⬜ |
| SurveyScreen | `/survey` | ⬜ |
| TimeManagementScreen | `/time-management` | ⬜ |

## 4. Góc Đồng Cảm
Dữ liệu: `empathy_posts, comments, empathy_notifications, reports` — **Kiểm duyệt = đợt 2**

| Màn hình Android | Route Web | Trạng thái |
|---|---|---|
| EmpathyCornerScreen | `/empathy-corner` | ⬜ |
| CreateEmpathyPostScreen | `/create-empathy-post` | ⬜ |
| EmpathyGuidelinesScreen | `/empathy-guidelines` | ⬜ |
| EmpathyPostDetailScreen | `/empathy-post-detail` | ⬜ |
| ModeratorReportsScreen | `/moderator-reports` | ⬜ |

## 5. Phòng Tư vấn & AI
Dữ liệu: `Consultations, Messages` — **AI chờ quyết định #6**

| Màn hình Android | Route Web | Trạng thái |
|---|---|---|
| PsychologyChatScreen | `/psychology-chat` | ⬜ |
| AiChatScreen | `/ai-chat` | ⬜ |

## 6. Kiểm tra trực tuyến
Dữ liệu: `exams, questions, participants, submissions` — **BLOCKED: chấm điểm phía server (Spark) + sửa Android**

| Màn hình Android | Route Web | Trạng thái |
|---|---|---|
| TeacherExamListScreen | `/teacher-exam-list` | ⬜ |
| CreateExamScreen | `/create-exam` | ⬜ |
| ExamSettingsScreen | `/exam-settings` | ⬜ |
| ExamRoomScreen | `/exam-room` | ⬜ |
| ExamParticipantsScreen | `/exam-participants` | ⬜ |
| ExamSubmissionsScreen | `/exam-submissions` | ⬜ |
| JoinExamScreen | `/join-exam` | ⬜ |
| StudentInfoScreen | `/student-info` | ⬜ |
| ExamScreenScreen | `/exam-screen` | ⬜ |
| ExamResultScreen | `/exam-result` | ⬜ |

## 7. Gamification
Dữ liệu: `users (xp, level, coins), schools; huy hiệu/nhiệm vụ đang ở Room` — **BLOCKED: dữ liệu chỉ có trên máy Android**

| Màn hình Android | Route Web | Trạng thái |
|---|---|---|
| ProfileScreen | `/profile` | ⬜ |
| BadgesScreen | `/badges` | ⬜ |
| MissionsScreen | `/missions` | ⬜ |
| AchievementsScreen | `/achievements` | ⬜ |
| LeaderboardScreen | `/leaderboard` | ⬜ |
| SchoolLeaderboardScreen | `/school-leaderboard` | ⬜ |
| ShopScreen | `/shop` | ⬜ |
| CollectionScreen | `/collection` | ⬜ |
| MyCollectionScreen | `/my-collection` | ⬜ |
| LuckyWheelScreen | `/lucky-wheel` | ⬜ |
| WeeklyCompetitionScreen | `/weekly-competition` | ⬜ |

## 8. Công cụ cá nhân
Dữ liệu: `(chưa có – Room cục bộ)` — **BLOCKED: cần collection mới + sửa Android**

| Màn hình Android | Route Web | Trạng thái |
|---|---|---|
| DiaryScreen | `/diary` | ⬜ |
| WriteLetterScreen | `/write-letter` | ⬜ |
| FutureLetterScreen | `/future-letter` | ⬜ |
| NotesScreen | `/notes` | ⬜ |
| GoalsScreen | `/goals` | ⬜ |
| CountdownScreen | `/countdown` | ⬜ |
| TimetableScreen | `/timetable` | ⬜ |
| GratitudeCornerScreen | `/gratitude-corner` | ⬜ |
| PublisherPerspectiveScreen | `/publisher-perspective` | ⬜ |

## 9. Trò chơi
Dữ liệu: `(cục bộ)`

| Màn hình Android | Route Web | Trạng thái |
|---|---|---|
| GamesScreen | `/games` | ⬜ |
| Game2048Screen | `/game2048` | ⬜ |
| MemoryGameScreen | `/memory-game` | ⬜ |
| SudokuScreen | `/sudoku` | ⬜ |
| QuickMathScreen | `/quick-math` | ⬜ |
| TicTacToeScreen | `/tic-tac-toe` | ⬜ |
| TowerOfHanoiScreen | `/tower-of-hanoi` | ⬜ |
| WhackAMoleScreen | `/whack-a-mole` | ⬜ |

## 10. Lớp học
Dữ liệu: `classes, attendance` — **Chỉ giáo viên**

| Màn hình Android | Route Web | Trạng thái |
|---|---|---|
| ClassListScreen | `/class-list` | ⬜ |
| ClassMapScreen | `/class-map` | ⬜ |
| AttendanceScreen | `/attendance` | ⬜ |

Tổng: 74 màn đã xếp nhóm / 74 tệp màn hình trong mã (còn lại là biến thể dùng chung).
