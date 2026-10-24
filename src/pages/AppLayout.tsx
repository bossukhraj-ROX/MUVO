import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Chrome as Home, ClipboardCheck, PoundSterling, Mail, FileText, Settings, ArrowLeft } from 'lucide-react';
import { useProject } from '../lib/projectContext';
import SaveIndicator from '../components/SaveIndicator';
import './AppLayout.css';

const NAV_ITEMS = [
  { path: '/app', label: 'Overview', icon: Home },
  { path: '/app/inspection', label: 'Inspection', icon: ClipboardCheck },
  { path: '/app/deductions', label: 'Deductions', icon: PoundSterling },
  { path: '/app/emails', label: 'Emails', icon: Mail },
  { path: '/app/report', label: 'Report', icon: FileText },
  { path: '/app/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout() {
  const { project, loading } = useProject();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" />
        <p>Loading your project…</p>
      </div>
    );
  }

  if (!project) {
    navigate('/');
    return null;
  }

  const isActive = (path: string) => {
    if (path === '/app') return location.pathname === '/app';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="app-shell">
      {/* Top bar */}
      <header className="app-header no-print">
        <div className="container-wide app-header-inner">
          <button className="app-back focus-ring" onClick={() => navigate('/')}>
            <ArrowLeft size={18} />
            <span className="wordmark wordmark-sm">MUVO</span>
          </button>
          <div className="app-header-center">
            <span className="app-project-name">{project.nickname || 'Untitled project'}</span>
            {project.isDemo && <span className="badge badge-mint">Demo</span>}
          </div>
          <div className="app-header-right">
            <SaveIndicator />
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="app-nav-mobile no-print">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              className={`app-nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={isActive(item.path) ? 'page' : undefined}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Desktop sidebar */}
      <aside className="app-sidebar no-print">
        <div className="app-sidebar-inner">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                className={`app-sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main content */}
      <main className="app-main">
        <div className="container-wide app-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
