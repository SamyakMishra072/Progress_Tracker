import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { DailyRoutine } from '@/lib/types';
import {
  Sun,
  Moon,
  Droplets,
  Dumbbell,
  Brain,
  BookOpen,
  Smartphone,
  Save,
} from 'lucide-react';

export function Routine() {
  const [todayRoutine, setTodayRoutine] = useState<DailyRoutine | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const [routine, setRoutine] = useState({
    wake_up_time: '',
    sleep_time: '',
    water_intake: 0,
    exercise_minutes: 0,
    meditation_minutes: 0,
    reading_minutes: 0,
    screen_time_minutes: 0,
  });

  useEffect(() => {
    fetchRoutine();
  }, [selectedDate]);

  async function fetchRoutine() {
    try {
      const { data } = await supabase
        .from('daily_routines')
        .select('*')
        .eq('date', selectedDate)
        .single();

      if (data) {
        setTodayRoutine(data);
        setRoutine({
          wake_up_time: data.wake_up_time || '',
          sleep_time: data.sleep_time || '',
          water_intake: data.water_intake,
          exercise_minutes: data.exercise_minutes,
          meditation_minutes: data.meditation_minutes,
          reading_minutes: data.reading_minutes,
          screen_time_minutes: data.screen_time_minutes,
        });
      } else {
        setTodayRoutine(null);
        setRoutine({
          wake_up_time: '',
          sleep_time: '',
          water_intake: 0,
          exercise_minutes: 0,
          meditation_minutes: 0,
          reading_minutes: 0,
          screen_time_minutes: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching routine:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveRoutine() {
    try {
      if (todayRoutine) {
        await supabase
          .from('daily_routines')
          .update({
            ...routine,
            updated_at: new Date().toISOString(),
          })
          .eq('id', todayRoutine.id);
      } else {
        await supabase.from('daily_routines').insert({
          date: selectedDate,
          ...routine,
        });
      }
      fetchRoutine();
    } catch (error) {
      console.error('Error saving routine:', error);
    }
  }

  function updateField(field: string, value: string | number) {
    setRoutine((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-saffron border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const items = [
    { field: 'wake_up_time', label: 'Wake Up Time', icon: Sun, type: 'time' },
    { field: 'sleep_time', label: 'Sleep Time', icon: Moon, type: 'time' },
    { field: 'water_intake', label: 'Water Intake', icon: Droplets, type: 'number', unit: 'glasses', step: 1 },
    { field: 'exercise_minutes', label: 'Exercise', icon: Dumbbell, type: 'number', unit: 'minutes', step: 5 },
    { field: 'meditation_minutes', label: 'Meditation', icon: Brain, type: 'number', unit: 'minutes', step: 5 },
    { field: 'reading_minutes', label: 'Reading', icon: BookOpen, type: 'number', unit: 'minutes', step: 10 },
    { field: 'screen_time_minutes', label: 'Screen Time', icon: Smartphone, type: 'number', unit: 'minutes', step: 15 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Daily Routine</h1>
          <p className="text-text-secondary">Track your daily habits and wellness</p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-saffron"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {items.map((item) => (
          <Card key={item.field}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <item.icon className="w-5 h-5 text-saffron" />
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {item.type === 'time' ? (
                  <input
                    type="time"
                    value={routine[item.field as keyof typeof routine] as string}
                    onChange={(e) => updateField(item.field, e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-saffron text-2xl"
                  />
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => updateField(item.field, Math.max(0, (routine[item.field as keyof typeof routine] as number) - (item.step || 1)))}
                    >
                      -
                    </Button>
                    <input
                      type="number"
                      value={routine[item.field as keyof typeof routine] as number}
                      onChange={(e) => updateField(item.field, parseInt(e.target.value) || 0)}
                      className="flex-1 px-4 py-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-saffron text-center text-2xl"
                      min="0"
                      step={item.step}
                    />
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => updateField(item.field, (routine[item.field as keyof typeof routine] as number) + (item.step || 1))}
                    >
                      +
                    </Button>
                  </>
                )}
                {item.unit && (
                  <span className="text-sm text-text-secondary w-16">{item.unit}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button size="lg" onClick={saveRoutine}>
          <Save className="w-4 h-4 mr-2" />
          Save Routine
        </Button>
      </div>
    </div>
  );
}
