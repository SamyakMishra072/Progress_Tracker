import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { CalendarEvent } from '@/lib/types';
import {
 ChevronLeft,
 ChevronRight,
 Plus,
} from 'lucide-react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: 'task',
    start_time: '',
    color: '#FF9933',
  });

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  async function fetchEvents() {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const { data } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time');

      if (data) setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate) return;

    try {
      await supabase.from('calendar_events').insert({
        title: newEvent.title,
        description: newEvent.description,
        event_type: 'task',
        start_time: selectedDate.toISOString(),
        all_day: true,
        color: newEvent.color,
      });
      setShowForm(false);
      setNewEvent({ title: '', description: '', event_type: 'task', start_time: '', color: '#FF9933' });
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  }

  function navigateMonth(direction: 'prev' | 'next') {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  }

  function getDaysInMonth() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }

  function getEventsForDay(day: Date) {
    const dayStr = day.toISOString().split('T')[0];
    return events.filter((e) => {
      const eventDate = new Date(e.start_time).toISOString().split('T')[0];
      return eventDate === dayStr;
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-saffron border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const days = getDaysInMonth();
  const today = new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Calendar & Planner</h1>
          <p className="text-text-secondary">Plan your month ahead</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-lg font-medium text-text w-40 text-center">
            {currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </span>
          <Button variant="outline" onClick={() => navigateMonth('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {showForm && selectedDate && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>New Event - {selectedDate.toLocaleDateString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createEvent} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-saffron"
              />
              <textarea
                placeholder="Description"
                value={newEvent.description}
                onChange={(e) => setNewEvent((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-saffron"
                rows={2}
              />
              <div className="flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Create Event</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-text-secondary py-2">
                {day}
              </div>
            ))}
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="h-24" />;
              }

              const dayEvents = getEventsForDay(day);
              const isToday = day.toDateString() === today.toDateString();
              const isSelected = selectedDate?.toDateString() === day.toDateString();

              return (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedDate(day);
                    setShowForm(true);
                  }}
                  className={`h-24 rounded-lg p-2 text-left transition-all hover:bg-surface-secondary ${
                    isToday ? 'ring-2 ring-saffron' : ''
                  } ${isSelected ? 'bg-surface-secondary' : ''}`}
                >
                  <span className={`text-sm font-medium ${isToday ? 'text-saffron' : 'text-text'}`}>
                    {day.getDate()}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className="text-xs px-1 py-0.5 rounded truncate"
                        style={{ backgroundColor: `${event.color}20`, color: event.color }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-text-secondary">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
