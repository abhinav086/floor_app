import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, Camera } from 'lucide-react';
import { tasksAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import TopBar from '../../components/floor/TopBar';
import Scanner from '../../components/common/Scanner';

export default function ReceiveTaskPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const task = state?.task;
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [actualQty, setActualQty] = useState(task?.qty || 0);
  const [condition, setCondition] = useState('good');
  const [completing, setCompleting] = useState(false);

  if (!task) {
    return <div className="p-8 text-center"><p className="text-gray-500">No task data.</p></div>;
  }

  const handleScan = (barcode) => {
    setScanned(true);
    setShowScanner(false);
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await tasksAPI.complete(task.id, {
        worker_id: user.id,
        actual_qty: actualQty,
        condition,
      });
      navigate('/floor/tasks');
    } catch (err) {
      alert(err.response?.data?.message || 'Complete failed');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col">
      <TopBar title="Receive" showBack badge={{ text: 'Receiving', color: 'bg-emerald-50 text-emerald-700' }} />
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <p className="text-sm text-gray-500 mb-1">Item to Receive</p>
          <p className="text-lg font-bold text-gray-900">{task.sku_name || 'Unknown Item'}</p>
          <p className="text-sm text-gray-500 mt-1">Expected Qty: <span className="font-bold text-gray-900">{task.qty}</span></p>
        </div>

        {showScanner ? (
          <div className="mb-4"><Scanner onScan={handleScan} onClose={() => setShowScanner(false)} label="Scan SKU barcode" /></div>
        ) : !scanned ? (
          <button onClick={() => setShowScanner(true)} className="w-full h-14 bg-blue-600 text-white font-bold rounded-xl transition active:scale-[0.98] text-base flex items-center justify-center gap-2 mb-4">
            <Camera className="w-5 h-5" /> Scan SKU Barcode
          </button>
        ) : null}

        {scanned && (
          <>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-sm font-medium text-green-800">SKU scanned successfully</span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Actual Qty Received</label>
                <input type="number" min="0" value={actualQty} onChange={(e) => setActualQty(parseInt(e.target.value) || 0)} className="w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <div className="flex gap-2">
                  {['good', 'damaged'].map(c => (
                    <button key={c} onClick={() => setCondition(c)} className={`flex-1 h-12 rounded-xl text-sm font-semibold border-2 transition capitalize ${condition === c ? (c === 'good' ? 'bg-green-600 text-white border-green-600' : 'bg-red-600 text-white border-red-600') : 'bg-white text-gray-600 border-gray-200'}`}>{c}</button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={handleComplete} disabled={completing} className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 text-lg shadow-lg shadow-green-600/25 active:scale-[0.98]">
              {completing ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
              Confirm Receive
            </button>
          </>
        )}
      </div>
    </div>
  );
}
