import React from 'react';
import { FiDownload } from 'react-icons/fi';
import { useUIStore } from '../../stores/uiStore';

const ExportButton: React.FC = () => {
  const { setExportDialogOpen } = useUIStore();

  return (
    <button
      onClick={() => setExportDialogOpen(true)}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white
                 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
    >
      <FiDownload size={14} />
      导出
    </button>
  );
};

export default ExportButton;
