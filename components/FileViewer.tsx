import React, { useState } from 'react';
import { GeneratedFile } from '../types';
import { FileCode, Copy, Check } from 'lucide-react';

interface FileViewerProps {
  files: GeneratedFile[];
}

const FileViewer: React.FC<FileViewerProps> = ({ files }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(files[activeTab].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!files || files.length === 0) return null;

  return (
    <div className="bg-amplia-surface rounded-lg border border-amplia-border overflow-hidden flex flex-col h-full">
      <div 
        role="tablist" 
        aria-label="Configuration Files" 
        className="flex border-b border-amplia-border overflow-x-auto bg-amplia-bg"
      >
        {files.map((file, index) => (
          <button
            key={index}
            role="tab"
            id={`tab-${index}`}
            aria-selected={activeTab === index}
            aria-controls={`panel-${index}`}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-3 text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amplia-accent ${
              activeTab === index
                ? 'bg-amplia-surface text-amplia-text border-b-2 border-amplia-accent'
                : 'text-amplia-textDim hover:text-amplia-text hover:bg-amplia-surface'
            }`}
          >
            <FileCode size={14} aria-hidden="true" />
            {file.filename}
          </button>
        ))}
      </div>
      
      <div 
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="relative flex-1 bg-[#1e1e1e] group" // Keep code background dark always
        tabIndex={0}
      >
         <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
            <button 
              onClick={handleCopy}
              className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amplia-accent"
              title="Copy to clipboard"
              aria-label="Copy code to clipboard"
            >
              {copied ? <Check size={16} className="text-green-400" aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            </button>
         </div>
         
         <div className="p-4 overflow-auto h-full max-h-[500px]">
            <p className="text-xs text-gray-400 mb-4 border-b border-gray-700 pb-2">
              {files[activeTab].description}
            </p>
            <pre className="font-mono text-sm text-blue-300 leading-relaxed">
              <code>{files[activeTab].content}</code>
            </pre>
         </div>
      </div>
    </div>
  );
};

export default FileViewer;