import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { notificationsAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Create a pleasant, loud "ding" sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); // Slide up to A6
    
    // Volume envelope
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.05); // Fade in
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5); // Fade out
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error('Audio play failed', e);
  }
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();
  const dropdownRef = useRef(null);
  const prevUnreadCountRef = useRef(0);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await notificationsAPI.getAll();
      const fetchedNotifications = data.data || [];
      const currentUnreadCount = fetchedNotifications.filter(n => !n.is_read).length;
      
      // Play sound if we have more unread notifications than before
      if (currentUnreadCount > prevUnreadCountRef.current) {
        playNotificationSound();
      }
      prevUnreadCountRef.current = currentUnreadCount;
      
      setNotifications(fetchedNotifications);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markRead([id]);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    try {
      await notificationsAPI.markRead(unreadIds);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 flex flex-col max-h-[80vh]">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                No notifications yet
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`p-3 flex gap-3 hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm text-gray-800 ${!notif.is_read ? 'font-medium' : ''}`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <button 
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="flex-shrink-0 self-start p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
