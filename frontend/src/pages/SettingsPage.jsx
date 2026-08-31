import { useDarkMode } from '../hooks/useDarkMode';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function SettingsPage() {
  const { isDark, toggle, setIsDark } = useDarkMode();

  return (
    <div className="max-w-2xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your preferences</p>
      </div>

      {/* Appearance */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setIsDark(false)}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              !isDark ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20' : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <Sun className="w-6 h-6 mx-auto mb-2 text-amber-500" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Light</p>
          </button>
          <button
            onClick={() => setIsDark(true)}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              isDark ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20' : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <Moon className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Dark</p>
          </button>
          <button
            onClick={() => {
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              setIsDark(prefersDark);
            }}
            className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-center transition-all hover:border-gray-300"
          >
            <Monitor className="w-6 h-6 mx-auto mb-2 text-gray-500" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">System</p>
          </button>
        </div>
      </div>

      {/* About */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About</h2>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
            <span>Application</span>
            <span className="font-medium text-gray-900 dark:text-white">Smart Digital Menu Designer</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
            <span>Version</span>
            <span className="font-medium text-gray-900 dark:text-white">1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
            <span>Frontend</span>
            <span className="font-medium text-gray-900 dark:text-white">React + Vite + Tailwind CSS</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
            <span>Backend</span>
            <span className="font-medium text-gray-900 dark:text-white">Python + FastAPI + SQLite</span>
          </div>
          <div className="flex justify-between py-2">
            <span>AI Engine</span>
            <span className="font-medium text-gray-900 dark:text-white">Ollama (Optional)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
