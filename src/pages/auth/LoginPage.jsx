import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Eye, EyeOff, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      navigate('/floor/tasks');
    } catch {}
  };

  const demoLogins = [
    { label: 'Alice', email: 'alice@wms.com', password: 'worker123' },
    { label: 'Bob', email: 'bob@wms.com', password: 'worker123' },
    { label: 'Carol', email: 'carol@wms.com', password: 'worker123' },
  ];

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Section - Image & Taglines (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/floor_login_bg.png" 
            alt="Warehouse Aisle" 
            className="w-full h-full object-cover opacity-50 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10 p-12 max-w-xl text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/90 backdrop-blur-sm rounded-2xl mb-8 shadow-2xl border border-white/10">
            <Box className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-6 tracking-tight">Equip the Frontline.</h1>
          <p className="text-xl text-blue-100 font-light leading-relaxed mb-8">
            The WMS Floor App gives warehouse workers the smart tools they need to pick, pack, receive, and restock with lightning efficiency and zero errors.
          </p>
          <div className="flex gap-4 items-center text-sm font-medium text-blue-200">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Barcode Scanning</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Task Queueing</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Real-time Sync</span>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-24">
        <div className="w-full max-w-md mx-auto">
          
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg">
              <Box className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">WMS Floor</h2>
            <p className="text-gray-500 mt-2">Warehouse Worker App</p>
          </div>

          <div className="hidden lg:block mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-500">Access your task queue and active sessions.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
            
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">Email Address</label>
              <input 
                id="login-email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="block w-full appearance-none bg-transparent px-0 py-3 text-gray-900 border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 transition-colors lg:border lg:rounded-xl lg:px-4 lg:py-3 lg:bg-white lg:shadow-sm" 
                placeholder="worker@wms.com" 
                required 
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">Password</label>
              <div className="relative">
                <input 
                  id="login-password" 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="block w-full appearance-none bg-transparent px-0 py-3 pr-10 text-gray-900 border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 transition-colors lg:border lg:rounded-xl lg:px-4 lg:py-3 lg:bg-white lg:shadow-sm" 
                  placeholder="••••••••" 
                  required 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 lg:pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button id="login-submit" type="submit" disabled={isLoading} className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 transition-colors mt-8">
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-12">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400">
                  Quick Demo Access
                </span>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              {demoLogins.map(d => (
                <button key={d.email} onClick={() => { setEmail(d.email); setPassword(d.password); }} className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600">
                  Login as {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
