import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, XCircle, ArrowDownToLine, PackageCheck, 
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
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const fetchNextTask = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data } = await tasksAPI.getNext(user.id);
      setTask(data.data);
    } catch (err) {
      console.error('Fetch task error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextTask();
    const interval = setInterval(fetchNextTask, 10000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleAccept = async () => {
    if (!task) return;
    setActing(true);
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
      alert(err.response?.data?.message || 'Accept failed');
    } finally {
      setActing(false);
    }
  };

  const handleDecline = async () => {
    if (!task) return;
    setActing(true);
    try {
      await tasksAPI.decline(task.id);
      fetchNextTask();
    } catch (err) {
      alert(err.response?.data?.message || 'Decline failed');
    } finally {
      setActing(false);
    }
  };

  const config = task ? taskTypeConfig[task.type] || taskTypeConfig.pick : null;
  const TypeIcon = config?.icon || ClipboardList;

  return (
    <div className="min-h-full flex flex-col">
      <TopBar title="My Tasks" badge={user?.status === 'available' ? { text: 'Online', color: 'bg-green-50 text-green-700' } : null} />

      <div className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            <div className="skeleton h-48 w-full rounded-2xl"></div>
            <div className="skeleton h-14 w-full rounded-xl"></div>
          </div>
        ) : !task ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">No tasks right now</h2>
            <p className="text-sm text-gray-500 mb-6">Check back soon. Auto-refreshing every 10s.</p>
            <button onClick={fetchNextTask} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        ) : (
          <>
            {/* Task Offer Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
              {/* Type badge */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 ${config.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <TypeIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{config.label} Task</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${task.priority >= 7 ? 'bg-red-100 text-red-700' : task.priority >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                      P{task.priority}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(task.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-2">
                {task.sku_name && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500">Item</span>
                    <span className="text-sm font-semibold text-gray-900">{task.sku_name}</span>
                  </div>
                )}
                {task.qty && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500">Quantity</span>
                    <span className="text-sm font-semibold text-gray-900">{task.qty}</span>
                  </div>
                )}
                {task.origin_bin_code && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500">From Bin</span>
                    <span className="text-sm font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{task.origin_bin_code}</span>
                  </div>
                )}
                {task.dest_bin_code && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-500">To Bin</span>
                    <span className="text-sm font-mono font-semibold text-gray-900 bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{task.dest_bin_code}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAccept}
                disabled={acting}
                className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-lg shadow-lg shadow-green-600/25 active:scale-[0.98]"
              >
                {acting ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
                {task.status === 'accepted' || task.status === 'in_progress' ? 'RESUME TASK' : 'ACCEPT TASK'}
              </button>
              <button
                onClick={handleDecline}
                disabled={acting}
                className="w-full h-12 bg-white border-2 border-gray-200 text-gray-600 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-[0.98]"
              >
                <XCircle className="w-5 h-5" />
                Decline
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
