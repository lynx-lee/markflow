import React, { useState } from 'react';
import { FiFileText, FiGrid, FiFile, FiCode, FiDownload } from 'react-icons/fi';
import { useExport } from '../../hooks/useExport';
import Modal from '../Common/Modal';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'docx' | 'xlsx' | 'pdf' | 'html' | 'md';

interface FormatOption {
  id: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const formatOptions: FormatOption[] = [
  {
    id: 'docx',
    label: 'Word (.docx)',
    description: '导出为 Microsoft Word 文档，保留标题、列表、表格等格式',
    icon: <FiFileText className="text-blue-500" size={28} />,
  },
  {
    id: 'xlsx',
    label: 'Excel (.xlsx)',
    description: '将 Markdown 中的表格数据导出为 Excel 工作表',
    icon: <FiGrid className="text-green-500" size={28} />,
  },
  {
    id: 'pdf',
    label: 'PDF (.pdf)',
    description: '导出为 PDF 文档，适合打印和分享',
    icon: <FiFile className="text-red-500" size={28} />,
  },
  {
    id: 'html',
    label: 'HTML (.html)',
    description: '导出为完整的 HTML 页面，包含样式',
    icon: <FiCode className="text-orange-500" size={28} />,
  },
  {
    id: 'md',
    label: 'Markdown (.md)',
    description: '保存原始 Markdown 文件',
    icon: <FiFileText className="text-purple-500" size={28} />,
  },
];

const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('docx');
  const [fileName, setFileName] = useState('untitled');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { exportDocument } = useExport();

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
      await exportDocument(selectedFormat, fileName);
      onClose();
    } catch (err) {
      setError('导出失败，请检查后端服务是否已启动');
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="导出文档">
      <div className="space-y-6">
        {/* 文件名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            文件名
          </label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600
                       rounded-lg bg-white dark:bg-gray-700
                       text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="输入文件名..."
          />
        </div>

        {/* 格式选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            导出格式
          </label>
          <div className="grid grid-cols-1 gap-3">
            {formatOptions.map((format) => (
              <div
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer
                  transition-all duration-200
                  ${selectedFormat === format.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
              >
                {format.icon}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {format.label}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {format.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        {/* 导出按钮 */}
        <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300
                       hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || !fileName.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white
                       rounded-lg hover:bg-blue-700 disabled:opacity-50
                       disabled:cursor-not-allowed transition-colors"
          >
            <FiDownload size={16} />
            {isExporting ? '导出中...' : '导出'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportDialog;
