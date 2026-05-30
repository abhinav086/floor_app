import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import LoginPage from './pages/auth/LoginPage';
import FloorLayout from './pages/FloorLayout';
import MyTasksPage from './pages/floor/MyTasksPage';
import TaskHistoryPage from './pages/floor/TaskHistoryPage';
import ScanPage from './pages/floor/ScanPage';
import ProfilePage from './pages/floor/ProfilePage';

// Task flows
import PickTaskPage from './pages/floor/PickTaskPage';
import PutawayTaskPage from './pages/floor/PutawayTaskPage';
import ReceiveTaskPage from './pages/floor/ReceiveTaskPage';
import PackTaskPage from './pages/floor/PackTaskPage';
import ShipTaskPage from './pages/floor/ShipTaskPage';
import ReturnTaskPage from './pages/floor/ReturnTaskPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/floor" element={<ProtectedRoute><FloorLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/floor/tasks" replace />} />
          <Route path="tasks" element={<MyTasksPage />} />
          <Route path="history" element={<TaskHistoryPage />} />
          <Route path="scan" element={<ScanPage />} />
          <Route path="profile" element={<ProfilePage />} />
          
          {/* Task flows (within layout so they get bottom nav if needed, but they have custom TopBar) */}
          <Route path="task/pick" element={<PickTaskPage />} />
          <Route path="task/putaway" element={<PutawayTaskPage />} />
          <Route path="task/receive" element={<ReceiveTaskPage />} />
          <Route path="task/pack" element={<PackTaskPage />} />
          <Route path="task/ship" element={<ShipTaskPage />} />
          <Route path="task/return" element={<ReturnTaskPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/floor/tasks" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
