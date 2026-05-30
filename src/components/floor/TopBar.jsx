import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function TopBar({ title, showBack = false, badge = null }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
      <div className="max-w-md mx-auto flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          {showBack && (
            <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-gray-600 hover:text-gray-900 transition">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${badge.color || 'bg-blue-50 text-blue-700'}`}>
              {badge.text}
            </span>
          )}
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}
