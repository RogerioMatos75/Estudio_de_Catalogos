import React, { useRef, useState, useCallback, DragEvent } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  id: string;
  label: string;
  onFileSelect: (file: File) => void;
  preview?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, onFileSelect, preview }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      } else {
        alert('Por favor, selecione um arquivo de imagem.');
      }
    }
  }, [onFileSelect]);

  const onDragOver = useCallback((event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileChange(event.dataTransfer.files);
  }, [handleFileChange]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <label
        htmlFor={id}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative group flex justify-center items-center w-full h-40 px-6 py-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out
          ${preview ? '' : 'bg-gray-50'}
          ${isDragging ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500'}
        `}
      >
        {preview ? (
          <img src={preview} alt={label} className="h-full w-full object-contain rounded-md" />
        ) : (
          <div className="text-center">
            <UploadIcon className="mx-auto h-8 w-8 text-gray-400 group-hover:text-indigo-500" />
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-semibold text-indigo-600">Clique para carregar</span> ou arraste e solte
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP</p>
          </div>
        )}
        <input
          id={id}
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="sr-only"
          onChange={(e) => {
            handleFileChange(e.target.files);
            // Limpa o valor para permitir o re-upload do mesmo arquivo
            e.currentTarget.value = '';
          }}
        />
      </label>
    </div>
  );
};