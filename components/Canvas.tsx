import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';

interface CanvasProps {
  baseImage: string | null;
  generatedImage: string | null;
  isFinalImage: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
}

export const Canvas: React.FC<CanvasProps> = ({ 
  baseImage, 
  generatedImage,
  isFinalImage,
  brightness,
  contrast,
  saturation
}) => {
  const displayImage = generatedImage || baseImage;

  const imageStyle: React.CSSProperties = isFinalImage 
    ? { filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`, transition: 'filter 0.2s ease-out' }
    : {};

  const handleDownload = () => {
    if (!generatedImage) return;

    const canvas = document.createElement('canvas');
    const img = new Image();
    img.crossOrigin = 'anonymous'; 

    img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Aplica filtros apenas se for a imagem final sendo baixada
            if(isFinalImage) {
              ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
            }
            ctx.drawImage(img, 0, 0);
            
            const dataUrl = canvas.toDataURL('image/png');
            
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'catalogo-gerado.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    img.src = generatedImage;
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden relative">
      {displayImage ? (
        <img src={displayImage} alt="Resultado" className="max-h-full max-w-full object-contain" style={imageStyle} />
      ) : (
        <div className="text-center text-gray-500 p-8">
          <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <p className="mt-4 font-semibold">A sua imagem final aparecerá aqui</p>
          <p className="mt-1 text-sm">Carregue uma imagem de modelo para começar.</p>
        </div>
      )}

      {generatedImage && (
        <button
          onClick={handleDownload}
          className="absolute top-4 right-4 bg-white bg-opacity-80 backdrop-blur-sm text-gray-800 hover:bg-indigo-600 hover:text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 flex items-center gap-2"
        >
          <DownloadIcon className="w-5 h-5" />
          <span>Baixar</span>
        </button>
      )}
    </div>
  );
};