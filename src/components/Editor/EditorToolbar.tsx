import React from 'react';
import {
  FiBold, FiItalic, FiCode, FiLink, FiImage, FiList,
  FiColumns, FiEdit3, FiEye,
  FiSun, FiMoon
} from 'react-icons/fi';
import ExportButton from '../Export/ExportButton';
import { useEditorStore } from '../../stores/editorStore';
import { useTheme } from '../../hooks/useTheme';

type ViewMode = 'split' | 'editor' | 'preview';

interface EditorToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const ToolbarButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    title={label}
    onClick={onClick}
    className={`p-2 rounded-md transition-colors
      ${active
        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
  >
    {icon}
  </button>
);

const EditorToolbar: React.FC<EditorToolbarProps> = ({ viewMode, onViewModeChange }) => {
  const { wordCount, insertText } = useEditorStore();
  const { theme, toggleTheme } = useTheme();

  const markdownActions = [
    { icon: <FiBold size={16} />, label: '粗体 (Ctrl+B)', insert: '**粗体文本**' },
    { icon: <FiItalic size={16} />, label: '斜体 (Ctrl+I)', insert: '*斜体文本*' },
    { icon: <FiCode size={16} />, label: '行内代码', insert: '`代码`' },
    { icon: <FiLink size={16} />, label: '链接', insert: '[链接文本](https://)' },
    { icon: <FiImage size={16} />, label: '图片', insert: '![alt](image-url)' },
    { icon: <FiList size={16} />, label: '列表', insert: '\n- 列表项\n- 列表项\n' },
  ];

  return (
    <div className="flex items-center justify-between px-4 py-2
                    border-b border-gray-200 dark:border-gray-700
                    bg-white dark:bg-gray-800">
      {/* 左侧 - Markdown 快捷操作 */}
      <div className="flex items-center gap-1">
        {markdownActions.map((action, i) => (
          <ToolbarButton
            key={i}
            icon={action.icon}
            label={action.label}
            onClick={() => insertText(action.insert)}
          />
        ))}

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

        {/* 表格快捷插入 */}
        <ToolbarButton
          icon={<span className="text-xs font-bold">T</span>}
          label="插入表格"
          onClick={() =>
            insertText(
              '\n| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |\n'
            )
          }
        />
      </div>

      {/* 中间 - 视图切换 */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <ToolbarButton
          icon={<FiEdit3 size={14} />}
          label="仅编辑"
          active={viewMode === 'editor'}
          onClick={() => onViewModeChange('editor')}
        />
        <ToolbarButton
          icon={<FiColumns size={14} />}
          label="分屏"
          active={viewMode === 'split'}
          onClick={() => onViewModeChange('split')}
        />
        <ToolbarButton
          icon={<FiEye size={14} />}
          label="仅预览"
          active={viewMode === 'preview'}
          onClick={() => onViewModeChange('preview')}
        />
      </div>

      {/* 右侧 - 功能按钮 */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">{wordCount} 字</span>

        <ToolbarButton
          icon={theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
          label="切换主题"
          onClick={toggleTheme}
        />

        <ExportButton />
      </div>
    </div>
  );
};

export default EditorToolbar;
