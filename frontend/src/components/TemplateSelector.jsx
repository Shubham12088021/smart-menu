import { TEMPLATES } from '../utils/constants';
import { Check } from 'lucide-react';

export default function TemplateSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {TEMPLATES.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template.id)}
          className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
            selected === template.id
              ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 shadow-lg shadow-primary-500/10'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          {selected === template.id && (
            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}

          {/* Preview Colors */}
          <div className="flex gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-lg"
              style={{ backgroundColor: template.colors.bg, border: '1px solid #e5e7eb' }}
            />
            <div
              className="w-8 h-8 rounded-lg"
              style={{ backgroundColor: template.colors.accent }}
            />
            <div
              className="w-8 h-8 rounded-lg"
              style={{ backgroundColor: template.colors.text }}
            />
          </div>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{template.preview}</span>
            <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{template.description}</p>
        </button>
      ))}
    </div>
  );
}
