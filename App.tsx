import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { Canvas } from './components/Canvas';
import { Loader } from './components/Loader';
import { MagicWandIcon } from './components/icons/MagicWandIcon';
import type { ImageFile } from './types';
import { generateLook, createScene, refineImage, validateApiKey } from './services/geminiService';
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
  const [isVerifyingKey, setIsVerifyingKey] = useState<boolean>(false);

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

  const handleApiKeySave = async () => {
    setError(null);
    const trimmedKey = apiKeyInput.trim();

    if (!trimmedKey) {
      setError("Por favor, insira uma chave de API.");
      return;
    }

    setIsVerifyingKey(true);
    try {
      const validationResult = await validateApiKey(trimmedKey);
      if (validationResult.valid) {
        setApiKey(trimmedKey);
        localStorage.setItem('geminiApiKey', trimmedKey);
      } else {
        setError(validationResult.message || "Ocorreu um erro desconhecido ao validar a chave.");
      }
    } catch (err) {
        setError("Falha ao conectar com o serviço de validação.");
    } finally {
      setIsVerifyingKey(false);
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

  // ... (rest of the useEffects for saving images remain the same)

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
      setRefinementPrompt('');
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

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-indigo-200 flex items-center justify-center p-4">
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
              disabled={isVerifyingKey}
            />
            <button
              onClick={handleApiKeySave}
              disabled={isVerifyingKey}
              className={`w-full flex justify-center items-center bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isVerifyingKey ? 'cursor-not-allowed bg-indigo-400' : ''
              }`}>
              {isVerifyingKey ? 'Verificando...' : 'Salvar e Continuar'}
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-indigo-200">
      <Header onReset={handleResetProject} />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
          {/* ... (rest of the JSX is the same) ... */}
        </div>
      </main>
    </div>
  );
}