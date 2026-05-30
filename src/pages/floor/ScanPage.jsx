import { useState } from 'react';
import { scanAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import TopBar from '../../components/floor/TopBar';
import Scanner from '../../components/common/Scanner';
import { CheckCircle2, XCircle, Package, MapPin } from 'lucide-react';

export default function ScanPage() {
  const { user } = useAuthStore();
  const [result, setResult] = useState(null);

  const handleScan = async (barcode) => {
    try {
      const { data } = await scanAPI.scan({ barcode, worker_id: user?.id });
      setResult(data.data);
    } catch (err) {
      setResult({ valid: false, message: err.response?.data?.message || 'Scan failed' });
    }
  };

  return (
    <div className="min-h-full flex flex-col">
      <TopBar title="Scan" />
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        <Scanner onScan={handleScan} label="Scan any barcode or bin code" />

        {result && (
          <div className={`mt-4 rounded-2xl border p-4 ${result.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start gap-3">
              {result.valid ? <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />}
              <div>
                <p className={`text-sm font-semibold ${result.valid ? 'text-green-800' : 'text-red-800'}`}>{result.message}</p>
                {result.data && (
                  <div className="mt-2 space-y-1 text-sm">
                    {result.type === 'sku' && (
                      <>
                        <p className="text-gray-600"><Package className="w-3.5 h-3.5 inline mr-1" />{result.data.name}</p>
                        <p className="text-gray-500 font-mono text-xs">{result.data.code}</p>
                      </>
                    )}
                    {result.type === 'bin' && (
                      <>
                        <p className="text-gray-600"><MapPin className="w-3.5 h-3.5 inline mr-1" />Bin {result.data.code}</p>
                        <p className="text-gray-500 text-xs">Position: ({result.data.x}, {result.data.y})</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
