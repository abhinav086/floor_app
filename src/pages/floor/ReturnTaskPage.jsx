import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, RotateCcw, Package, AlertTriangle } from 'lucide-react';
import { tasksAPI, returnsAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import TopBar from '../../components/floor/TopBar';

export default function ReturnTaskPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const task = state?.task;
  const [dispositions, setDispositions] = useState({});
  const [completing, setCompleting] = useState(false);

  if (!task) return <div className="p-8 text-center"><p className="text-gray-500">No task data.</p></div>;

  const items = [{ id: 'item1', name: task.sku_name || 'Returned Item', qty: task.qty || 1 }];
  const allDispositioned = items.every(item => dispositions[item.id]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await tasksAPI.complete(task.id, { worker_id: user.id, condition: dispositions['item1'] });
      navigate('/floor/tasks');
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    finally { setCompleting(false); }
  };

  const dispositionColors = {
    restock: 'bg-green-600 text-white border-green-600',
    quarantine: 'bg-amber-600 text-white border-amber-600',
    damage: 'bg-red-600 text-white border-red-600',
  };

  return (
    <div className="min-h-full flex flex-col">
      <TopBar title="Return Inspection" showBack badge={{ text: 'Inspecting', color: 'bg-rose-50 text-rose-700' }} />
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center"><RotateCcw className="w-5 h-5 text-rose-600" /></div>
            <div><p className="text-sm text-gray-500">RMA Return</p><p className="text-base font-semibold text-gray-900">Return #{task.related_return_id?.slice(0,8) || 'N/A'}</p></div>
          </div>
        </div>

        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-base font-semibold text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.qty}</p>
              </div>
              {dispositions[item.id] && <CheckCircle2 className="w-6 h-6 text-green-600" />}
            </div>
            <p className="text-xs text-gray-500 mb-2">Select disposition:</p>
            <div className="flex gap-2">
              {['restock', 'quarantine', 'damage'].map(d => (
                <button key={d} onClick={() => setDispositions(p => ({ ...p, [item.id]: d }))} className={`flex-1 h-11 rounded-xl text-sm font-semibold border-2 transition capitalize ${dispositions[item.id] === d ? dispositionColors[d] : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        ))}

        {allDispositioned && (
          <button onClick={handleComplete} disabled={completing} className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 text-lg shadow-lg shadow-green-600/25 active:scale-[0.98]">
            {completing ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
            Complete Inspection
          </button>
        )}
      </div>
    </div>
  );
}
