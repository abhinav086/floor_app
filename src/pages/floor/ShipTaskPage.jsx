import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, Truck, FileBarChart } from 'lucide-react';
import { tasksAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import TopBar from '../../components/floor/TopBar';

export default function ShipTaskPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const task = state?.task;
  const [labelGenerated, setLabelGenerated] = useState(false);
  const [completing, setCompleting] = useState(false);

  if (!task) return <div className="p-8 text-center"><p className="text-gray-500">No task data.</p></div>;

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
      <TopBar title="Ship" showBack badge={{ text: 'Shipping', color: 'bg-indigo-50 text-indigo-700' }} />
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center"><Truck className="w-5 h-5 text-indigo-600" /></div>
            <div><p className="text-sm text-gray-500">Ship To</p><p className="text-base font-semibold text-gray-900">{task.order_ship_to || '123 Main Street, Anytown, USA'}</p></div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1.5 border-b border-gray-50"><span className="text-gray-500">Item</span><span className="font-medium text-gray-900">{task.related_order_id ? `Order #${task.related_order_id.substring(0,8)}` : (task.sku_name || 'Package')}</span></div>
            <div className="flex justify-between py-1.5"><span className="text-gray-500">Qty</span><span className="font-medium text-gray-900">{task.qty || 1}</span></div>
          </div>
        </div>

        <button onClick={() => setLabelGenerated(true)} className="w-full h-14 border-2 border-indigo-200 text-indigo-700 font-bold rounded-xl mb-4 flex items-center justify-center gap-2 hover:bg-indigo-50 transition text-base">
          <FileBarChart className="w-5 h-5" /> Generate Label
        </button>

        {labelGenerated && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50">
                <p className="text-xs text-gray-400 mb-2">SHIPPING LABEL</p>
                <div className="text-left font-mono text-sm space-y-1 text-gray-800">
                  <p className="font-bold text-base">Demo Warehouse Inc</p>
                  <p>→ {task.order_ship_to || '123 Main Street, Anytown, USA'}</p>
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-xs text-gray-500">TRACKING: WMS-{Date.now().toString(36).toUpperCase()}</p>
                    <div className="mt-2 h-10 bg-gray-800 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-mono">||||| ||||| ||| ||||| |||||</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleComplete} disabled={completing} className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 text-lg shadow-lg shadow-green-600/25 active:scale-[0.98]">
              {completing ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> Confirming...</>
              ) : (
                <><CheckCircle2 className="w-6 h-6" /> Confirm Handoff</>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
