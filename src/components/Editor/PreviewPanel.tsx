import React, { useMemo } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';
import { useEditorStore } from '../../stores/editorStore';
import 'highlight.js/styles/github-dark.css';
import '../../styles/markdown-preview.css';

// 配置 marked
marked.setOptions({
  gfm: true,
  breaks: true,
});

const renderer = new marked.Renderer();
renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
  if (lang && hljs.getLanguage(lang)) {
    const highlighted = hljs.highlight(text, { language: lang }).value;
    return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
  }
  const highlighted = hljs.highlightAuto(text).value;
  return `<pre><code class="hljs">${highlighted}</code></pre>`;
};

marked.use({ renderer });

const PreviewPanel: React.FC = () => {
  const { content } = useEditorStore();

  const htmlContent = useMemo(() => {
    const raw = marked.parse(content) as string;
    return DOMPurify.sanitize(raw, {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
    });
  }, [content]);

  return (
    <div className="preview-panel h-full overflow-auto bg-white dark:bg-gray-900 p-8">
      <article
        className="markdown-body prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};

export default PreviewPanel;
