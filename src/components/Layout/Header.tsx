import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiEdit3, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../hooks/useTheme';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isEditor = location.pathname.startsWith('/editor');

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
      <Link to="/" className="flex items-center gap-2 text-lg font-bold text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity">
        <FiEdit3 size={22} />
        <span>MarkFlow</span>
      </Link>

      <div className="flex items-center gap-3">
        {!isEditor && (
          <Link
            to="/editor"
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            开始编辑
          </Link>
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
