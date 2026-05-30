import { NavLink } from 'react-router-dom';
import { ClipboardList, ScanLine, User, Clock } from 'lucide-react';

const tabs = [
  { path: '/floor/tasks', icon: ClipboardList, label: 'Tasks' },
  { path: '/floor/history', icon: Clock, label: 'History' },
  { path: '/floor/scan', icon: ScanLine, label: 'Scan' },
  { path: '/floor/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-50">
      <div className="max-w-md mx-auto flex">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 pt-3 transition-colors
              ${isActive ? 'text-blue-600' : 'text-gray-400'}`
            }
          >
            <tab.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium mt-1">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
