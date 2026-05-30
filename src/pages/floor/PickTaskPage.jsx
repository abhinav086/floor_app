import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, CheckSquare, Square, AlertTriangle } from 'lucide-react';
import { tasksAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import TopBar from '../../components/floor/TopBar';
import Scanner from '../../components/common/Scanner';

export default function PickTaskPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const task = state?.task;
  const [picked, setPicked] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [actualQty, setActualQty] = useState(task?.qty || 0);
  const [shortPick, setShortPick] = useState(false);

  if (!task) {
    return <div className="p-8 text-center"><p className="text-gray-500">No task data.</p></div>;
  }

  const handleScan = (barcode) => {
    // Accept either SKU barcode or bin code
    setPicked(true);
    setShowScanner(false);
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await tasksAPI.complete(task.id, {
        worker_id: user.id,
        actual_qty: actualQty,
        override_reason: shortPick ? `Short pick: only ${actualQty} of ${task.qty} available` : null,
      });
      navigate('/floor/tasks');
    } catch (err) {
      alert(err.response?.data?.message || 'Complete failed');
    } finally {
      setCompleting(false);
    }
  };

  const progress = picked ? 1 : 0;

  return (
    <div className="min-h-full flex flex-col">
      <TopBar title="Pick" showBack badge={{ text: `${progress}/1 picked`, color: 'bg-amber-50 text-amber-700' }} />
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${progress * 100}%` }}></div>
        </div>

        {/* Pick line */}
        <div className={`bg-white rounded-2xl shadow-sm border ${picked ? 'border-green-200' : 'border-gray-100'} p-5 mb-4`}>
          <div className="flex items-start gap-3">
            <button onClick={() => setPicked(!picked)} className="mt-0.5">
              {picked ? <CheckSquare className="w-6 h-6 text-green-600" /> : <Square className="w-6 h-6 text-gray-300" />}
            </button>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-base font-semibold text-gray-900">{task.sku_name || 'Item'}</p>
                <span className="text-lg font-bold text-gray-900">×{task.qty}</span>
              </div>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>From: <span className="font-mono font-semibold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">{task.origin_bin_code || 'N/A'}</span></span>
                <span>To: <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{task.dest_bin_code || 'Pack'}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Scanner */}
        {showScanner && (
          <div className="mb-4">
            <Scanner onScan={handleScan} onClose={() => setShowScanner(false)} label="Scan SKU barcode" />
          </div>
        )}

        {!picked && !showScanner && (
          <div className="space-y-3 mb-4">
            <button onClick={() => setShowScanner(true)} className="w-full h-14 bg-blue-600 text-white font-bold rounded-xl transition active:scale-[0.98] text-base">
              Scan to Confirm Pick
            </button>
            <button onClick={() => setShortPick(!shortPick)} className="w-full h-10 border border-gray-200 text-gray-500 text-sm font-medium rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Short Pick
            </button>
          </div>
        )}

        {shortPick && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 space-y-3">
            <p className="text-sm font-semibold text-amber-800">Short Pick — Actual qty available:</p>
            <input type="number" min="0" max={task.qty} value={actualQty} onChange={(e) => setActualQty(parseInt(e.target.value) || 0)} className="w-full h-12 px-3 border border-amber-200 rounded-xl text-sm bg-white text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-amber-400" />
            <button onClick={() => { setPicked(true); setShortPick(false); }} className="w-full h-10 bg-amber-600 text-white font-medium rounded-xl text-sm">Confirm Short Pick</button>
          </div>
        )}

        {picked && (
          <button onClick={handleComplete} disabled={completing} className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 text-lg shadow-lg shadow-green-600/25 active:scale-[0.98]">
            {completing ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
            Complete Pick
          </button>
        )}
      </div>
    </div>
  );
}
