import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SelectInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  icon: LucideIcon;
}

const SelectInput: React.FC<SelectInputProps> = ({ id, label, value, onChange, options, icon: Icon }) => {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-amplia-textDim">{label}</label>
      <div className="relative group">
        <Icon className="absolute left-3 top-3 text-amplia-textDim group-focus-within:text-amplia-accent transition-colors w-5 h-5" aria-hidden="true" />
        <select
          id={id}
          className="w-full bg-amplia-bg border border-amplia-border rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-amplia-accent focus:border-transparent outline-none appearance-none transition-all cursor-pointer"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {/* Custom Chevron for better UX since appearance-none is used */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-amplia-textDim">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SelectInput;