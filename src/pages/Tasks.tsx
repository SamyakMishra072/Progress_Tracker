import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, getPriorityColor } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { Task } from '@/lib/types';
import { Plus, GripVertical, CircleCheck as CheckCircle, Clock, Trash2 } from 'lucide-react';

const categories = ['GATE', 'IB', 'Government Exams', 'Cybersecurity', 'Fitness', 'Guitar', 'Personal', 'Career'] as const;
const priorities = ['critical', 'high', 'medium', 'low'] as const;

const statusColumns = [
  { id: 'pending', title: 'Pending', color: 'bg-gray-100 dark:bg-gray-800' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 'completed', title: 'Completed', color: 'bg-green-100 dark:bg-green-900/30' },
  { id: 'missed', title: 'Missed', color: 'bg-red-100 dark:bg-red-900/30' },
];

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'GATE',
    priority: 'medium' as 'critical' | 'high' | 'medium' | 'low',
    deadline: '',
    estimated_duration: 60,
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (data) setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data } = await supabase
        .from('tasks')
        .insert({
          title: newTask.title,
          description: newTask.description,
          category: newTask.category,
          priority: newTask.priority,
          deadline: newTask.deadline || null,
          estimated_duration: newTask.estimated_duration,
          status: 'pending',
        })
        .select()
        .single();
      if (data) {
        setTasks([data, ...tasks]);
        setShowForm(false);
        setNewTask({
          title: '',
          description: '',
          category: 'GATE',
          priority: 'medium',
          deadline: '',
          estimated_duration: 60,
        });
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  }

  async function updateTaskStatus(taskId: string, newStatus: Task['status']) {
    try {
      const updates: Partial<Task> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };
      if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
      }
      await supabase.from('tasks').update(updates).eq('id', taskId);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  async function deleteTask(taskId: string) {
    try {
      await supabase.from('tasks').delete().eq('id', taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  const filteredTasks = filterCategory === 'all'
    ? tasks
    : tasks.filter((t) => t.category === filterCategory);

  const tasksByStatus = statusColumns.map((col) => ({
    ...col,
    tasks: filteredTasks.filter((t) => t.status === col.id),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-saffron border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Task Manager</h1>
          <p className="text-text-secondary">Kanban view of all your tasks</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-surface text-text focus:ring-2 focus:ring-saffron"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-saffron"
                  placeholder="Task title..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Category</label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-saffron"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask((p) => ({ ...p, priority: e.target.value as Task['priority'] }))}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-saffron"
                  >
                    {priorities.map((p) => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Deadline</label>
                  <input
                    type="datetime-local"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask((p) => ({ ...p, deadline: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-saffron"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    value={newTask.estimated_duration}
                    onChange={(e) => setNewTask((p) => ({ ...p, estimated_duration: parseInt(e.target.value) || 60 }))}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-saffron"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-saffron"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Create Task</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tasksByStatus.map((column) => (
          <div
            key={column.id}
            className={cn('rounded-xl p-4 min-h-[500px]', column.color)}
          >
            <h3 className="text-lg font-semibold text-text mb-4 flex items-center justify-between">
              <span>{column.title}</span>
              <span className="text-sm font-normal bg-white/50 dark:bg-black/30 px-2 py-1 rounded-full">
                {column.tasks.length}
              </span>
            </h3>
            <div className="space-y-3">
              {column.tasks.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No {column.title.toLowerCase()} tasks</p>
                </div>
              ) : (
                column.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white dark:bg-surface rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 cursor-grab" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={cn('text-xs px-2 py-0.5 rounded-full border', getPriorityColor(task.priority))}>
                            {task.priority}
                          </span>
                          <span className="text-xs text-text-secondary">{task.category}</span>
                        </div>
                        <p className="text-sm font-medium text-text">{task.title}</p>
                        {task.deadline && (
                          <div className="flex items-center gap-1 text-xs text-text-secondary mt-2">
                            <Clock className="w-3 h-3" />
                            {new Date(task.deadline).toLocaleDateString()}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          {task.status !== 'completed' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateTaskStatus(
                                task.id,
                                task.status === 'pending' ? 'in_progress' : 'completed'
                              )}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
