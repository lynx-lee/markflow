import React, { useState } from 'react';
import MarkdownEditor from './MarkdownEditor';
import PreviewPanel from './PreviewPanel';
import EditorToolbar from './EditorToolbar';

type ViewMode = 'split' | 'editor' | 'preview';

const SplitView: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [splitRatio, setSplitRatio] = useState(50);

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <EditorToolbar viewMode={viewMode} onViewModeChange={setViewMode} />

      {/* 编辑区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 编辑器 */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div
            className="h-full overflow-hidden border-r border-gray-200 dark:border-gray-700"
            style={{
              width: viewMode === 'split' ? `${splitRatio}%` : '100%',
            }}
          >
            <MarkdownEditor />
          </div>
        )}

        {/* 可拖拽分隔条 */}
        {viewMode === 'split' && (
          <div
            className="w-1 cursor-col-resize bg-gray-300 dark:bg-gray-600
                       hover:bg-blue-500 transition-colors flex-shrink-0"
            onMouseDown={(e) => {
              const startX = e.clientX;
              const startRatio = splitRatio;
              const container = e.currentTarget.parentElement!;
              const totalWidth = container.offsetWidth;

              const onMouseMove = (ev: MouseEvent) => {
                const delta = ev.clientX - startX;
                const newRatio = startRatio + (delta / totalWidth) * 100;
                setSplitRatio(Math.min(Math.max(newRatio, 20), 80));
              };

              const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
              };

              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);
            }}
          />
        )}

        {/* 预览 */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div
            className="h-full overflow-hidden"
            style={{
              width: viewMode === 'split' ? `${100 - splitRatio}%` : '100%',
            }}
          >
            <PreviewPanel />
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitView;
