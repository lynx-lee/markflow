import React from 'react';
import SplitView from '../components/Editor/SplitView';
import { useAutoSave } from '../hooks/useAutoSave';

const EditorPage: React.FC = () => {
  useAutoSave(30000);

  return (
    <div className="h-screen">
      <SplitView />
    </div>
  );
};

export default EditorPage;
