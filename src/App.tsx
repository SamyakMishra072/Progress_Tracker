import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAppStore } from '@/store/useAppStore';
import { Dashboard } from '@/pages/Dashboard';
import Profile from "./pages/Profile";
import { Goals } from '@/pages/Goals';
import { Tasks } from '@/pages/Tasks';
import { StudySession } from '@/pages/StudySession';
import { Routine } from '@/pages/Routine';
import { Habits } from '@/pages/Habits';
import { ExamPrep } from '@/pages/ExamPrep';
import { MockTests } from '@/pages/MockTests';
import { Analytics } from '@/pages/Analytics';
import { Calendar } from '@/pages/Calendar';
import { Journal } from '@/pages/Journal';
import { Accountability } from '@/pages/Accountability';
import { cn } from '@/lib/utils';

function AppLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useAppStore();

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-0'
        )}
      >
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/goals" element={<Goals />} />
  <Route path="/tasks" element={<Tasks />} />
  <Route path="/study" element={<StudySession />} />
  <Route path="/routine" element={<Routine />} />
  <Route path="/habits" element={<Habits />} />
  <Route path="/exams" element={<ExamPrep />} />
  <Route path="/mock-tests" element={<MockTests />} />
  <Route path="/analytics" element={<Analytics />} />
  <Route path="/calendar" element={<Calendar />} />
  <Route path="/journal" element={<Journal />} />
  <Route path="/accountability" element={<Accountability />} />

  {/* Use your Profile.tsx page */}
  <Route path="/profile" element={<Profile />} />
</Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
