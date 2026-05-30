import { useEffect, useState, useMemo } from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, Package, ArrowDownToLine, PackageCheck, ClipboardList, TruckIcon, RefreshCw, Filter, X } from 'lucide-react';
import { tasksAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import TopBar from '../../components/floor/TopBar';

const taskTypeConfig = {
  receive: { icon: ArrowDownToLine, label: 'Receive' },
  putaway: { icon: PackageCheck, label: 'Put Away' },
  pick: { icon: ClipboardList, label: 'Pick' },
  pack: { icon: Package, label: 'Pack' },
  ship: { icon: TruckIcon, label: 'Ship' },
  return: { icon: RefreshCw, label: 'Return' },
};

export default function TaskHistoryPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const { data } = await tasksAPI.getHistory(user.id);
        setTasks(data.data || []);
      } catch (err) {
        console.error('Fetch task history error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user?.id]);

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'done':
        return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Completed' };
      case 'declined':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Declined' };
      case 'expired':
        return { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Expired' };
      default:
        return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50', label: status };
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (typeFilter && task.type !== typeFilter) return false;
      const taskDate = task.completed_at ? new Date(task.completed_at) : new Date(task.created_at);
      if (startDate && taskDate < new Date(startDate)) return false;
      if (endDate && taskDate > new Date(endDate + 'T23:59:59')) return false;
      return true;
    });
  }, [tasks, typeFilter, startDate, endDate]);

  const clearFilters = () => {
    setTypeFilter('');
    setStartDate('');
    setEndDate('');
    setShowFilters(false);
  };

  const hasFilters = typeFilter || startDate || endDate;

  return (
    <div className="min-h-full flex flex-col bg-gray-50">
      <TopBar title="Task History" />

      {/* Filter Toggle Bar */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center sticky top-16 z-10">
        <button 
          onClick={() => setShowFilters(!showFilters)} 
          className={`flex items-center gap-2 text-sm font-medium ${hasFilters ? 'text-blue-600' : 'text-gray-600'}`}
        >
          <Filter className="w-4 h-4" />
          {hasFilters ? 'Filters Active' : 'Filter Tasks'}
        </button>
        {hasFilters && (
          <button onClick={clearFilters} className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Filter Drawer */}
      {showFilters && (
        <div className="bg-white px-4 py-4 border-b border-gray-200 space-y-4 shadow-sm sticky top-[104px] z-10">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Task Type</label>
            <select 
              value={typeFilter} 
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {Object.entries(taskTypeConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">From</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)}
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">To</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)}
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-24 w-full rounded-2xl"></div>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">No history yet</h2>
            <p className="text-sm text-gray-500">Your completed tasks will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const typeConfig = taskTypeConfig[task.type] || { icon: Package, label: task.type };
              const TypeIcon = typeConfig.icon;
              const statusDisplay = getStatusDisplay(task.status);
              const StatusIcon = statusDisplay.icon;

              return (
                <div key={task.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${statusDisplay.bg.replace('bg-', 'bg-').replace('50', '500')}`}></div>
                  
                  <div className="flex items-start justify-between pl-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${statusDisplay.bg} rounded-xl flex items-center justify-center`}>
                        <TypeIcon className={`w-5 h-5 ${statusDisplay.color}`} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 leading-tight">{typeConfig.label}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {task.completed_at ? new Date(task.completed_at).toLocaleString() : new Date(task.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${statusDisplay.bg}`}>
                      <StatusIcon className={`w-3.5 h-3.5 ${statusDisplay.color}`} />
                      <span className={`text-xs font-semibold ${statusDisplay.color}`}>{statusDisplay.label}</span>
                    </div>
                  </div>

                  <div className="mt-4 pl-3 space-y-1.5">
                    {task.sku_name && (
                      <p className="text-sm text-gray-700 flex justify-between">
                        <span className="text-gray-500">Item:</span>
                        <span className="font-medium truncate max-w-[200px] text-right">{task.sku_name}</span>
                      </p>
                    )}
                    {task.qty && (
                      <p className="text-sm text-gray-700 flex justify-between">
                        <span className="text-gray-500">Qty:</span>
                        <span className="font-medium">{task.qty}</span>
                      </p>
                    )}
                    {(task.origin_bin_code || task.dest_bin_code) && (
                      <p className="text-sm text-gray-700 flex justify-between">
                        <span className="text-gray-500">Route:</span>
                        <span className="font-medium font-mono text-xs">
                          {task.origin_bin_code || '---'} &rarr; {task.dest_bin_code || '---'}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
