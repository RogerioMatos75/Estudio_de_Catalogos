import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { Canvas } from './components/Canvas';
import { Loader } from './components/Loader';
import { MagicWandIcon } from './components/icons/MagicWandIcon';
import type { ImageFile } from './types';
import { generateLook, createScene, refineImage } from './services/geminiService';
import { toBase64 } from './utils/fileUtils';
import { SunIcon } from './components/icons/SunIcon';
import { ContrastIcon } from './components/icons/ContrastIcon';
import { SaturationIcon } from './components/icons/SaturationIcon';
import { saveImageToDB, getImageFromDB, clearDB } from './utils/db';
import { StyleSelector } from './components/StyleSelector';
import { promptStyles } from './prompts';
import { PaletteIcon } from './components/icons/PaletteIcon';
import { PaintBrushIcon } from './components/icons/PaintBrushIcon';

export default function App(): React.ReactElement {
  // --- API Key Management ---
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState<string>('');

  const [modelImage, setModelImage] = useState<ImageFile | null>(null);
  const [clothingImage, setClothingImage] = useState<ImageFile | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<ImageFile | null>(null);
  
  const [intermediateResultImage, setIntermediateResultImage] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const [resetKey, setResetKey] = useState(0);

  // Style selection state
  const [selectedStyleId, setSelectedStyleId] = useState<string>(promptStyles[0].id);

  // Refinement prompt state
  const [refinementPrompt, setRefinementPrompt] = useState<string>('');

  // Image adjustment states
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);

  // --- API Key Persistence ---
  useEffect(() => {
    const storedApiKey = localStorage.getItem('geminiApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleApiKeySave = () => {
    if (apiKeyInput.trim()) {
      const trimmedKey = apiKeyInput.trim();
      setApiKey(trimmedKey);
      localStorage.setItem('geminiApiKey', trimmedKey);
    } else {
      setError("Por favor, insira uma chave de API válida.");
    }
  };

  // Load images from IndexedDB on initial render
  useEffect(() => {
    const loadImages = async () => {
      try {
        const savedModelImage = await getImageFromDB('modelImage');
        if (savedModelImage) setModelImage(savedModelImage);
        
        const savedClothingImage = await getImageFromDB('clothingImage');
        if (savedClothingImage) setClothingImage(savedClothingImage);

        const savedBackgroundImage = await getImageFromDB('backgroundImage');
        if (savedBackgroundImage) setBackgroundImage(savedBackgroundImage);

      } catch (err) {
        console.error("Falha ao carregar imagens do IndexedDB", err);
        setError("Não foi possível carregar as imagens salvas. O seu navegador pode estar em modo privado ou com o armazenamento desativado.");
      }
    };
    loadImages();
  }, []);

  // Save model image to IndexedDB whenever it changes
  useEffect(() => {
    if (!modelImage) return;

    const saveModel = async () => {
        try {
            const dataToSave = { 
                id: 'modelImage', 
                base64: modelImage.base64, 
                mimeType: modelImage.mimeType 
            };
            await saveImageToDB(dataToSave);
        } catch (err) {
            console.error("Falha ao salvar a imagem do modelo no IndexedDB", err);
            setError("Falha ao salvar a imagem do modelo. A imagem pode ser muito grande ou o armazenamento do navegador está cheio.");
        }
    };
    saveModel();
  }, [modelImage]);

  // Save clothing image to IndexedDB whenever it changes
  useEffect(() => {
    if (!clothingImage) return;
      
    const saveClothing = async () => {
      try {
        const dataToSave = {
            id: 'clothingImage',
            base64: clothingImage.base64,
            mimeType: clothingImage.mimeType
        };
        await saveImageToDB(dataToSave);
      } catch (err) {
        console.error("Falha ao salvar a imagem da peça de roupa no IndexedDB", err);
        setError("Falha ao salvar a imagem da roupa. A imagem pode ser muito grande ou o armazenamento do navegador está cheio.");
      }
    };
    saveClothing();
  }, [clothingImage]);

  // Save background image to IndexedDB whenever it changes
  useEffect(() => {
    if (!backgroundImage) return;
      
    const saveBackground = async () => {
      try {
         const dataToSave = {
            id: 'backgroundImage',
            base64: backgroundImage.base64,
            mimeType: backgroundImage.mimeType
        };
        await saveImageToDB(dataToSave);
      } catch (err) {
        console.error("Falha ao salvar a imagem de fundo no IndexedDB", err);
        setError("Falha ao salvar a imagem de fundo. A imagem pode ser muito grande ou o armazenamento do navegador está cheio.");
      }
    };
    saveBackground();
  }, [backgroundImage]);

  const handleModelImageUpload = useCallback(async (file: File) => {
    try {
      setError(null);
      const { base64, mimeType } = await toBase64(file);
      setModelImage({ base64, mimeType });
      setIntermediateResultImage(null);
      setFinalImage(null);
    } catch (err) {
      setError('Falha ao carregar a imagem do modelo.');
      console.error(err);
    }
  }, []);

  const handleClothingImageUpload = useCallback(async (file: File) => {
    try {
      setError(null);
      const { base64, mimeType } = await toBase64(file);
      setClothingImage({ base64, mimeType });
      setIntermediateResultImage(null);
      setFinalImage(null);
    } catch (err) {
      setError('Falha ao carregar a imagem da peça de roupa.');
      console.error(err);
    }
  }, []);

  const handleBackgroundImageUpload = useCallback(async (file: File) => {
    try {
      setError(null);
      const { base64, mimeType } = await toBase64(file);
      setBackgroundImage({ base64, mimeType });
      setFinalImage(null);
    } catch (err) {
      setError('Falha ao carregar a imagem de fundo.');
      console.error(err);
    }
  }, []);
  
  const handleResetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  const handleResetProject = async () => {
    const confirmation = window.confirm("Você tem certeza que deseja limpar o projeto? Todas as imagens carregadas serão removidas.");
    if (confirmation) {
      setModelImage(null);
      setClothingImage(null);
      setBackgroundImage(null);
      setIntermediateResultImage(null);
      setFinalImage(null);
      setError(null);
      handleResetAdjustments();
      setRefinementPrompt('');
      setResetKey(prevKey => prevKey + 1);
      try {
        await clearDB();
      } catch (err) {
        console.error("Falha ao limpar o IndexedDB", err);
        setError("Não foi possível limpar os dados salvos.");
      }
    }
  };

  const handleGenerateLook = async () => {
    if (!apiKey) { setError('Por favor, configure sua chave de API do Gemini primeiro.'); return; }
    if (!modelImage || !clothingImage) {
      setError('Por favor, carregue a imagem do modelo e da peça de roupa.');
      return;
    }

    setIsLoading(true);
    setLoadingStep('look');
    setError(null);
    setIntermediateResultImage(null);
    setFinalImage(null);
    handleResetAdjustments();

    const selectedStyle = promptStyles.find(style => style.id === selectedStyleId);
    if (!selectedStyle) {
      setError("Estilo de prompt inválido selecionado.");
      setIsLoading(false);
      return;
    }

    try {
      const resultBase64 = await generateLook(
        apiKey,
        { data: modelImage.base64, mimeType: modelImage.mimeType },
        { data: clothingImage.base64, mimeType: clothingImage.mimeType },
        selectedStyle.promptStep1
      );
      setIntermediateResultImage(`data:image/png;base64,${resultBase64}`);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro desconhecido ao gerar o look.');
      }
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleCreateScene = async () => {
    if (!apiKey) { setError('Por favor, configure sua chave de API do Gemini primeiro.'); return; }
    if (!intermediateResultImage || !backgroundImage) {
      setError('Gere um look e carregue uma imagem de fundo primeiro.');
      return;
    }

    setIsLoading(true);
    setLoadingStep('scene');
    setError(null);
    setFinalImage(null);
    handleResetAdjustments();

    const selectedStyle = promptStyles.find(style => style.id === selectedStyleId);
     if (!selectedStyle) {
      setError("Estilo de prompt inválido selecionado.");
      setIsLoading(false);
      return;
    }

    const intermediateBase64 = intermediateResultImage.split(',')[1];

    try {
      const resultBase64 = await createScene(
        apiKey,
        { data: intermediateBase64, mimeType: 'image/png' },
        { data: backgroundImage.base64, mimeType: backgroundImage.mimeType },
        selectedStyle.promptStep2
      );
      setFinalImage(`data:image/png;base64,${resultBase64}`);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro desconhecido ao criar a cena.');
      }
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleRefineImage = async () => {
    if (!apiKey) { setError('Por favor, configure sua chave de API do Gemini primeiro.'); return; }
    if (!finalImage || !refinementPrompt) {
      setError('É necessário ter uma imagem final e uma instrução de refinamento.');
      return;
    }
    
    setIsLoading(true);
    setLoadingStep('refine');
    setError(null);
    
    const finalImageBase64 = finalImage.split(',')[1];

    try {
      const resultBase64 = await refineImage(
        apiKey,
        { data: finalImageBase64, mimeType: 'image/png' },
        refinementPrompt
      );
      setFinalImage(`data:image/png;base64,${resultBase64}`);
      setRefinementPrompt(''); // Limpa o prompt após o sucesso
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro desconhecido ao refinar a imagem.');
      }
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const isGenerateLookDisabled = !modelImage || !clothingImage || isLoading;
  const isCreateSceneDisabled = !intermediateResultImage || !backgroundImage || isLoading;
  const isRefineDisabled = !finalImage || !refinementPrompt.trim() || isLoading;

  // --- Conditional Rendering for API Key ---
  if (!apiKey) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Bem-vindo!</h2>
          <p className="text-center text-gray-600 mb-6">Para começar, por favor, insira sua chave de API do Google Gemini.</p>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => {
                setApiKeyInput(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Cole sua chave de API aqui"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
            <button
              onClick={handleApiKeySave}
              className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Salvar e Continuar
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Sua chave de API é salva apenas no seu navegador e nunca é enviada para nossos servidores.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onReset={handleResetProject} />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
          {/* Controls Panel */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Style Selector */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <PaletteIcon className="w-6 h-6 text-gray-500" />
                  Estilo de Geração
                </h2>
                <StyleSelector 
                  styles={promptStyles}
                  selectedStyleId={selectedStyleId}
                  onStyleChange={setSelectedStyleId}
                  disabled={isLoading}
                />
            </div>

            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Passo 1: Vestir a Modelo</h2>
              <div className="space-y-4">
                <ImageUploader
                  key={`model-${resetKey}`}
                  id="model-uploader"
                  label="Imagem do Modelo"
                  onFileSelect={handleModelImageUpload}
                  preview={modelImage?.base64 ? `data:${modelImage.mimeType};base64,${modelImage.base64}` : undefined}
                />
                <ImageUploader
                  key={`clothing-${resetKey}`}
                  id="clothing-uploader"
                  label="Peça de Roupa"
                  onFileSelect={handleClothingImageUpload}
                  preview={clothingImage?.base64 ? `data:${clothingImage.mimeType};base64,${clothingImage.base64}` : undefined}
                />
              </div>
               <button
                onClick={handleGenerateLook}
                disabled={isGenerateLookDisabled}
                className={`w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ${
                  isGenerateLookDisabled
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                <MagicWandIcon className="w-5 h-5" />
                <span>{isLoading && loadingStep === 'look' ? 'Gerando Look...' : 'Gerar Look'}</span>
              </button>
            </div>

            {/* Step 2 */}
            {intermediateResultImage && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 animate-fade-in">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Passo 2: Criar a Cena</h2>
                 <div className="space-y-4">
                    <ImageUploader
                      key={`background-${resetKey}`}
                      id="background-uploader"
                      label="Imagem de Fundo"
                      onFileSelect={handleBackgroundImageUpload}
                      preview={backgroundImage?.base64 ? `data:${backgroundImage.mimeType};base64,${backgroundImage.base64}` : undefined}
                    />
                 </div>
                 <button
                    onClick={handleCreateScene}
                    disabled={isCreateSceneDisabled}
                    className={`w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ${
                      isCreateSceneDisabled
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500'
                    }`}
                  >
                    <MagicWandIcon className="w-5 h-5" />
                    <span>{isLoading && loadingStep === 'scene' ? 'Criando Cena...' : 'Criar Cena'}</span>
                  </button>
              </div>
            )}
            
            {/* Step 3: Creative Refinement */}
            {finalImage && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 animate-fade-in">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <PaintBrushIcon className="w-6 h-6 text-gray-500" />
                  Passo 3: Refinamento Criativo
                </h2>
                <div className="space-y-4">
                  <textarea
                    value={refinementPrompt}
                    onChange={(e) => setRefinementPrompt(e.target.value)}
                    placeholder="Ex: close-up do rosto, mostrar a modelo de costas, focar na bolsa..."
                    className="w-full h-24 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleRefineImage}
                    disabled={isRefineDisabled}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ${
                      isRefineDisabled
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                    }`}
                  >
                    <MagicWandIcon className="w-5 h-5" />
                    <span>{isLoading && loadingStep === 'refine' ? 'Refinando...' : 'Refinar Imagem'}</span>
                  </button>
                </div>
              </div>
            )}


            {/* Adjustments Panel */}
            {finalImage && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Ajustes Finais</h2>
                  <button 
                      onClick={handleResetAdjustments}
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                      disabled={isLoading}
                  >
                      Redefinir
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                      <label htmlFor="brightness" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                          <SunIcon className="w-5 h-5 text-gray-500" /> Brilho: <span className="font-bold">{brightness}%</span>
                      </label>
                      <input
                          id="brightness"
                          type="range"
                          min="0"
                          max="200"
                          value={brightness}
                          onChange={(e) => setBrightness(Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          disabled={isLoading}
                      />
                  </div>
                  <div>
                      <label htmlFor="contrast" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                          <ContrastIcon className="w-5 h-5 text-gray-500" /> Contraste: <span className="font-bold">{contrast}%</span>
                      </label>
                      <input
                          id="contrast"
                          type="range"
                          min="0"
                          max="200"
                          value={contrast}
                          onChange={(e) => setContrast(Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          disabled={isLoading}
                      />
                  </div>
                  <div>
                      <label htmlFor="saturation" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                          <SaturationIcon className="w-5 h-5 text-gray-500" /> Saturação: <span className="font-bold">{saturation}%</span>
                      </label>
                      <input
                          id="saturation"
                          type="range"
                          min="0"
                          max="200"
                          value={saturation}
                          onChange={(e) => setSaturation(Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          disabled={isLoading}
                      />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Canvas Panel */}
          <div className="lg:col-span-8">
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-200 aspect-w-1 aspect-h-1 lg:aspect-w-3 lg:aspect-h-4 relative">
              {isLoading && <Loader />}
              {error && !isLoading && (
                 <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-80 z-20 rounded-xl p-4">
                    <p className="text-red-700 font-semibold text-center">{error}</p>
                 </div>
              )}
              <Canvas
                baseImage={modelImage ? `data:${modelImage.mimeType};base64,${modelImage.base64}` : null}
                generatedImage={finalImage || intermediateResultImage}
                isFinalImage={!!finalImage}
                brightness={brightness}
                contrast={contrast}
                saturation={saturation}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
