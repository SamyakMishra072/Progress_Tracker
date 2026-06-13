-- Mission Control Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Goals Table
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  target_percentage INTEGER DEFAULT 100,
  current_percentage INTEGER DEFAULT 0,
  color TEXT DEFAULT '#FF9933',
  total_hours_invested DECIMAL(10,2) DEFAULT 0,
  target_hours DECIMAL(10,2) DEFAULT 1000,
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Milestones for Goals
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  deadline TIMESTAMPTZ,
  estimated_duration INTEGER,
  actual_duration INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Study Sessions
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  category TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Routine Tracking
CREATE TABLE daily_routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  wake_up_time TIME,
  sleep_time TIME,
  water_intake INTEGER DEFAULT 0,
  exercise_minutes INTEGER DEFAULT 0,
  meditation_minutes INTEGER DEFAULT 0,
  reading_minutes INTEGER DEFAULT 0,
  screen_time_minutes INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habits
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  target_time TIME DEFAULT '06:00:00',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habit Completions
CREATE TABLE habit_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, completed_date)
);

-- GATE Subjects
CREATE TABLE gate_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  completion_percentage INTEGER DEFAULT 0,
  revision_count INTEGER DEFAULT 0,
  pyq_practice_count INTEGER DEFAULT 0,
  mock_tests_count INTEGER DEFAULT 0,
  accuracy_percentage DECIMAL(5,2) DEFAULT 0,
  hours_invested DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- IB/Gov Exam Subjects
CREATE TABLE exam_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  exam_type TEXT NOT NULL,
  completion_percentage INTEGER DEFAULT 0,
  hours_invested DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mock Tests
CREATE TABLE mock_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_name TEXT NOT NULL,
  subject TEXT,
  score DECIMAL(5,2),
  max_score DECIMAL(5,2),
  accuracy_percentage DECIMAL(5,2),
  time_taken_minutes INTEGER,
  weak_areas TEXT[],
  strong_areas TEXT[],
  date_taken DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal Entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  accomplishments TEXT,
  time_wasters TEXT,
  learnings TEXT,
  tomorrow_priority TEXT,
  mood TEXT,
  energy_level INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar Events
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'task',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT FALSE,
  color TEXT DEFAULT '#FF9933',
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Streak Tracking
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  streak_type TEXT NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_updated DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time Allocation Targets
CREATE TABLE time_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  target_hours_daily DECIMAL(5,2),
  target_hours_weekly DECIMAL(6,2),
  target_hours_monthly DECIMAL(7,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_targets ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (single user system, using authenticated role)
CREATE POLICY "select_goals" ON goals FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_goals" ON goals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_goals" ON goals FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_goals" ON goals FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_milestones" ON milestones FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_milestones" ON milestones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_milestones" ON milestones FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_milestones" ON milestones FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_tasks" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_tasks" ON tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_tasks" ON tasks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_tasks" ON tasks FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_study_sessions" ON study_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_study_sessions" ON study_sessions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_study_sessions" ON study_sessions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_study_sessions" ON study_sessions FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_daily_routines" ON daily_routines FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_daily_routines" ON daily_routines FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_daily_routines" ON daily_routines FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_daily_routines" ON daily_routines FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_habits" ON habits FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_habits" ON habits FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_habits" ON habits FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_habits" ON habits FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_habit_completions" ON habit_completions FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_habit_completions" ON habit_completions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "delete_habit_completions" ON habit_completions FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_gate_subjects" ON gate_subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_gate_subjects" ON gate_subjects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_gate_subjects" ON gate_subjects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_gate_subjects" ON gate_subjects FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_exam_subjects" ON exam_subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_exam_subjects" ON exam_subjects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_exam_subjects" ON exam_subjects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_exam_subjects" ON exam_subjects FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_mock_tests" ON mock_tests FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_mock_tests" ON mock_tests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_mock_tests" ON mock_tests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_mock_tests" ON mock_tests FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_journal_entries" ON journal_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_journal_entries" ON journal_entries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_journal_entries" ON journal_entries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_journal_entries" ON journal_entries FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_calendar_events" ON calendar_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_calendar_events" ON calendar_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_calendar_events" ON calendar_events FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_calendar_events" ON calendar_events FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_streaks" ON streaks FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_streaks" ON streaks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_streaks" ON streaks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_streaks" ON streaks FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_time_targets" ON time_targets FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_time_targets" ON time_targets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_time_targets" ON time_targets FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_time_targets" ON time_targets FOR DELETE TO authenticated USING (true);

-- Insert default goals
INSERT INTO goals (name, description, color, target_hours) VALUES
  ('GATE 2027', 'Master all subjects for GATE 2027 examination', '#FF9933', 1500),
  ('IB Preparation', 'Prepare for Intelligence Bureau exams', '#138808', 500),
  ('Government Exams', 'Prepare for various government exams', '#000080', 400),
  ('Cybersecurity', 'Build cybersecurity skills and certifications', '#0066CC', 300),
  ('Fitness', 'Achieve fitness goals and maintain health', '#10B981', 200),
  ('Guitar', 'Learn and practice guitar regularly', '#FF6B35', 150);

-- Insert default habits
INSERT INTO habits (name, description, target_time) VALUES
  ('Early Wake-up', 'Wake up before 6:00 AM', '06:00:00'),
  ('Exercise', 'Complete daily exercise routine', '07:00:00'),
  ('Study Session', 'Complete at least one focused study session', '08:00:00'),
  ('Guitar Practice', 'Practice guitar for at least 30 minutes', '18:00:00'),
  ('Reading', 'Read for at least 30 minutes', '21:00:00'),
  ('Digital Detox', 'Limit social media usage', '22:00:00');

-- Insert GATE subjects
INSERT INTO gate_subjects (name) VALUES
  ('Operating Systems'),
  ('DBMS'),
  ('Computer Networks'),
  ('Algorithms'),
  ('Theory of Computation'),
  ('Compiler Design'),
  ('Aptitude'),
  ('Engineering Mathematics'),
  ('Digital Logic'),
  ('Computer Organization and Architecture'),
  ('C Programming');

-- Insert IB/Gov Exam subjects
INSERT INTO exam_subjects (name, exam_type) VALUES
  ('Quantitative Aptitude', 'IB'),
  ('Reasoning', 'IB'),
  ('English', 'IB'),
  ('General Awareness', 'IB'),
  ('Current Affairs', 'IB'),
  ('Quantitative Aptitude', 'SSC'),
  ('Reasoning', 'SSC'),
  ('English', 'SSC'),
  ('General Awareness', 'SSC'),
  ('Current Affairs', 'SSC');

-- Insert time targets
INSERT INTO time_targets (category, target_hours_daily, target_hours_weekly, target_hours_monthly) VALUES
  ('gate', 5, 35, 140),
  ('ib', 2, 14, 56),
  ('govt', 1, 7, 28),
  ('cybersecurity', 1, 7, 28),
  ('fitness', 1, 7, 28),
  ('guitar', 0.5, 3.5, 14);

-- Insert streak records
INSERT INTO streaks (streak_type, current_streak, longest_streak, last_updated) VALUES
  ('study', 0, 0, CURRENT_DATE),
  ('fitness', 0, 0, CURRENT_DATE),
  ('wake_early', 0, 0, CURRENT_DATE),
  ('reading', 0, 0, CURRENT_DATE),
  ('guitar', 0, 0, CURRENT_DATE),
  ('digital_detox', 0, 0, CURRENT_DATE);
