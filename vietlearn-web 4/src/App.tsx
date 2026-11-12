import { Navigate, Route, Routes } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from './auth/AuthContext';
import Shell from './components/Shell';
import Soon from './components/Soon';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Home from './pages/Home';
import Learning from './pages/Learning';
import Topic from './pages/Topic';
import Lesson from './pages/Lesson';
import { ExamDoing, ExamResult, JoinExam, StudentInfo } from './pages/exam/Student';
import { CreateExam, ExamParticipants, ExamRoom, ExamSettings, ExamSubmissions, TeacherExamList } from './pages/exam/Teacher';

import { CreateEmpathyPost, EmpathyCorner, EmpathyPostDetail } from './pages/Empathy';
import Consult from './pages/Consult';
import { Tool } from './pages/Tools';
import { Collection, Profile, Report, Settings } from './pages/Account';
import TimeMgmt from './pages/TimeMgmt';
import Announcements from './pages/Announcements';
import { Game2048, Games, Hanoi, Memory, QuickMath, Sudoku, TicTacToe, WhackAMole } from './pages/Games';
import { AiChat, Badges, EditProfile, ExploreVN, Leaderboard, Legal, Missions, ModReports, Podcast, Quiz, SchoolBoard, Shop, Support, Survey, Verification } from './pages/Misc';

function Private({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid h-full place-items-center font-bold text-vl-navy">Đang tải…</div>;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Login />} />
      <Route element={<Private><Shell /></Private>}>
        <Route path="/home" element={<Home />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/topic/:key" element={<Topic />} />
        <Route path="/lesson/:id" element={<Lesson />} />
        <Route path="/join-exam" element={<JoinExam />} />
        <Route path="/student-info/:examId" element={<StudentInfo />} />
        <Route path="/exam/:examId/:subId" element={<ExamDoing />} />
        <Route path="/exam-result/:examId/:subId" element={<ExamResult />} />
        <Route path="/teacher-exams" element={<TeacherExamList />} />
        <Route path="/create-exam" element={<CreateExam />} />
        <Route path="/exam-settings/:examId" element={<ExamSettings />} />
        <Route path="/exam-room/:examId" element={<ExamRoom />} />
        <Route path="/exam-participants/:examId" element={<ExamParticipants />} />
        <Route path="/exam-submissions/:examId" element={<ExamSubmissions />} />
        <Route path="/empathy-corner" element={<EmpathyCorner />} />
        <Route path="/create-empathy-post" element={<CreateEmpathyPost />} />
        <Route path="/empathy-post/:id" element={<EmpathyPostDetail />} />
        <Route path="/psychology-chat" element={<Consult />} />
        <Route path="/diary" element={<Tool k="diary" />} />
        <Route path="/write-letter" element={<Tool k="letters" />} />
        <Route path="/future-letter" element={<Tool k="letters" />} />
        <Route path="/notes" element={<Tool k="notes" />} />
        <Route path="/goals" element={<Tool k="goals" />} />
        <Route path="/countdown" element={<Tool k="countdown" />} />
        <Route path="/timetable" element={<Tool k="timetable" />} />
        <Route path="/time-management" element={<TimeMgmt />} />
        <Route path="/gratitude-corner" element={<Tool k="gratitude" />} />
        <Route path="/publisher-perspective" element={<Tool k="perspective" />} />
        <Route path="/games" element={<Games />} />
        <Route path="/memory-game" element={<Memory />} />
        <Route path="/tic-tac-toe" element={<TicTacToe />} />
        <Route path="/quick-math" element={<QuickMath />} />
        <Route path="/whack-a-mole" element={<WhackAMole />} />
        <Route path="/game-2048" element={<Game2048 />} />
        <Route path="/tower-of-hanoi" element={<Hanoi />} />
        <Route path="/sudoku" element={<Sudoku />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/terms" element={<Legal k="terms" />} />
        <Route path="/privacy" element={<Legal k="privacy" />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/school-leaderboard" element={<SchoolBoard />} />
        <Route path="/weekly-competition" element={<SchoolBoard />} />
        <Route path="/missions" element={<Missions />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="/podcast" element={<Podcast />} />
        <Route path="/explore-vietnam" element={<ExploreVN />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/verification-request" element={<Verification />} />
        <Route path="/support-request" element={<Support />} />
        <Route path="/moderator-reports" element={<ModReports />} />
        <Route path="/ai-chat" element={<AiChat />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/report" element={<Report />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/my-collection" element={<Collection />} />
        <Route path="*" element={<Soon />} />
      </Route>
    </Routes>
  );
}
