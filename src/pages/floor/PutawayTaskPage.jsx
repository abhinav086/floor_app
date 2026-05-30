import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, MapPin, AlertTriangle } from 'lucide-react';
import { tasksAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import TopBar from '../../components/floor/TopBar';
import Scanner from '../../components/common/Scanner';

export default function PutawayTaskPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const task = state?.task;
  const [binScanned, setBinScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [overrideBin, setOverrideBin] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [completing, setCompleting] = useState(false);

  if (!task) {
    return <div className="p-8 text-center"><p className="text-gray-500">No task data. Go back to tasks.</p></div>;
  }

  const handleBinScan = (barcode) => {
    if (barcode === task.dest_bin_code || barcode === task.dest_bin_id) {
      setBinScanned(true);
      setShowScanner(false);
    } else {
      alert(`Scanned bin "${barcode}" doesn't match suggested bin "${task.dest_bin_code}". Try again or override.`);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await tasksAPI.complete(task.id, {
        worker_id: user.id,
        override_reason: showOverride ? overrideReason : null,
        dest_bin_id: showOverride ? overrideBin : undefined,
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
      <TopBar title="Put Away" showBack badge={{ text: 'In Progress', color: 'bg-amber-50 text-amber-700' }} />
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        {/* Suggested bin */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Suggested Bin</p>
              <p className="text-2xl font-bold text-gray-900 font-mono">{task.dest_bin_code || 'N/A'}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">Best volume fit — walk to this bin and scan to confirm placement</p>
        </div>

        {/* Item info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <p className="text-sm text-gray-500 mb-1">Item to Put Away</p>
          <p className="text-base font-semibold text-gray-900">{task.sku_name || task.sku_code}</p>
          {task.qty && <p className="text-sm text-gray-500 mt-1">Qty: <span className="font-bold text-gray-900">{task.qty}</span></p>}
        </div>

        {/* Scanner */}
        {showScanner && (
          <div className="mb-4">
            <Scanner onScan={handleBinScan} onClose={() => setShowScanner(false)} label="Scan bin barcode to confirm" />
          </div>
        )}

        {/* Status */}
        {binScanned && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Bin confirmed!</p>
              <p className="text-xs text-green-600">Item placed in {task.dest_bin_code}</p>
            </div>
          </div>
        )}

        {/* Override option */}
        {!binScanned && !showScanner && (
          <div className="space-y-3 mb-4">
            <button onClick={() => setShowScanner(true)} className="w-full h-14 bg-blue-600 text-white font-bold rounded-xl transition active:scale-[0.98] text-base">
              Scan Bin to Confirm
            </button>
            <button onClick={() => setShowOverride(!showOverride)} className="w-full h-10 border border-gray-200 text-gray-500 text-sm font-medium rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Place in Different Bin
            </button>
          </div>
        )}

        {showOverride && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 space-y-3">
            <p className="text-sm font-semibold text-amber-800">Override Placement</p>
            <input value={overrideBin} onChange={(e) => setOverrideBin(e.target.value)} placeholder="Enter bin code" className="w-full h-12 px-3 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400" />
            <textarea value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} placeholder="Reason for override..." rows={2} className="w-full px-3 py-2 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400" />
            <button onClick={() => { setBinScanned(true); setShowOverride(false); }} className="w-full h-10 bg-amber-600 text-white font-medium rounded-xl text-sm">Confirm Override</button>
          </div>
        )}

        {/* Complete button */}
        {binScanned && (
          <button onClick={handleComplete} disabled={completing} className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 text-lg shadow-lg shadow-green-600/25 active:scale-[0.98]">
            {completing ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
            Complete Putaway
          </button>
        )}
      </div>
    </div>
  );
}
