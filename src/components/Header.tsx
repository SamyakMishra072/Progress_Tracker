import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { formatTime, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Menu,
  Moon,
  Sun,
  Bell,
  Timer,
  Flame,
} from 'lucide-react';

export function Header() {
  const { theme, toggleTheme, toggleSidebar, activeSession, sessionCategory, sessionStartTime } = useAppStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const sessionElapsed = activeSession && sessionStartTime
    ? Math.floor((currentTime.getTime() - new Date(sessionStartTime).getTime()) / 1000 / 60)
    : 0;

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="hidden sm:block">
            <p className="text-lg font-semibold text-text">{formatDate(currentTime)}</p>
          </div>
        </div>

        {/* Center Section - Real-time Clock */}
        <div className="flex items-center gap-3">
          {activeSession && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-saffron/10 text-saffron animate-pulse">
              <Timer className="w-4 h-4" />
              <span className="text-sm font-medium">{sessionCategory} - {sessionElapsed}m</span>
            </div>
          )}
          <div className="text-2xl font-mono font-bold text-text tracking-tight">
            {formatTime(currentTime)}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Streak Badge */}
          <div className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-semibold">0</span>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </Button>

          {/* Profile Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-saffron to-india-green flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:shadow-lg transition-shadow">
            MC
          </div>
        </div>
      </div>
    </header>
  );
}
