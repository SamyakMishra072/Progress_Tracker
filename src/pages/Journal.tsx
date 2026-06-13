import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { JournalEntry } from '@/lib/types';
import {
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  BookOpen,
  Clock,
  Target,
} from 'lucide-react';

export function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    const existingEntry = entries.find((e) => e.date === selectedDate);
    setCurrentEntry(existingEntry || null);
  }, [selectedDate, entries]);

  async function fetchEntries() {
    try {
      const { data } = await supabase.from('journal_entries').select('*').order('date', { ascending: false });
      if (data) setEntries(data);
    } catch (error) {
      console.error('Error fetching journal:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveEntry(field: keyof JournalEntry, value: string | number) {
    try {
      const existing = entries.find((e) => e.date === selectedDate);
      if (existing) {
        await supabase
          .from('journal_entries')
          .update({ [field]: value, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase.from('journal_entries').insert({
          date: selectedDate,
          [field]: value,
          energy_level: 5,
        });
      }
      fetchEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  }

  function navigateDate(direction: 'prev' | 'next') {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(current.toISOString().split('T')[0]);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-saffron border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const questions = [
    { field: 'accomplishments' as const, label: 'What did I accomplish today?', icon: Target, placeholder: 'List your achievements...' },
    { field: 'time_wasters' as const, label: 'What wasted my time?', icon: Clock, placeholder: 'What could have been avoided?' },
    { field: 'learnings' as const, label: 'What did I learn?', icon: BookOpen, placeholder: 'Key takeaways from today...' },
    { field: 'tomorrow_priority' as const, label: 'Tomorrow\'s Priority', icon: Lightbulb, placeholder: 'What matters most tomorrow?' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Daily Journal</h1>
          <p className="text-text-secondary">Reflect on your day</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-saffron"
          />
          <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {questions.map((q) => (
          <Card key={q.field}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <q.icon className="w-5 h-5 text-saffron" />
                {q.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={currentEntry?.[q.field] || ''}
                onChange={(e) => saveEntry(q.field, e.target.value)}
                placeholder={q.placeholder}
                className="w-full px-4 py-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-saffron resize-none"
                rows={4}
              />
            </CardContent>
          </Card>
        ))}

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Energy Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={currentEntry?.energy_level || 5}
                onChange={(e) => saveEntry('energy_level', parseInt(e.target.value))}
                className="flex-1 h-2 bg-surface-secondary rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-2xl font-bold text-text w-8">
                {currentEntry?.energy_level || 5}
              </span>
            </div>
            <div className="flex justify-between text-xs text-text-secondary mt-2">
              <span>Low Energy</span>
              <span>High Energy</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {entries.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Reflections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {entries.slice(0, 10).map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setSelectedDate(entry.date)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedDate === entry.date
                      ? 'bg-saffron/10 border border-saffron'
                      : 'bg-surface-secondary hover:bg-surface-secondary/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-text">
                      {new Date(entry.date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-sm text-text-secondary">
                      Energy: {entry.energy_level}/10
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
