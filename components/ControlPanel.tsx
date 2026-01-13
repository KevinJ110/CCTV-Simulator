
import React from 'react';
import { SecurityAction } from '../types';

interface ControlPanelProps {
  onAction: (action: SecurityAction) => void;
  disabled: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onAction, disabled }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-900 border-t border-gray-700 shadow-inner">
      <button
        onClick={() => onAction(SecurityAction.IGNORE)}
        disabled={disabled}
        className="flex flex-col items-center justify-center p-6 bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <i className="fas fa-eye-slash text-2xl mb-2 text-gray-400 group-hover:text-white"></i>
        <span className="font-bold text-xs uppercase tracking-widest text-gray-300">No Action Required</span>
      </button>

      <button
        onClick={() => onAction(SecurityAction.FLAG)}
        disabled={disabled}
        className="flex flex-col items-center justify-center p-6 bg-blue-900/40 hover:bg-blue-800/60 border-2 border-blue-600/50 rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <i className="fas fa-flag text-2xl mb-2 text-blue-400 group-hover:text-white"></i>
        <span className="font-bold text-xs uppercase tracking-widest text-blue-300">Flag for Review</span>
      </button>

      <button
        onClick={() => onAction(SecurityAction.DISPATCH)}
        disabled={disabled}
        className="flex flex-col items-center justify-center p-6 bg-yellow-900/40 hover:bg-yellow-800/60 border-2 border-yellow-600/50 rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <i className="fas fa-shield-alt text-2xl mb-2 text-yellow-400 group-hover:text-white"></i>
        <span className="font-bold text-xs uppercase tracking-widest text-yellow-300">Dispatch Unit</span>
      </button>

      <button
        onClick={() => onAction(SecurityAction.EVACUATE)}
        disabled={disabled}
        className="flex flex-col items-center justify-center p-6 bg-red-900/40 hover:bg-red-800/60 border-2 border-red-600/50 rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <i className="fas fa-radiation text-2xl mb-2 text-red-400 group-hover:text-white"></i>
        <span className="font-bold text-xs uppercase tracking-widest text-red-300">Full Evacuation</span>
      </button>
    </div>
  );
};

export default ControlPanel;
