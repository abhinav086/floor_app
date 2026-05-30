import { useNavigate } from 'react-router-dom';
import { User, LogOut, Shield, Wrench, Weight } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { workersAPI } from '../../services/api';
import TopBar from '../../components/floor/TopBar';
import { useState } from 'react';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [toggling, setToggling] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleStatus = async () => {
    if (!user?.id) return;
    setToggling(true);
    try {
      const newStatus = user.status === 'available' ? 'offline' : 'available';
      await workersAPI.toggleStatus(user.id, newStatus);
      // Refresh user in store
      const updatedUser = { ...user, status: newStatus };
      localStorage.setItem('wms_user', JSON.stringify(updatedUser));
      window.location.reload();
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col">
      <TopBar title="Profile" />
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{user?.name || 'Worker'}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${user?.status === 'available' ? 'bg-green-100 text-green-700' : user?.status === 'busy' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
            {user?.status || 'offline'}
          </span>
        </div>

        {/* Info cards */}
        <div className="space-y-3 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Shield className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Skills</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {(user?.skills || []).map(s => <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">{s}</span>)}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center"><Wrench className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Equipment Auth</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {(user?.equipment_auth || []).length > 0 
                  ? user.equipment_auth.map(e => <span key={e} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-xs font-medium">{e.replace('_',' ')}</span>)
                  : <span className="text-xs text-gray-400">None</span>
                }
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center"><Weight className="w-5 h-5 text-amber-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Max Safe Weight</p>
              <p className="text-sm font-semibold text-gray-900">{user?.max_safe_weight || 25} kg</p>
            </div>
          </div>
        </div>

        {/* Status toggle */}
        <button
          onClick={handleToggleStatus}
          disabled={toggling}
          className={`w-full h-14 font-bold rounded-xl transition mb-3 text-base ${
            user?.status === 'available'
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/25'
          }`}
        >
          {user?.status === 'available' ? 'Go Offline' : 'Go Online'}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full h-12 border-2 border-red-200 text-red-600 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-red-50 transition"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
