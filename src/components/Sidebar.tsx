import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { LayoutDashboard, Target, SquareCheck as CheckSquare, Timer, Calendar, Brain, TrendingUp, BookOpen, ClipboardList, ChartBar as BarChart3, Lightbulb, User } from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/study', icon: Timer, label: 'Study' },
  { path: '/routine', icon: ClipboardList, label: 'Routine' },
  { path: '/habits', icon: Brain, label: 'Habits' },
  { path: '/exams', icon: BookOpen, label: 'Exams' },
  { path: '/mock-tests', icon: ClipboardList, label: 'Mock Tests' },
  { path: '/analytics', icon: TrendingUp, label: 'Analytics' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/journal', icon: Lightbulb, label: 'Journal' },
  { path: '/accountability', icon: BarChart3, label: 'Accountability' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function Sidebar() {
  const { sidebarOpen } = useAppStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen transition-transform duration-300',
        'bg-surface border-r border-border',
        !sidebarOpen && '-translate-x-full',
        'w-64'
      )}
    >
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-border">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-saffron via-white to-india-green flex items-center justify-center shadow-md">
            <Target className="w-6 h-6 text-navy" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text">Mission Control</h1>
            <p className="text-xs text-text-secondary">Every Hour Accounted For</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                      'hover:bg-surface-secondary',
                      isActive
                        ? 'bg-saffron/10 text-saffron border-l-4 border-saffron'
                        : 'text-text-secondary hover:text-text'
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="px-4 py-3 rounded-lg bg-gradient-to-r from-saffron/10 via-transparent to-india-green/10">
            <p className="text-xs text-text-secondary text-center">
              Target: GATE 2027
            </p>
            <p className="text-xs font-medium text-text text-center mt-1">
              200+ Days Remaining
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
