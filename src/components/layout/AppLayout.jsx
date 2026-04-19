import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useAuthStore } from '../../store/authStore'

export default function AppLayout() {
  const { profile } = useAuthStore()
  const showSidebar = profile && (profile.role === 'ADMIN' || profile.role === 'STAFF')

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">
      {showSidebar && <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 max-w-[1440px] mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
