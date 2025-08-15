import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, RotateCcw } from 'lucide-react';
import { useThemeStore } from '../../store/store';

interface ColorPickerProps {
  className?: string;
}

export function ColorPicker({ className = '' }: ColorPickerProps) {
  const { customColors, setCustomColors, resetColors } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleColorChange = (colorType: keyof typeof customColors, value: string) => {
    setCustomColors({ [colorType]: value });
  };

  const colorOptions = [
    { label: 'Primary', key: 'primary', color: customColors.primary },
    { label: 'Secondary', key: 'secondary', color: customColors.secondary },
    { label: 'Accent', key: 'accent', color: customColors.accent },
  ];

  return (
    <div className={`relative ${className}`}>
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-lightCard dark:bg-darkCard hover:bg-lightCardHover dark:hover:bg-darkCardHover transition-colors"
        aria-label="Open color picker"
      >
        <Palette className="h-5 w-5 text-primary" />
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="absolute right-0 top-12 w-64 p-4 bg-lightCard dark:bg-darkCard rounded-lg shadow-modal border border-border dark:border-borderDark z-50"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-black dark:text-white">
                Theme Colors
              </h3>
              <button
                onClick={resetColors}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Reset to default colors"
              >
                <RotateCcw className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {colorOptions.map(({ label, key, color }) => (
              <div key={key} className="space-y-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {label}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(key as keyof typeof customColors, e.target.value)}
                    className="w-8 h-8 rounded border border-border dark:border-borderDark cursor-pointer bg-lightCard dark:bg-darkCard"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => handleColorChange(key as keyof typeof customColors, e.target.value)}
                    className="flex-1 px-2 py-1 text-xs bg-lightCard dark:bg-darkCard border border-border dark:border-borderDark rounded text-black dark:text-white"
                    placeholder="#000000"
                  />
                </div>
              </div>
            ))}

            <div className="pt-2 border-t border-border dark:border-borderDark">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Preview:
              </div>
              <div className="flex space-x-2 mt-2">
                <div
                  className="w-6 h-6 rounded border border-border dark:border-borderDark"
                  style={{ backgroundColor: customColors.primary }}
                />
                <div
                  className="w-6 h-6 rounded border border-border dark:border-borderDark"
                  style={{ backgroundColor: customColors.secondary }}
                />
                <div
                  className="w-6 h-6 rounded border border-border dark:border-borderDark"
                  style={{ backgroundColor: customColors.accent }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 