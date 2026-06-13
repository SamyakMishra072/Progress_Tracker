export interface Goal {
  id: string;
  name: string;
  description: string | null;
  target_percentage: number;
  current_percentage: number;
  color: string;
  total_hours_invested: number;
  target_hours: number;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  goal_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  category: 'GATE' | 'IB' | 'Government Exams' | 'Cybersecurity' | 'Fitness' | 'Guitar' | 'Personal' | 'Career';
  priority: 'critical' | 'high' | 'medium' | 'low';
  deadline: string | null;
  estimated_duration: number | null;
  actual_duration: number | null;
  status: 'pending' | 'in_progress' | 'completed' | 'missed';
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface StudySession {
  id: string;
  name: string | null;
  category: 'GATE' | 'IB' | 'SSC' | 'Cybersecurity' | 'Guitar' | 'Reading' | 'Fitness';
  start_time: string;
  end_time: string | null;
  duration_minutes: number;
  notes: string | null;
  created_at: string;
}

export interface DailyRoutine {
  id: string;
  date: string;
  wake_up_time: string | null;
  sleep_time: string | null;
  water_intake: number;
  exercise_minutes: number;
  meditation_minutes: number;
  reading_minutes: number;
  screen_time_minutes: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  name: string;
  description: string | null;
  target_time: string;
  is_active: boolean;
  created_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  completed_date: string;
  completed_at: string;
}

export interface GATESubject {
  id: string;
  name: string;
  completion_percentage: number;
  revision_count: number;
  pyq_practice_count: number;
  mock_tests_count: number;
  accuracy_percentage: number;
  hours_invested: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExamSubject {
  id: string;
  name: string;
  exam_type: 'IB' | 'SSC';
  completion_percentage: number;
  hours_invested: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MockTest {
  id: string;
  exam_name: string;
  subject: string | null;
  score: number | null;
  max_score: number | null;
  accuracy_percentage: number | null;
  time_taken_minutes: number | null;
  weak_areas: string[] | null;
  strong_areas: string[] | null;
  date_taken: string;
  notes: string | null;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  accomplishments: string | null;
  time_wasters: string | null;
  learnings: string | null;
  tomorrow_priority: string | null;
  mood: string | null;
  energy_level: number;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: 'task' | 'study_session' | 'deadline' | 'revision' | 'exam';
  start_time: string;
  end_time: string | null;
  all_day: boolean;
  color: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Streak {
  id: string;
  streak_type: string;
  current_streak: number;
  longest_streak: number;
  last_updated: string;
  created_at: string;
}

export interface TimeTarget {
  id: string;
  category: string;
  target_hours_daily: number;
  target_hours_weekly: number;
  target_hours_monthly: number;
  created_at: string;
  updated_at: string;
}

export type DatabaseRow = {
  goals: Goal;
  milestones: Milestone;
  tasks: Task;
  study_sessions: StudySession;
  daily_routines: DailyRoutine;
  habits: Habit;
  habit_completions: HabitCompletion;
  gate_subjects: GATESubject;
  exam_subjects: ExamSubject;
  mock_tests: MockTest;
  journal_entries: JournalEntry;
  calendar_events: CalendarEvent;
  streaks: Streak;
  time_targets: TimeTarget;
};
