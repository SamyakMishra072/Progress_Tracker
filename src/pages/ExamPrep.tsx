import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ProgressRing } from '@/components/ui/progress-ring';
import { supabase } from '@/lib/supabase';
import type { GATESubject, ExamSubject } from '@/lib/types';
import { Clock } from 'lucide-react';

export function ExamPrep() {
  const [gateSubjects, setGATESubjects] = useState<GATESubject[]>([]);
  const [examSubjects, setExamSubjects] = useState<ExamSubject[]>([]);
  const [activeTab, setActiveTab] = useState<'gate' | 'ib' | 'ssc'>('gate');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  async function fetchSubjects() {
    try {
      const { data: gate } = await supabase.from('gate_subjects').select('*').order('name');
      const { data: exams } = await supabase.from('exam_subjects').select('*').order('exam_type, name');

      if (gate) setGATESubjects(gate);
      if (exams) setExamSubjects(exams);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredExamSubjects = examSubjects.filter((s) =>
    activeTab === 'ib' ? s.exam_type === 'IB' : s.exam_type === 'SSC'
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-saffron border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Exam Preparation</h1>
        <p className="text-text-secondary">Track your subject-wise preparation</p>
      </div>

      <div className="flex gap-2">
        {['gate', 'ib', 'ssc'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'gate' | 'ib' | 'ssc')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab
                ? 'bg-saffron text-white'
                : 'bg-surface-secondary text-text-secondary hover:bg-surface-secondary/80'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {activeTab === 'gate' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gateSubjects.map((subject) => (
            <Card key={subject.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{subject.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <ProgressRing
                    progress={subject.completion_percentage}
                    color="#FF9933"
                    size={100}
                    strokeWidth={8}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 rounded bg-surface-secondary">
                    <p className="text-xs text-text-secondary">Revision Count</p>
                    <p className="text-lg font-bold text-text">{subject.revision_count}</p>
                  </div>
                  <div className="p-2 px-2 rounded bg-surface-secondary">
                    <p className="text-xs text-text-secondary">PYQs Solved</p>
                    <p className="text-lg font-bold text-text">{subject.pyq_practice_count}</p>
                  </div>
                  <div className="p-2 rounded bg-surface-secondary">
                    <p className="text-xs text-text-secondary">Mock Tests</p>
                    <p className="text-lg font-bold text-text">{subject.mock_tests_count}</p>
                  </div>
                  <div className="p-2 rounded bg-surface-secondary">
                    <p className="text-xs text-text-secondary">Accuracy</p>
                    <p className="text-lg font-bold text-text">{subject.accuracy_percentage}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Clock className="w-3 h-3" />
                  <span>{subject.hours_invested} hours invested</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExamSubjects.map((subject) => (
            <Card key={subject.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{subject.name}</CardTitle>
                  <span className="text-xs px-2 py-1 rounded-full bg-surface-secondary">{subject.exam_type}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <ProgressRing
                    progress={subject.completion_percentage}
                    color={subject.exam_type === 'IB' ? '#138808' : '#000080'}
                    size={100}
                    strokeWidth={8}
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary justify-center">
                  <Clock className="w-4 h-4" />
                  <span>{subject.hours_invested} hours invested</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
