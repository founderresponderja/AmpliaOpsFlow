import React, { useState } from 'react';
import { EnvVar } from '../types';
import { Copy, Check, Lock, Globe } from 'lucide-react';

interface EnvVarViewerProps {
  envVars: EnvVar[];
}

const EnvVarViewer: React.FC<EnvVarViewerProps> = ({ envVars }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!envVars || envVars.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-amplia-textDim p-8">
        No environment variables recommended for this configuration.
      </div>
    );
  }

  return (
    <div className="bg-amplia-surface rounded-lg border border-amplia-border overflow-hidden h-full flex flex-col">
       <div className="p-4 bg-amplia-bg border-b border-amplia-border flex justify-between items-center">
         <h3 className="text-amplia-text flex items-center gap-2">
           <Lock size={16} className="text-amplia-accent" />
           Environment Variables
         </h3>
         <div className="text-xs text-amplia-textDim">
           {envVars.length} variables defined
         </div>
       </div>
       
       <div className="overflow-y-auto flex-1 p-4 space-y-3">
         {envVars.map((item, index) => (
           <div key={index} className="bg-[#0d1117] rounded-lg border border-amplia-border p-4 group hover:border-amplia-accent/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                 <div className="font-mono text-sm text-amplia-accent break-all">
                   {item.key}
                 </div>
                 <button 
                    onClick={() => handleCopy(`${item.key}=${item.value}`, index)}
                    className="text-amplia-textDim hover:text-amplia-text transition-colors focus:outline-none"
                    title="Copy Key=Value"
                 >
                    {copiedIndex === index ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                 </button>
              </div>
              
              <div className="relative mb-2">
                <div className="font-mono text-xs text-green-400 bg-black/30 p-2 rounded break-all border border-gray-800">
                  {item.value}
                </div>
              </div>
              
              <p className="text-xs text-gray-400 leading-relaxed">
                {item.description}
              </p>
           </div>
         ))}
       </div>
       
       <div className="p-3 bg-amplia-bg/50 border-t border-amplia-border text-xs text-amplia-textDim text-center">
         These are example values. Always use secure secrets management in production.
       </div>
    </div>
  );
};

export default EnvVarViewer;