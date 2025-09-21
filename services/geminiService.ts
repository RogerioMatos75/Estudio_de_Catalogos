// FIX: Import Modality for use in generateContent config and remove unused safety-related imports.
import { GoogleGenAI, type GenerateContentResponse, type Part, Modality } from "@google/genai";

type ImageData = { data: string; mimeType: string };

/**
 * Função auxiliar genérica para chamar a API Gemini com um conjunto de imagens e um prompt.
 * Lida com a construção da solicitação, chamada da API e análise robusta da resposta.
 * @param apiKey A chave de API do Gemini do usuário.
 * @param images Um array de objetos de imagem para incluir na solicitação.
 * @param prompt A instrução de texto para a IA.
 * @returns Uma promessa que resolve com a string base64 da imagem gerada.
 */
const callGeminiWithImages = async (apiKey: string, images: ImageData[], prompt: string): Promise<string> => {
  // Cria a instância do GoogleGenAI dinamicamente com a chave de API fornecida.
  const ai = new GoogleGenAI({ apiKey });

  try {
    const imageParts: Part[] = images.map(image => ({
      inlineData: { data: image.data, mimeType: image.mimeType },
    }));

    const textPart: Part = { text: prompt };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: { parts: [...imageParts, textPart] },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      if (response.promptFeedback?.blockReason) {
        throw new Error(`A solicitação foi bloqueada pela IA. Motivo: ${response.promptFeedback.blockReason}. Tente ajustar as imagens ou o texto.`);
      }
      throw new Error("A API retornou uma resposta inesperadamente vazia. Verifique as imagens de entrada.");
    }

    const candidate = response.candidates[0];

    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
        let reasonMessage = `Motivo: ${candidate.finishReason}.`;
        if (candidate.finishReason === 'SAFETY') {
            reasonMessage = "A geração foi interrompida por violar as políticas de segurança.";
            console.error("Detalhes de segurança:", candidate.safetyRatings);
        }
        throw new Error(`A IA não conseguiu concluir a tarefa. ${reasonMessage}`);
    }

    if (!candidate.content?.parts || candidate.content.parts.length === 0) {
        const finishDetails = `Motivo do término: ${candidate.finishReason || 'Desconhecido'}. Detalhes: Nenhum detalhe adicional.`;
        throw new Error(`A IA não retornou conteúdo válido. ${finishDetails}`);
    }

    const imagePart = candidate.content.parts.find(part => part.inlineData?.data);

    if (imagePart?.inlineData) {
      return imagePart.inlineData.data;
    }

    const textResponse = candidate.content.parts
      .filter(part => part.text)
      .map(part => part.text)
      .join(' ')
      .trim();

    if (textResponse) {
      throw new Error(`A IA respondeu com texto em vez de uma imagem: "${textResponse}"`);
    }

    throw new Error("A imagem gerada não foi encontrada na resposta da API. A resposta não continha uma imagem válida.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error) {
      throw error; 
    }
    throw new Error("Falha na comunicação com a API Gemini.");
  }
};


/**
 * Etapa 1: Envia a imagem do modelo e da roupa para a IA para criar um "look".
 */
export const generateLook = (
  apiKey: string,
  modelImage: ImageData,
  clothingImage: ImageData,
  prompt: string
): Promise<string> => {
  return callGeminiWithImages(apiKey, [modelImage, clothingImage], prompt);
};

/**
 * Etapa 2: Envia a imagem do look gerado e uma imagem de fundo para criar a cena final.
 */
export const createScene = (
  apiKey: string,
  dressedModelImage: ImageData,
  backgroundImage: ImageData,
  prompt: string
): Promise<string> => {
  return callGeminiWithImages(apiKey, [dressedModelImage, backgroundImage], prompt);
};

/**
 * Etapa 3: Envia a imagem final e um novo prompt para refiná-la.
 */
export const refineImage = (
  apiKey: string,
  baseImage: ImageData,
  prompt: string
): Promise<string> => {
  return callGeminiWithImages(apiKey, [baseImage], prompt);
};

// --- Função de Validação Corrigida ---

type ValidationResult = {
  valid: boolean;
  message?: string;
};

/**
 * Valida uma chave de API do Gemini fazendo uma chamada de teste de baixo custo.
 * @param apiKey A chave de API a ser validada.
 * @returns Uma promessa que resolve com um objeto contendo o status de validade e uma mensagem.
 */
export const validateApiKey = async (apiKey: string): Promise<ValidationResult> => {
  try {
    if (!apiKey || !apiKey.startsWith('AIza')) {
      return { valid: false, message: 'Formato de chave de API inválido.' };
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Usa o método generateContent que sabemos que funciona, com um modelo de texto para um teste leve.
    await ai.models.generateContent({
        model: "gemini-1.5-flash-latest",
        contents: { parts: [{ text: "health check" }] },
    });

    return { valid: true };

  } catch (error: any) {
    console.error("API Key Validation Error:", error);

    const errorMessage = error.toString();

    if (errorMessage.includes('API key not valid')) {
      return { valid: false, message: 'Chave de API inválida. Verifique a chave e tente novamente.' };
    }
    
    if (error.status === 'RESOURCE_EXHAUSTED' || errorMessage.includes('quota')) {
      return { 
        valid: false, 
        message: 'Cota de uso da chave de API esgotada. Tente novamente mais tarde ou verifique seu plano no Google.' 
      };
    }

    return { valid: false, message: 'Não foi possível validar a chave de API. Verifique a conexão com a internet e a chave fornecida.' };
  }
};
