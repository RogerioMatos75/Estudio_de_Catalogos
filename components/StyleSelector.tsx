import React from 'react';
import type { PromptStyle } from '../prompts';

interface StyleSelectorProps {
  styles: PromptStyle[];
  selectedStyleId: string;
  onStyleChange: (id: string) => void;
  disabled?: boolean;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ styles, selectedStyleId, onStyleChange, disabled }) => {
  return (
    <div className="space-y-3">
      {styles.map((style) => {
        const isSelected = style.id === selectedStyleId;
        return (
          <button
            key={style.id}
            onClick={() => onStyleChange(style.id)}
            disabled={disabled}
            className={`w-full flex items-center text-left p-3 rounded-lg border-2 transition-all duration-200
              ${isSelected
                ? 'bg-indigo-50 border-indigo-500 shadow-sm'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
              ${disabled ? 'cursor-not-allowed opacity-60' : ''}
            `}
          >
            <div className={`mr-4 p-2 rounded-md ${isSelected ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                <style.icon className={`w-6 h-6 ${isSelected ? 'text-indigo-600' : 'text-gray-500'}`} />
            </div>
            <div>
              <p className={`font-semibold ${isSelected ? 'text-indigo-900' : 'text-gray-800'}`}>{style.name}</p>
              <p className="text-sm text-gray-500">{style.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};