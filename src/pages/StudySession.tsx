import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { StudySession } from '@/lib/types';
import { Play, Pause, Square, Clock, ChartBar as BarChart3, BookOpen, Shield, Guitar, Dumbbell } from 'lucide-react';

const categories = [
  { id: 'GATE', label: 'GATE', icon: BookOpen, color: '#FF9933' },
  { id: 'IB', label: 'IB', icon: Shield, color: '#138808' },
  { id: 'SSC', label: 'Gov Exams', icon: Shield, color: '#000080' },
  { id: 'Cybersecurity', label: 'Cybersecurity', icon: Shield, color: '#0066CC' },
  { id: 'Guitar', label: 'Guitar', icon: Guitar, color: '#FF6B35' },
  { id: 'Reading', label: 'Reading', icon: BookOpen, color: '#10B981' },
  { id: 'Fitness', label: 'Fitness', icon: Dumbbell, color: '#6366F1' },
];

export function StudySession() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('GATE');
  const [sessionName, setSessionName] = useState('');
  const [notes, setNotes] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [todaySessions, setTodaySessions] = useState<StudySession[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchTodaySessions();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  async function fetchTodaySessions() {
    const today = new Date().toISOString().split('T')[0];
    try {
      const { data } = await supabase
        .from('study_sessions')
        .select('*')
        .gte('start_time', today)
        .order('start_time', { ascending: false });
      if (data) setTodaySessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  }

  async function startSession() {
    try {
      const { data } = await supabase
        .from('study_sessions')
        .insert({
          name: sessionName || `${selectedCategory} Session`,
          category: selectedCategory,
          start_time: new Date().toISOString(),
          duration_minutes: 0,
        })
        .select()
        .single();
      if (data) {
        setCurrentSessionId(data.id);
        setIsRunning(true);
        setIsPaused(false);
        setSeconds(0);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  }

  function pauseSession() {
    setIsPaused(true);
  }

  function resumeSession() {
    setIsPaused(false);
  }

  async function stopSession() {
    if (!currentSessionId) return;
    try {
      const durationMinutes = Math.floor(seconds / 60);
      await supabase
        .from('study_sessions')
        .update({
          end_time: new Date().toISOString(),
          duration_minutes: durationMinutes,
          notes: notes,
        })
        .eq('id', currentSessionId);
      setIsRunning(false);
      setIsPaused(false);
      setSeconds(0);
      setCurrentSessionId(null);
      setSessionName('');
      setNotes('');
      fetchTodaySessions();
    } catch (error) {
      console.error('Error stopping session:', error);
    }
  }

  function formatTime(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  const totalMinutesToday = todaySessions.reduce((acc, s) => acc + s.duration_minutes, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Study Session Tracker</h1>
        <p className="text-text-secondary">Track your focused study time</p>
      </div>

      {/* Timer Card */}
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-saffron via-white to-india-green" />
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            {/* Timer Display */}
            <div className="relative inline-flex">
              <div className="w-64 h-64 rounded-full border-8 border-surface-secondary flex items-center justify-center relative">
                <div
                  className="absolute inset-2 rounded-full"
                  style={{
                    background: `conic-gradient(${categories.find(c => c.id === selectedCategory)?.color || '#FF9933'} ${(seconds / 3600) * 100}%, transparent 0)`,
                    opacity: 0.2,
                  }}
                />
                <div className="text-center z-10">
                  <p className="text-5xl font-mono font-bold text-text">
                    {formatTime(seconds)}
                  </p>
                  <p className="text-sm text-text-secondary mt-2">
                    {isRunning ? (isPaused ? 'PAUSED' : 'IN PROGRESS') : 'READY'}
                  </p>
                </div>
              </div>
            </div>

            {/* Category Selection */}
            {!isRunning && (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2 max-w-3xl mx-auto">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-surface-secondary border-2 shadow-md'
                        : 'hover:bg-surface-secondary/50 border border-transparent'
                    }`}
                    style={{
                      borderColor: selectedCategory === cat.id ? cat.color : 'transparent',
                    }}
                  >
                    <cat.icon className="w-5 h-5" style={{ color: cat.color }} />
                    <span className="text-xs text-text">{cat.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Session Name */}
            {!isRunning && (
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Session name (optional)"
                className="w-full max-w-md mx-auto px-4 py-2 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-saffron"
              />
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              {!isRunning ? (
                <Button size="lg" onClick={startSession} className="w-32">
                  <Play className="w-5 h-5 mr-2" />
                  Start
                </Button>
              ) : (
                <>
                  {isPaused ? (
                    <Button size="lg" onClick={resumeSession} className="w-32">
                      <Play className="w-5 h-5 mr-2" />
                      Resume
                    </Button>
                  ) : (
                    <Button size="lg" variant="secondary" onClick={pauseSession} className="w-32">
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </Button>
                  )}
                  <Button size="lg" variant="destructive" onClick={stopSession} className="w-32">
                    <Square className="w-5 h-5 mr-2" />
                    Stop
                  </Button>
                </>
              )}
            </div>

            {/* Notes for running session */}
            {isRunning && (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes for this session..."
                className="w-full max-w-md mx-auto px-4 py-2 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-saffron"
                rows={2}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats & History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-saffron" />
              Today's Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-surface-secondary">
                <p className="text-3xl font-bold text-text">{Math.floor(totalMinutesToday / 60)}h {totalMinutesToday % 60}m</p>
                <p className="text-sm text-text-secondary">Total Study Time</p>
              </div>
              <div className="p-4 rounded-lg bg-surface-secondary">
                <p className="text-3xl font-bold text-text">{todaySessions.length}</p>
                <p className="text-sm text-text-secondary">Sessions Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-navy" />
              Today's Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaySessions.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No sessions recorded today</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {todaySessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-surface-secondary hover:bg-surface-secondary/80 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: `${categories.find(c => c.id === session.category)?.color || '#FF9933'}20`,
                      }}
                    >
                      <Clock className="w-5 h-5" style={{ color: categories.find(c => c.id === session.category)?.color || '#FF9933' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">
                        {session.name || `${session.category} Session`}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {session.duration_minutes} minutes
                      </p>
                    </div>
                    <p className="text-xs text-text-secondary">
                      {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
