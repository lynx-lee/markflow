import { useEffect, useRef } from 'react';
import { useEditorStore } from '../stores/editorStore';

export function useAutoSave(interval: number = 30000) {
  const { content, isDirty, saveDocument } = useEditorStore();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!isDirty) return;

    timerRef.current = setTimeout(() => {
      saveDocument();
      console.log('Auto-saved');
    }, interval);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [content, isDirty, interval, saveDocument]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDocument();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveDocument]);
}
