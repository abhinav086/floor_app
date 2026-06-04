import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, ArrowDownToLine, PackageCheck, 
  ClipboardList, TruckIcon, RefreshCw, Package, Loader2, Clock
} from 'lucide-react';
import { tasksAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import TopBar from '../../components/floor/TopBar';

const taskTypeConfig = {
  receive: { icon: ArrowDownToLine, color: 'bg-emerald-600', label: 'Receive' },
  putaway: { icon: PackageCheck, color: 'bg-blue-600', label: 'Put Away' },
  pick: { icon: ClipboardList, color: 'bg-amber-600', label: 'Pick' },
  pack: { icon: Package, color: 'bg-violet-600', label: 'Pack' },
  ship: { icon: TruckIcon, color: 'bg-indigo-600', label: 'Ship' },
  return: { icon: RefreshCw, color: 'bg-rose-600', label: 'Return' },
};

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const fetchPendingTasks = async () => {
    if (!user?.id) return;
    try {
      // Don't set loading to true on background refresh to avoid UI flashing
      const { data } = await tasksAPI.getPending(user.id);
      setTasks(data.data || []);
    } catch (err) {
      console.error('Fetch tasks error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTasks();
    const interval = setInterval(fetchPendingTasks, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleStartWork = async (task) => {
    if (!task) return;
    setActingId(task.id);
    try {
      if (task.status === 'offered') {
        await tasksAPI.accept(task.id, user.id);
      }
      // Navigate to the task-specific screen
      const taskRoutes = {
        receive: '/floor/task/receive',
        putaway: '/floor/task/putaway',
        pick: '/floor/task/pick',
        pack: '/floor/task/pack',
        ship: '/floor/task/ship',
        return: '/floor/task/return',
      };
      navigate(taskRoutes[task.type] || '/floor/tasks', { state: { task } });
    } catch (err) {
      alert(err.response?.data?.message || 'Start work failed');
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-gray-50">
      <TopBar title="Pending Works" badge={user?.status === 'available' ? { text: 'Online', color: 'bg-green-50 text-green-700' } : null} />

      <div className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            <div className="skeleton h-32 w-full rounded-2xl"></div>
            <div className="skeleton h-32 w-full rounded-2xl"></div>
            <div className="skeleton h-32 w-full rounded-2xl"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">No pending works</h2>
            <p className="text-sm text-gray-500 mb-6">You're all caught up! New tasks will appear here automatically.</p>
            <button onClick={() => { setLoading(true); fetchPendingTasks(); }} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition shadow-sm">
              <RefreshCw className="w-4 h-4" /> Refresh List
            </button>
          </div>
        ) : (
          <div className="space-y-4 pb-20">
            {tasks.map(task => {
              const config = taskTypeConfig[task.type] || taskTypeConfig.pick;
              const TypeIcon = config.icon || ClipboardList;
              const isActive = task.status === 'accepted' || task.status === 'in_progress';
              const isActing = actingId === task.id;

              return (
                <div key={task.id} className={`bg-white rounded-2xl shadow-sm border ${isActive ? 'border-blue-400 ring-2 ring-blue-50' : 'border-gray-200'} p-5 transition overflow-hidden relative`}>
                  {isActive && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-blue-500"></div>
                  )}
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 ${config.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <TypeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 leading-tight">{config.label} Task</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${task.priority >= 7 ? 'bg-red-100 text-red-700' : task.priority >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                          P{task.priority}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(task.created_at).toLocaleTimeString()}</span>
                        {isActive && <span className="text-xs font-bold text-blue-600 uppercase">Active</span>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    {task.sku_name && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500 uppercase">Item</span>
                        <span className="text-sm font-bold text-gray-900 text-right">{task.sku_name}</span>
                      </div>
                    )}
                    {task.qty && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500 uppercase">Qty</span>
                        <span className="text-sm font-bold text-gray-900">{task.qty}</span>
                      </div>
                    )}
                    {task.origin_bin_code && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500 uppercase">From</span>
                        <span className="text-sm font-mono font-bold text-gray-900 bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-sm">{task.origin_bin_code}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleStartWork(task)}
                    disabled={isActing}
                    className={`w-full h-12 ${isActive ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'} text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-lg ${isActive ? 'shadow-blue-600/25' : 'shadow-gray-900/25'} active:scale-[0.98]`}
                  >
                    {isActing ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    {isActive ? 'RESUME WORK' : 'START WORK'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
