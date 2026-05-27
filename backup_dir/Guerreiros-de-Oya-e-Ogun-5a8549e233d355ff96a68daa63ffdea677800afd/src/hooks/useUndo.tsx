import React from 'react';

export interface UndoAction {
  id: string;
  label: string;
  onConfirm: () => void;
  onUndo?: () => void;
  timestamp: number;
}

interface UndoContextType {
  queueDelete: (action: UndoAction) => void;
}

export const UndoContext = React.createContext<UndoContextType>({
  queueDelete: () => {},
});

export function useUndo() {
  return React.useContext(UndoContext);
}
