import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ProgressRing } from '@/components/ui/progress-ring';
import { supabase } from '@/lib/supabase';
import type { Habit } from '@/lib/types';
import { CircleCheck as CheckCircle, Flame } from 'lucide-react';

const DAYS_TO_SHOW = 90;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Habits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const { data: habitsData } = await supabase.from('habits').select('*').eq('is_active', true);
      if (!habitsData) return;

      setHabits(habitsData);

      // Fetch completions for last 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - DAYS_TO_SHOW);

      const { data: completionsData } = await supabase
        .from('habit_completions')
        .select('*')
        .gte('completed_date', ninetyDaysAgo.toISOString().split('T')[0]);

      if (completionsData) {
        const completionMap: Record<string, Set<string>> = {};
        habitsData.forEach((h) => {
          completionMap[h.id] = new Set();
        });
        completionsData.forEach((c) => {
          if (!completionMap[c.habit_id]) {
            completionMap[c.habit_id] = new Set();
          }
          completionMap[c.habit_id].add(c.completed_date);
        });
        setCompletions(completionMap);
      }
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleHabit(habitId: string, date: string) {
    try {
      const isCompleted = completions[habitId]?.has(date);
      if (isCompleted) {
        await supabase
          .from('habit_completions')
          .delete()
          .eq('habit_id', habitId)
          .eq('completed_date', date);
      } else {
        await supabase.from('habit_completions').insert({
          habit_id: habitId,
          completed_date: date,
        });
      }
      fetchData();
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  }

  function getHabitStats(habitId: string) {
    const dates = completions[habitId] || new Set();
    const today = new Date();
    let currentStreak = 0;

    // Calculate current streak
    const checkDate = new Date(today);
    while (dates.has(checkDate.toISOString().split('T')[0])) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Calculate completion rate for last 30 days
    let completed = 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
      if (dates.has(d.toISOString().split('T')[0])) {
        completed++;
      }
    }

    return {
      currentStreak,
      completionRate: Math.round((completed / 30) * 100),
    };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-saffron border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Habit Tracker</h1>
        <p className="text-text-secondary">Build consistency one day at a time</p>
      </div>

      {/* Today's Habits */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Check-in</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.map((habit) => {
              const isCompletedToday = completions[habit.id]?.has(today);
              return (
                <button
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id, today)}
                  className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                    isCompletedToday
                      ? 'bg-india-green/10 border-2 border-india-green'
                      : 'bg-surface-secondary hover:bg-surface-secondary/80 border-2 border-transparent'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompletedToday ? 'bg-india-green text-white' : 'bg-surface-secondary'
                    }`}
                  >
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-text">{habit.name}</p>
                    <p className="text-xs text-text-secondary">{habit.target_time}</p>
                  </div>
                  {isCompletedToday && (
                    <span className="text-india-green text-sm font-medium">Done!</span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Habit Heatmaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {habits.map((habit) => {
          const stats = getHabitStats(habit.id);
          const habitCompletions = completions[habit.id] || new Set();

          return (
            <Card key={habit.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {habit.name}
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-orange-500">
                      <Flame className="w-4 h-4" />
                      <span className="text-sm font-bold">{stats.currentStreak}</span>
                    </div>
                    <ProgressRing progress={stats.completionRate} size={40} showPercentage={false}>
                      <span className="text-xs font-bold">{stats.completionRate}%</span>
                    </ProgressRing>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-text-secondary mb-2">
                    {WEEKDAYS.map((day) => (
                      <div key={day} className="w-3 text-center">{day}</div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: 90 }).map((_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() - (89 - i));
                      const dateStr = date.toISOString().split('T')[0];
                      const isCompleted = habitCompletions.has(dateStr);

                      return (
                        <div
                          key={i}
                          onClick={() => toggleHabit(habit.id, dateStr)}
                          className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:scale-125 ${
                            isCompleted
                              ? 'bg-india-green'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                          title={`${date.toLocaleDateString()}: ${isCompleted ? 'Completed' : 'Not completed'}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
