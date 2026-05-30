import { Outlet } from 'react-router-dom';
import BottomNav from '../components/floor/BottomNav';

export default function FloorLayout() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
