import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import ExportDialog from '../Export/ExportDialog';
import { useUIStore } from '../../stores/uiStore';

const Layout: React.FC = () => {
  const location = useLocation();
  const isEditor = location.pathname.startsWith('/editor');
  const { exportDialogOpen, setExportDialogOpen } = useUIStore();

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {!isEditor && <Header />}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
      <ExportDialog
        isOpen={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
      />
    </div>
  );
};

export default Layout;
