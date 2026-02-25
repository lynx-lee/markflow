import React, { useCallback, useRef, useEffect } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';
import { useEditorStore } from '../../stores/editorStore';
import { useTheme } from '../../hooks/useTheme';
import '../../styles/editor.css';

interface MarkdownEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialValue,
  onChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { theme } = useTheme();
  const { content, setContent, setWordCount } = useEditorStore();

  const handleChange = useCallback(
    (value: string) => {
      setContent(value);
      const count = value.trim().length > 0
        ? value.trim().replace(/\s+/g, '').length
        : 0;
      setWordCount(count);
      onChange?.(value);
    },
    [onChange, setContent, setWordCount]
  );

  useEffect(() => {
    if (!editorRef.current) return;

    const extensions = [
      lineNumbers(),
      highlightActiveLine(),
      history(),
      markdown({ base: markdownLanguage }),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          handleChange(update.state.doc.toString());
        }
      }),
      EditorView.lineWrapping,
      ...(theme === 'dark' ? [oneDark] : []),
    ];

    const state = EditorState.create({
      doc: initialValue ?? content,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    // 监听插入文本事件
    const handleInsert = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const text = customEvent.detail;
      if (viewRef.current) {
        const { from, to } = viewRef.current.state.selection.main;
        viewRef.current.dispatch({
          changes: { from, to, insert: text },
          selection: { anchor: from + text.length },
        });
        viewRef.current.focus();
      }
    };

    window.addEventListener('editor:insert', handleInsert);

    return () => {
      window.removeEventListener('editor:insert', handleInsert);
      view.destroy();
    };
  }, [theme]);

  // 初始化字数统计
  useEffect(() => {
    const count = content.trim().length > 0
      ? content.trim().replace(/\s+/g, '').length
      : 0;
    setWordCount(count);
  }, []);

  return (
    <div className="editor-container h-full overflow-auto">
      <div ref={editorRef} className="h-full" />
    </div>
  );
};

export default MarkdownEditor;
