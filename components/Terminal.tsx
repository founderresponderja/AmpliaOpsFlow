import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Terminal as TerminalIcon } from 'lucide-react';

interface TerminalProps {
  logs: LogEntry[];
  title?: string;
}

const Terminal: React.FC<TerminalProps> = ({ logs, title = "Deployment Logs" }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div 
      className="bg-amplia-surface rounded-lg overflow-hidden border border-amplia-border font-mono text-sm h-full flex flex-col"
      role="region"
      aria-label={title}
    >
      <div className="bg-amplia-bg px-4 py-2 flex items-center gap-2 border-b border-amplia-border">
        <TerminalIcon size={16} className="text-amplia-textDim" aria-hidden="true" />
        <span className="text-amplia-textDim">{title}</span>
        <div className="flex-1"></div>
        <div className="flex gap-1.5" aria-hidden="true">
          <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
        </div>
      </div>
      <div 
        className="p-4 overflow-y-auto flex-1 space-y-2 max-h-[400px] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amplia-accent bg-[#0d1117] text-gray-300"
        role="log"
        aria-live="polite"
        aria-atomic="false"
        tabIndex={0}
      >
        {logs.length === 0 && (
          <div className="text-gray-500 italic">Waiting for process to start...</div>
        )}
        {logs.map((log, index) => (
          <div key={index} className="flex gap-3">
            <span className="text-gray-500 shrink-0 select-none" aria-hidden="true">
              {log.timestamp}
            </span>
            <span className={`break-all ${
 log.level === 'error' ? 'text-red-400' :
 log.level === 'warning' ? 'text-yellow-400' :
 log.level === 'success' ? 'text-green-400' :
 'text-gray-300'
 }`}>
              <span className="sr-only">{log.level}: </span>
              <span aria-hidden="true" className="select-none mr-2">
                {log.level === 'success' ? '✓' : log.level === 'error' ? '✗' : '>'}
              </span>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default Terminal;