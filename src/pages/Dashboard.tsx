import { useState, useEffect } from 'react';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { Goal, Task, StudySession, Streak, DailyRoutine } from '@/lib/types';
import { Target, SquareCheck as CheckSquare, Clock, TrendingUp, Calendar, Flame, Droplets, Dumbbell, BookOpen, Guitar, Shield, Building, Zap, ArrowRight } from 'lucide-react';

const goalIcons: Record<string, React.ElementType> = {
  'GATE 2027': Target,
  'IB Preparation': Shield,
  'Government Exams': Building,
  'Cybersecurity': Shield,
  'Fitness': Dumbbell,
  'Guitar': Guitar,
};

export function Dashboard() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [todaySessions, setTodaySessions] = useState<StudySession[]>([]);
  const [todayRoutine, setTodayRoutine] = useState<DailyRoutine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [goalsRes, tasksRes, streaksRes, sessionsRes, routineRes] = await Promise.all([
        supabase.from('goals').select('*').order('created_at'),
        supabase.from('tasks').select('*').eq('status', 'pending').order('deadline'),
        supabase.from('streaks').select('*'),
        supabase.from('study_sessions').select('*').gte('start_time', today),
        supabase.from('daily_routines').select('*').eq('date', today).single(),
      ]);

      if (goalsRes.data) setGoals(goalsRes.data);
      if (tasksRes.data) setTodayTasks(tasksRes.data.slice(0, 5));
      if (streaksRes.data) setStreaks(streaksRes.data);
      if (sessionsRes.data) setTodaySessions(sessionsRes.data);
      if (routineRes.data) setTodayRoutine(routineRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const todayStudyMinutes = todaySessions.reduce((acc, s) => acc + s.duration_minutes, 0);
  const tasksCompletedToday = todayTasks.filter(t => t.status === 'completed').length;
  const studyStreak = streaks.find(s => s.streak_type === 'study')?.current_streak || 0;

  const productivityScore = calculateQuickScore({
    studyMinutes: todayStudyMinutes,
    tasksCompleted: tasksCompletedToday,
    totalTasks: todayTasks.length,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-saffron border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-saffron via-saffron-light to-saffron-dark p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Mission Control</h1>
          <p className="text-white/90 text-lg">Every Hour Accounted For</p>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-sm opacity-90">Current Streak</p>
              <p className="text-2xl font-bold">{studyStreak} days</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-sm opacity-90">Study Hours Today</p>
              <p className="text-2xl font-bold">{(todayStudyMinutes / 60).toFixed(1)}h</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-sm opacity-90">Tasks Completed</p>
              <p className="text-2xl font-bold">{tasksCompletedToday}</p>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Productivity Score</p>
                <p className="text-3xl font-bold text-text">{productivityScore}</p>
              </div>
              <ProgressRing progress={productivityScore} size={60} color="#FF9933" showPercentage={false} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Study Hours Today</p>
                <p className="text-3xl font-bold text-text">{(todayStudyMinutes / 60).toFixed(1)}h</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-navy" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Tasks Completed</p>
                <p className="text-3xl font-bold text-text">{tasksCompletedToday}/{todayTasks.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-india-green/10 flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-india-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Current Streak</p>
                <p className="text-3xl font-bold text-text">{studyStreak}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Progress Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-saffron" />
              Goals Progress
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-saffron">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {goals.map((goal) => {
              const Icon = goalIcons[goal.name] || Target;
              return (
                <div
                  key={goal.id}
                  className="flex flex-col items-center p-4 rounded-xl bg-surface-secondary hover:bg-surface-secondary/80 transition-all cursor-pointer group"
                >
                  <ProgressRing
                    progress={goal.current_percentage}
                    color={goal.color}
                    size={80}
                    strokeWidth={6}
                  >
                    <Icon className="w-6 h-6" style={{ color: goal.color }} />
                  </ProgressRing>
                  <p className="text-xs font-medium text-text mt-2 text-center">{goal.name}</p>
                  <p className="text-xs text-text-secondary">{goal.current_percentage}%</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-india-green" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayTasks.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No pending tasks</p>
              </div>
            ) : (
              todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-secondary hover:bg-surface-secondary/80 transition-colors"
                >
                  <div className={cn(
                    'w-3 h-3 rounded-full',
                    task.priority === 'critical' && 'bg-red-500',
                    task.priority === 'high' && 'bg-orange-500',
                    task.priority === 'medium' && 'bg-yellow-500',
                    task.priority === 'low' && 'bg-green-500',
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">{task.title}</p>
                    <p className="text-xs text-text-secondary">{task.category}</p>
                  </div>
                  <div className="text-xs text-text-secondary">
                    {task.deadline && new Date(task.deadline).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Today's Routine */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-navy" />
              Today's Routine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <RoutineItem icon={Zap} label="Wake Up" value={todayRoutine?.wake_up_time || 'Not set'} />
              <RoutineItem icon={Droplets} label="Water" value={
                todayRoutine ? `${todayRoutine.water_intake} glasses` : 'Not tracked'
              } />
              <RoutineItem icon={Dumbbell} label="Exercise" value={
                todayRoutine ? `${todayRoutine.exercise_minutes} min` : 'Not tracked'
              } />
              <RoutineItem icon={BookOpen} label="Reading" value={
                todayRoutine ? `${todayRoutine.reading_minutes} min` : 'Not tracked'
              } />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-16 flex-col gap-1" asChild>
              <a href="/study">
                <Clock className="w-5 h-5" />
                <span className="text-xs">Start Study</span>
              </a>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-1" asChild>
              <a href="/tasks">
                <CheckSquare className="w-5 h-5" />
                <span className="text-xs">Add Task</span>
              </a>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-1" asChild>
              <a href="/journal">
                <BookOpen className="w-5 h-5" />
                <span className="text-xs">Journal</span>
              </a>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-1" asChild>
              <a href="/analytics">
                <TrendingUp className="w-5 h-5" />
                <span className="text-xs">View Analytics</span>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RoutineItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-secondary">
      <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-navy" />
      </div>
      <div>
        <p className="text-xs text-text-secondary">{label}</p>
        <p className="text-sm font-medium text-text">{value}</p>
      </div>
    </div>
  );
}

function calculateQuickScore(params: { studyMinutes: number; tasksCompleted: number; totalTasks: number }) {
  let score = 50; // Base score
  score += Math.min(params.studyMinutes / 60, 4) * 10; // Up to 40 points for study hours
  score += params.tasksCompleted * 5; // 5 points per completed task
  return Math.min(Math.round(score), 100);
}
