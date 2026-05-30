import { useEffect, useRef, useState } from 'react';
import { Camera, Keyboard, X, CheckCircle2 } from 'lucide-react';

export default function Scanner({ onScan, onClose, label = 'Scan barcode' }) {
  const [manualInput, setManualInput] = useState('');
  const [flashVisible, setFlashVisible] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    let scanner = null;
    
    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        scanner = new Html5Qrcode('scanner-region');
        html5QrCodeRef.current = scanner;
        
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decodedText) => {
            handleScanResult(decodedText);
          },
          () => {} // Ignore errors during scanning
        );
        setCameraActive(true);
      } catch (err) {
        console.log('Camera not available, using manual input:', err.message);
        setCameraActive(false);
      }
    };

    startScanner();

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleScanResult = (result) => {
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(100);
    
    // Visual flash
    setFlashVisible(true);
    setTimeout(() => setFlashVisible(false), 300);

    onScan(result);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleScanResult(manualInput.trim());
      setManualInput('');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Flash overlay */}
      {flashVisible && (
        <div className="absolute inset-0 bg-green-400/30 z-50 scan-flash pointer-events-none flex items-center justify-center">
          <CheckCircle2 className="w-16 h-16 text-green-600" />
        </div>
      )}

      {/* Camera area */}
      <div className="relative bg-gray-900 aspect-video">
        <div id="scanner-region" ref={scannerRef} className="w-full h-full"></div>
        {!cameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <Camera className="w-12 h-12 mb-2" />
            <p className="text-sm">Camera not available</p>
            <p className="text-xs mt-1">Use manual entry below</p>
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Manual entry fallback */}
      <form onSubmit={handleManualSubmit} className="p-4">
        <label className="block text-xs font-medium text-gray-500 mb-2">
          <Keyboard className="w-3.5 h-3.5 inline mr-1" />
          {label}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Type barcode or bin code..."
            className="flex-1 h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus={!cameraActive}
          />
          <button
            type="submit"
            className="h-12 px-5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
          >
            Enter
          </button>
        </div>
      </form>
    </div>
  );
}
