import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface EditorState {
  content: string;
  wordCount: number;
  currentDocument: Document | null;
  documents: Document[];
  isDirty: boolean;

  setContent: (content: string) => void;
  setWordCount: (count: number) => void;
  insertText: (text: string) => void;
  createDocument: (title?: string) => void;
  saveDocument: () => void;
  loadDocument: (id: string) => void;
  deleteDocument: (id: string) => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      content:
        '# 欢迎使用 MarkFlow\n\n开始编写你的 Markdown 文档吧！\n\n## 功能特性\n\n- ✍️ 实时预览\n- 📄 导出 Word\n- 📊 导出 Excel\n- 📑 导出 PDF\n- 🌙 暗黑模式\n\n## 示例表格\n\n| 功能 | 状态 | 说明 |\n| --- | --- | --- |\n| Markdown 编辑 | ✅ | 支持 GFM |\n| 实时预览 | ✅ | 分屏显示 |\n| Word 导出 | ✅ | .docx 格式 |\n| Excel 导出 | ✅ | .xlsx 格式 |\n\n## 代码示例\n\n```javascript\nconsole.log("Hello, MarkFlow!");\n```\n\n> **提示**: 使用工具栏按钮快速插入 Markdown 语法\n',
      wordCount: 0,
      currentDocument: null,
      documents: [],
      isDirty: false,

      setContent: (content) => set({ content, isDirty: true }),

      setWordCount: (wordCount) => set({ wordCount }),

      insertText: (text) => {
        const event = new CustomEvent('editor:insert', { detail: text });
        window.dispatchEvent(event);
      },

      createDocument: (title = '未命名文档') => {
        const doc: Document = {
          id: Date.now().toString(36),
          title,
          content: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          documents: [...state.documents, doc],
          currentDocument: doc,
          content: doc.content,
          isDirty: false,
        }));
      },

      saveDocument: () => {
        const { currentDocument, content, documents } = get();
        if (!currentDocument) return;

        const updated = {
          ...currentDocument,
          content,
          updatedAt: Date.now(),
        };
        set({
          currentDocument: updated,
          documents: documents.map((d) =>
            d.id === updated.id ? updated : d
          ),
          isDirty: false,
        });
      },

      loadDocument: (id) => {
        const doc = get().documents.find((d) => d.id === id);
        if (doc) {
          set({ currentDocument: doc, content: doc.content, isDirty: false });
        }
      },

      deleteDocument: (id) => {
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
          currentDocument:
            state.currentDocument?.id === id ? null : state.currentDocument,
        }));
      },
    }),
    {
      name: 'markflow-editor',
      partialize: (state) => ({
        documents: state.documents,
        content: state.content,
      }),
    }
  )
);
