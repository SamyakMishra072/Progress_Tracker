import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ProgressRing } from '@/components/ui/progress-ring';
import { supabase } from '@/lib/supabase';
import type { Goal, StudySession, TimeTarget } from '@/lib/types';
import { TriangleAlert as AlertTriangle, Target } from 'lucide-react';

export function Accountability() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [timeTargets, setTimeTargets] = useState<TimeTarget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const [goalsRes, sessionsRes, targetsRes] = await Promise.all([
        supabase.from('goals').select('*'),
        supabase.from('study_sessions').select('*').gte('start_time', monthStart.toISOString()),
        supabase.from('time_targets').select('*'),
      ]);

      if (goalsRes.data) setGoals(goalsRes.data);
      if (sessionsRes.data) setSessions(sessionsRes.data);
      if (targetsRes.data) setTimeTargets(targetsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-saffron border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate hours by category this month
  const categoryHours: Record<string, number> = {};
  sessions.forEach((s) => {
    const category = s.category.toLowerCase().replace(' ', '_');
    categoryHours[category] = (categoryHours[category] || 0) + s.duration_minutes / 60;
  });

  const totalHours = Object.values(categoryHours).reduce((a, b) => a + b, 0);

  // Match with targets
  const accountabilityData = timeTargets.map((target) => {
    const actual = categoryHours[target.category.toLowerCase()] || 0;
    const planned = target.target_hours_monthly;
    const percentage = totalHours > 0 ? (actual / totalHours) * 100 : 0;
    const targetPercentage = (planned / timeTargets.reduce((a, t) => a + t.target_hours_monthly, 0)) * 100;

    return {
      category: target.category,
      actual,
      planned,
      percentage: Math.round(percentage),
      targetPercentage: Math.round(targetPercentage),
      gap: planned - actual,
      message: getMessage(target.category, actual, planned, percentage),
    };
  });

  function getMessage(category: string, actual: number, planned: number, percentage: number): string {
    if (actual >= planned) return `Great! You met your ${category} target.`;
    if (percentage < 10) return `Only ${percentage.toFixed(0)}% of your time went to ${category}. This needs attention.`;
    if (percentage < 30) return `${percentage.toFixed(0)}% for ${category}. Consider increasing focus here.`;
    return `Making progress on ${category}, but still ${Math.round(planned - actual)}h behind target.`;
  }

  // Find priorities vs reality mismatch
  const mismatches = accountabilityData
    .filter((d) => d.actual < d.planned * 0.5)
    .sort((a, b) => a.percentage - b.percentage);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Future Self Analytics</h1>
        <p className="text-text-secondary">Brutal honesty about where your time actually goes</p>
      </div>

      {/* Reality Check Banner */}
      {mismatches.length > 0 && (
        <Card className="border-2 border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-orange-700 dark:text-orange-400">
                  Reality Check Required
                </h3>
                <p className="text-orange-600 dark:text-orange-300 mt-1">
                  You said <strong>{mismatches[0].category.toUpperCase()}</strong> is a priority, but only{' '}
                  <strong>{mismatches[0].percentage}%</strong> of your time went there.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary">Month Total</p>
            <p className="text-3xl font-bold text-text">{totalHours.toFixed(1)}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary">Target</p>
            <p className="text-3xl font-bold text-text">
              {timeTargets.reduce((a, t) => a + t.target_hours_monthly, 0)}h
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary">Completion</p>
            <p className="text-3xl font-bold text-india-green">
              {Math.min(Math.round((totalHours / timeTargets.reduce((a, t) => a + t.target_hours_monthly, 0)) * 100), 100)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary">Categories Active</p>
            <p className="text-3xl font-bold text-text">{accountabilityData.filter(d => d.actual > 0).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accountabilityData.map((item) => (
          <Card
            key={item.category}
            className={`${item.actual < item.planned * 0.5 ? 'border-orange-200' : ''}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize">{item.category}</CardTitle>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-text">{item.actual.toFixed(1)}h</span>
                  <span className="text-text-secondary">/</span>
                  <span className="text-text-secondary">{item.planned}h</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <ProgressRing
                  progress={Math.min((item.actual / item.planned) * 100, 100)}
                  color={item.actual >= item.planned ? '#138808' : '#FF9933'}
                  size={100}
                />
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-text-secondary">{item.percentage}% of total time</p>
                <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-saffron transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-text-secondary">Target allocation: {item.targetPercentage}%</p>
              </div>

              <div className={`p-3 rounded-lg text-sm ${
                item.actual >= item.planned
                  ? 'bg-india-green/10 text-india-green'
                  : item.actual < item.planned * 0.5
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                    : 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
              }`}>
                {item.message}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Goals vs Reality Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-saffron" />
            Goals vs Reality
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goals.slice(0, 4).map((goal) => {
              const goalTime = categoryHours[goal.name.toLowerCase().replace(' ', '_')] || categoryHours[goal.name.toLowerCase().split(' ')[0]] || 0;
              const priorityRank = goals.findIndex((g) => g.id === goal.id) + 1;

              return (
                <div key={goal.id} className="flex items-center gap-4 p-4 rounded-lg bg-surface-secondary">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${goal.color}20` }}
                  >
                    <span className="font-bold" style={{ color: goal.color }}>#{priorityRank}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text">{goal.name}</p>
                    <p className="text-sm text-text-secondary">
                      {goalTime.toFixed(1)}h this month
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{ color: goal.color }}>
                      {((goalTime / totalHours) * 100 || 0).toFixed(0)}%
                    </p>
                    <p className="text-xs text-text-secondary">of time</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
