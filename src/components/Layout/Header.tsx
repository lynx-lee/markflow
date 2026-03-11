import React, { useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiEdit3, FiSun, FiMoon, FiHome, FiUpload } from 'react-icons/fi';
import { useTheme } from '../../hooks/useTheme';
import { useEditorStore } from '../../stores/editorStore';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isEditor = location.pathname.startsWith('/editor');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importDocument = useEditorStore((s) => s.importDocument);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown') && file.type !== 'text/markdown') {
      alert('请上传 .md 或 .markdown 格式的文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content != null) {
        const title = file.name.replace(/\.(md|markdown)$/, '');
        importDocument(title, content);
        navigate('/editor');
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
      <Link to="/" className="flex items-center gap-2 text-lg font-bold text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity">
        <FiEdit3 size={22} />
        <span>MarkFlow</span>
      </Link>

      <div className="flex items-center gap-3">
        {isEditor && (
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium"
          >
            <FiHome size={16} />
            <span>首页</span>
          </Link>
        )}
        {!isEditor && (
          <>
            <Link
              to="/editor"
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              开始编辑
            </Link>
            <button
              onClick={handleUploadClick}
              className="flex items-center gap-1.5 px-4 py-1.5 border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400
                         rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              <FiUpload size={14} />
              上传 MD
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown,text/markdown"
              onChange={handleFileChange}
              className="hidden"
            />
          </>
        )}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          title="切换主题"
        >
          {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
