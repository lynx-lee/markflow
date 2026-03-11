import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEdit3, FiFileText, FiGrid, FiFile, FiCode, FiMoon, FiUpload } from 'react-icons/fi';
import { useEditorStore } from '../stores/editorStore';

const features = [
  { icon: <FiEdit3 size={24} />, title: '实时编辑', desc: '基于 CodeMirror 6 的高性能编辑器，支持语法高亮' },
  { icon: <FiFileText size={24} />, title: '导出 Word', desc: '保留标题、表格、列表、代码块等格式' },
  { icon: <FiGrid size={24} />, title: '导出 Excel', desc: '自动提取 Markdown 表格，生成专业 Excel 文件' },
  { icon: <FiFile size={24} />, title: '导出 PDF', desc: '高质量 PDF 渲染，支持页眉页脚' },
  { icon: <FiCode size={24} />, title: '代码高亮', desc: '支持 180+ 编程语言语法高亮显示' },
  { icon: <FiMoon size={24} />, title: '暗黑模式', desc: '保护眼睛，一键切换明暗主题' },
];

const Home: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const importDocument = useEditorStore((s) => s.importDocument);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
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

    // 清空 input 以便同一文件可再次上传
    e.target.value = '';
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 pt-20 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <FiEdit3 className="text-blue-600 dark:text-blue-400" size={48} />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            MarkFlow
          </h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 text-center max-w-2xl">
          功能强大的在线 Markdown 编辑器，支持实时预览并导出为 Word / Excel / PDF 等格式
        </p>
        <div className="flex items-center gap-4">
          <Link
            to="/editor"
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                       transition-all shadow-lg hover:shadow-xl text-lg font-medium
                       hover:-translate-y-0.5"
          >
            开始编辑
          </Link>
          <button
            onClick={handleUploadClick}
            className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400
                       border-2 border-blue-600 dark:border-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700
                       transition-all shadow-lg hover:shadow-xl text-lg font-medium
                       hover:-translate-y-0.5"
          >
            <FiUpload size={20} />
            上传 MD 文件
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,text/markdown"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 
                         dark:border-gray-700 hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="text-blue-600 dark:text-blue-400 mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
