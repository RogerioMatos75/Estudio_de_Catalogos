// FIX: Import Modality for use in generateContent config and remove unused safety-related imports.
import { GoogleGenAI, type GenerateContentResponse, type Part, Modality } from "@google/genai";

if (!import.meta.env.VITE_GEMINI_API_KEY) {
  throw new Error("A variável de ambiente VITE_GEMINI_API_KEY não está definida. Crie um arquivo .env.local e adicione a linha VITE_GEMINI_API_KEY=SUA_CHAVE_API");
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

type ImageData = { data: string; mimeType: string };

/**
 * Função auxiliar genérica para chamar a API Gemini com um conjunto de imagens e um prompt.
 * Lida com a construção da solicitação, chamada da API e análise robusta da resposta.
 * @param images Um array de objetos de imagem para incluir na solicitação.
 * @param prompt A instrução de texto para a IA.
 * @returns Uma promessa que resolve com a string base64 da imagem gerada.
 */
const callGeminiWithImages = async (images: ImageData[], prompt: string): Promise<string> => {
  try {
    const imageParts: Part[] = images.map(image => ({
      inlineData: { data: image.data, mimeType: image.mimeType },
    }));

    const textPart: Part = { text: prompt };

    // FIX: Resolved compilation error by moving API parameters into the 'config' object.
    // Switched to the 'gemini-2.5-flash-image-preview' model, which is recommended for image editing tasks.
    // Per guidelines for this model, removed 'safetySettings' and added the required 'responseModalities'
    // parameter to ensure an image is returned.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: { parts: [...imageParts, textPart] },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    // 1. Verificação primária da resposta: há candidatos?
    if (!response.candidates || response.candidates.length === 0) {
      if (response.promptFeedback?.blockReason) {
        throw new Error(`A solicitação foi bloqueada pela IA. Motivo: ${response.promptFeedback.blockReason}. Tente ajustar as imagens ou o texto.`);
      }
      throw new Error("A API retornou uma resposta inesperadamente vazia. Verifique as imagens de entrada.");
    }

    const candidate = response.candidates[0];

    // 2. Verificar se a geração foi interrompida por um motivo específico (e não por sucesso).
    // O motivo 'STOP' é normal para uma conclusão bem-sucedida, então o tratamos como sucesso por enquanto.
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
        let reasonMessage = `Motivo: ${candidate.finishReason}.`;
        if (candidate.finishReason === 'SAFETY') {
            reasonMessage = "A geração foi interrompida por violar as políticas de segurança.";
            console.error("Detalhes de segurança:", candidate.safetyRatings);
        }
        throw new Error(`A IA não conseguiu concluir a tarefa. ${reasonMessage}`);
    }

    // 3. Verificar se o conteúdo e as partes existem. Este é o ponto crítico do erro anterior.
    if (!candidate.content?.parts || candidate.content.parts.length === 0) {
        const finishDetails = `Motivo do término: ${candidate.finishReason || 'Desconhecido'}. Detalhes: Nenhum detalhe adicional.`;
        throw new Error(`A IA não retornou conteúdo válido. ${finishDetails}`);
    }

    // 4. Procurar pela parte da imagem na resposta.
    const imagePart = candidate.content.parts.find(part => part.inlineData?.data);

    if (imagePart?.inlineData) {
      return imagePart.inlineData.data;
    }

    // 5. Se não encontrou uma imagem, verificar se a IA respondeu com texto.
    const textResponse = candidate.content.parts
      .filter(part => part.text)
      .map(part => part.text)
      .join(' ')
      .trim();

    if (textResponse) {
      throw new Error(`A IA respondeu com texto em vez de uma imagem: "${textResponse}"`);
    }

    // 6. Se não encontrou nem imagem nem texto, é um estado de erro final e inesperado.
    throw new Error("A imagem gerada não foi encontrada na resposta da API. A resposta não continha uma imagem válida.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error) {
      // Re-lança o erro com a mensagem já formatada
      throw error; 
    }
    // Fallback para erros não-padrão
    throw new Error("Falha na comunicação com a API Gemini.");
  }
};


/**
 * Etapa 1: Envia a imagem do modelo e da roupa para a IA para criar um "look".
 */
export const generateLook = (
  modelImage: ImageData,
  clothingImage: ImageData,
  prompt: string
): Promise<string> => {
  return callGeminiWithImages([modelImage, clothingImage], prompt);
};

/**
 * Etapa 2: Envia a imagem do look gerado e uma imagem de fundo para criar a cena final.
 */
export const createScene = (
  dressedModelImage: ImageData,
  backgroundImage: ImageData,
  prompt: string
): Promise<string> => {
  return callGeminiWithImages([dressedModelImage, backgroundImage], prompt);
};

/**
 * Etapa 3: Envia a imagem final e um novo prompt para refiná-la.
 */
export const refineImage = (
  baseImage: ImageData,
  prompt: string
): Promise<string> => {
  return callGeminiWithImages([baseImage], prompt);
};