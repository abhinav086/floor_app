import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, CheckSquare, Square, FileText } from 'lucide-react';
import { tasksAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import TopBar from '../../components/floor/TopBar';

export default function PackTaskPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const task = state?.task;
  const [itemsPacked, setItemsPacked] = useState({});
  const [showSlip, setShowSlip] = useState(false);
  const [completing, setCompleting] = useState(false);

  if (!task) return <div className="p-8 text-center"><p className="text-gray-500">No task data.</p></div>;

  const items = [{ id: '1', name: task.sku_name || 'Item', qty: task.qty || 1 }];
  const allPacked = items.every(item => itemsPacked[item.id]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await tasksAPI.complete(task.id, { worker_id: user.id });
      navigate('/floor/tasks');
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    finally { setCompleting(false); }
  };

  return (
    <div className="min-h-full flex flex-col">
      <TopBar title="Pack" showBack badge={{ text: 'Packing', color: 'bg-violet-50 text-violet-700' }} />
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <p className="text-sm text-gray-500 mb-2">Suggested Carton</p>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-blue-900">Medium Box (40×30×20 cm)</p>
            <p className="text-xs text-blue-600 mt-0.5">Based on item volume</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Items Checklist</p>
          {items.map(item => (
            <button key={item.id} onClick={() => setItemsPacked(p => ({ ...p, [item.id]: !p[item.id] }))} className="w-full flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
              {itemsPacked[item.id] ? <CheckSquare className="w-6 h-6 text-green-600" /> : <Square className="w-6 h-6 text-gray-300" />}
              <span className={`text-sm flex-1 text-left ${itemsPacked[item.id] ? 'text-gray-400 line-through' : 'text-gray-900 font-medium'}`}>{item.name}</span>
              <span className="text-sm font-bold text-gray-600">×{item.qty}</span>
            </button>
          ))}
        </div>

        <button onClick={() => setShowSlip(true)} className="w-full h-12 border border-gray-200 text-gray-600 font-medium rounded-xl mb-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition">
          <FileText className="w-5 h-5" /> Print Packing Slip
        </button>

        {showSlip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowSlip(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Packing Slip</h3>
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 text-sm space-y-2 font-mono">
                <p><strong>Order:</strong> {task.related_order_id?.slice(0,8) || 'N/A'}</p>
                <p><strong>Item:</strong> {task.sku_name}</p>
                <p><strong>Qty:</strong> {task.qty}</p>
                <p><strong>Packed by:</strong> {user?.name}</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              </div>
              <button onClick={() => setShowSlip(false)} className="w-full h-10 mt-4 bg-gray-100 text-gray-700 font-medium rounded-xl text-sm hover:bg-gray-200 transition">Close</button>
            </div>
          </div>
        )}

        {allPacked && (
          <button onClick={handleComplete} disabled={completing} className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 text-lg shadow-lg shadow-green-600/25 active:scale-[0.98]">
            {completing ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
            Confirm Packed
          </button>
        )}
      </div>
    </div>
  );
}
