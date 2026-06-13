import { useState, useEffect } from 'react';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import type { Goal, Milestone } from '@/lib/types';
import { Target, Shield, Building, Dumbbell, Guitar, CircleCheck as CheckCircle, Clock, Flag } from 'lucide-react';

const goalIcons: Record<string, React.ElementType> = {
  'GATE 2027': Target,
  'IB Preparation': Shield,
  'Government Exams': Building,
  'Cybersecurity': Shield,
  'Fitness': Dumbbell,
  'Guitar': Guitar,
};

export function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Record<string, Milestone[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  async function fetchGoals() {
    try {
      const { data: goalsData } = await supabase.from('goals').select('*').order('created_at');
      if (goalsData) {
        setGoals(goalsData);
        // Fetch milestones for each goal
        const milestonePromises = goalsData.map(async (goal) => {
          const { data } = await supabase
            .from('milestones')
            .select('*')
            .eq('goal_id', goal.id)
            .order('created_at');
          return { goalId: goal.id, milestones: data || [] };
        });
        const milestoneResults = await Promise.all(milestonePromises);
        const milestoneMap: Record<string, Milestone[]> = {};
        milestoneResults.forEach(({ goalId, milestones: ms }) => {
          milestoneMap[goalId] = ms;
        });
        setMilestones(milestoneMap);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleMilestone(milestoneId: string, completed: boolean, _goalId: string) {
    try {
      await supabase
        .from('milestones')
        .update({
          completed: !completed,
          completed_at: !completed ? new Date().toISOString() : null,
        })
        .eq('id', milestoneId);
      fetchGoals();
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-saffron border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Master Goals</h1>
          <p className="text-text-secondary">Track your journey to excellence</p>
        </div>
        {/* <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button> */}
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const Icon = goalIcons[goal.name] || Target;
          const goalMilestones = milestones[goal.id] || [];
          const completedMilestones = goalMilestones.filter(m => m.completed).length;

          return (
            <Card
              key={goal.id}
              className="hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
              onClick={() => setSelectedGoal(selectedGoal?.id === goal.id ? null : goal)}
            >
              {/* Color Header */}
              <div
                className="h-2 w-full"
                style={{ background: `linear-gradient(to right, ${goal.color}, ${goal.color}aa)` }}
              />

              <CardHeader>
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md"
                    style={{ backgroundColor: `${goal.color}20` }}
                  >
                    <Icon className="w-7 h-7" style={{ color: goal.color }} />
                  </div>
                  <div className="flex-1">
                    <CardTitle>{goal.name}</CardTitle>
                    <p className="text-sm text-text-secondary mt-1">{goal.description}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress Ring */}
                <div className="flex items-center justify-center py-4">
                  <ProgressRing
                    progress={goal.current_percentage}
                    color={goal.color}
                    size={140}
                    strokeWidth={10}
                  >
                    <div className="text-center">
                      <p className="text-3xl font-bold" style={{ color: goal.color }}>
                        {goal.current_percentage}%
                      </p>
                      <p className="text-xs text-text-secondary">Complete</p>
                    </div>
                  </ProgressRing>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-surface-secondary">
                    <p className="text-lg font-bold text-text">{goal.total_hours_invested.toFixed(0)}</p>
                    <p className="text-xs text-text-secondary">Hours</p>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-secondary">
                    <p className="text-lg font-bold text-text">{goal.target_hours}</p>
                    <p className="text-xs text-text-secondary">Target</p>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-secondary">
                    <p className="text-lg font-bold text-text">{completedMilestones}/{goalMilestones.length}</p>
                    <p className="text-xs text-text-secondary">Milestones</p>
                  </div>
                </div>

                {/* Milestones Preview */}
                {goalMilestones.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <p className="text-sm font-medium text-text flex items-center gap-2">
                      <Flag className="w-4 h-4 text-saffron" />
                      Milestones
                    </p>
                    {goalMilestones.slice(0, 3).map((milestone) => (
                      <div
                        key={milestone.id}
                        className="flex items-center gap-2 p-2 rounded bg-surface-secondary hover:bg-surface-secondary/80 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMilestone(milestone.id, milestone.completed, goal.id);
                        }}
                      >
                        <CheckCircle
                          className={`w-4 h-4 ${milestone.completed ? 'text-india-green' : 'text-gray-300'}`}
                        />
                        <span className={`text-sm ${milestone.completed ? 'line-through text-text-secondary' : 'text-text'}`}>
                          {milestone.title}
                        </span>
                      </div>
                    ))}
                    {goalMilestones.length > 3 && (
                      <p className="text-xs text-text-secondary text-center">
                        +{goalMilestones.length - 3} more milestones
                      </p>
                    )}
                  </div>
                )}

                {/* Deadline */}
                {goal.deadline && (
                  <div className="flex items-center gap-2 text-sm text-text-secondary pt-2 border-t border-border">
                    <Clock className="w-4 h-4" />
                    <span>
                      Deadline: {new Date(goal.deadline).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
