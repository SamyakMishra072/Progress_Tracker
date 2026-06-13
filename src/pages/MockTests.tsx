import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { MockTest } from '@/lib/types';
import { Plus } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function MockTests() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTest, setNewTest] = useState({
    exam_name: '',
    subject: '',
    score: 0,
    max_score: 100,
    accuracy_percentage: 0,
    time_taken_minutes: 120,
    weak_areas: '',
    strong_areas: '',
  });

  useEffect(() => {
    fetchTests();
  }, []);

  async function fetchTests() {
    try {
      const { data } = await supabase.from('mock_tests').select('*').order('date_taken', { ascending: false });
      if (data) setTests(data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createTest(e: React.FormEvent) {
    e.preventDefault();
    try {
      await supabase.from('mock_tests').insert({
        exam_name: newTest.exam_name,
        subject: newTest.subject || null,
        score: newTest.score,
        max_score: newTest.max_score,
        accuracy_percentage: newTest.accuracy_percentage,
        time_taken_minutes: newTest.time_taken_minutes,
        weak_areas: newTest.weak_areas.split(',').map(s => s.trim()).filter(Boolean),
        strong_areas: newTest.strong_areas.split(',').map(s => s.trim()).filter(Boolean),
        date_taken: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
      fetchTests();
    } catch (error) {
      console.error('Error creating test:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-saffron border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const scoreData = tests.slice(0, 10).reverse().map((t) => ({
    name: t.exam_name,
    score: t.score ? (t.score / (t.max_score || 100)) * 100 : 0,
    accuracy: t.accuracy_percentage || 0,
  }));

  const avgScore = tests.length > 0
    ? tests.reduce((acc, t) => acc + (t.score ? (t.score / (t.max_score || 100)) * 100 : 0), 0) / tests.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Mock Test Analytics</h1>
          <p className="text-text-secondary">Track your test performance</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Test
        </Button>
      </div>

      {showForm && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>New Mock Test</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createTest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Exam name"
                  required
                  value={newTest.exam_name}
                  onChange={(e) => setNewTest((p) => ({ ...p, exam_name: e.target.value }))}
                  className="px-4 py-2 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-saffron"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  value={newTest.subject}
                  onChange={(e) => setNewTest((p) => ({ ...p, subject: e.target.value }))}
                  className="px-4 py-2 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-saffron"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="number"
                  placeholder="Score"
                  required
                  value={newTest.score}
                  onChange={(e) => setNewTest((p) => ({ ...p, score: parseFloat(e.target.value) }))}
                  className="px-4 py-2 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-saffron"
                />
                <input
                  type="number"
                  placeholder="Max Score"
                  value={newTest.max_score}
                  onChange={(e) => setNewTest((p) => ({ ...p, max_score: parseFloat(e.target.value) }))}
                  className="px-4 py-2 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-saffron"
                />
                <input
                  type="number"
                  placeholder="Accuracy %"
                  value={newTest.accuracy_percentage}
                  onChange={(e) => setNewTest((p) => ({ ...p, accuracy_percentage: parseFloat(e.target.value) }))}
                  className="px-4 py-2 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-saffron"
                />
                <input
                  type="number"
                  placeholder="Time (mins)"
                  value={newTest.time_taken_minutes}
                  onChange={(e) => setNewTest((p) => ({ ...p, time_taken_minutes: parseInt(e.target.value) }))}
                  className="px-4 py-2 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-saffron"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Save Test</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary">Total Tests</p>
            <p className="text-3xl font-bold text-text">{tests.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary">Average Score</p>
            <p className="text-3xl font-bold text-text">{avgScore.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary">Latest Score</p>
            <p className="text-3xl font-bold text-saffron">
              {tests[0]?.score ? ((tests[0].score / (tests[0].max_score || 100)) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary">Best Score</p>
            <p className="text-3xl font-bold text-india-green">
              {tests.length > 0 ? Math.max(...tests.map(t => t.score ? (t.score / (t.max_score || 100)) * 100 : 0)).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {tests.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Score Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoreData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#FF9933" strokeWidth={2} />
                    <Line type="monotone" dataKey="accuracy" stroke="#138808" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tests.map((test) => (
                  <div key={test.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-secondary">
                    <div className="flex-1">
                      <p className="font-medium text-text">{test.exam_name}</p>
                      <p className="text-xs text-text-secondary">{test.subject || 'General'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-text">
                        {test.score ? ((test.score / (test.max_score || 100)) * 100).toFixed(0) : 0}%
                      </p>
                      <p className="text-xs text-text-secondary">{new Date(test.date_taken).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
