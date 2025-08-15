import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  aspectRatio?: number;
  className?: string;
}

export function ImageUpload({ onImageSelect, aspectRatio = 1, className }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageSelect(null as any);
  };

  return (
    <div
      className={cn(
        'relative border-2 border-dashed border-lightCard/50 dark:border-darkCard/50 rounded-lg',
        'flex items-center justify-center cursor-pointer',
        'hover:border-[#BBF10A]/50 dark:hover:border-[#BBF10A]/50',
        'transition-colors duration-200',
        className
      )}
      style={{ aspectRatio }}
      onClick={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {preview ? (
        <>
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 rounded-full bg-darkBg/80 text-white hover:bg-error"
          >
            <X className="h-4 w-4" />
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 text-gray-600 dark:text-gray-400">
          <Upload className="h-8 w-8" />
          <span className="text-sm">Click to upload</span>
        </div>
      )}
    </div>
  );
} 