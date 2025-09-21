import type { ImageFile } from '../types';

const DB_NAME = 'ClothingStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'images';

// Uma variável para manter a conexão com o banco de dados.
// Isso evita que precisemos nos reconectar em cada operação.
let db: IDBDatabase;

/**
 * Abre uma conexão com o banco de dados IndexedDB.
 * Se a conexão já estiver aberta, retorna a conexão existente.
 * Também lida com a criação e atualizações do banco de dados.
 * @returns Uma promessa que resolve com a conexão IDBDatabase.
 */
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    // Se a conexão com o banco de dados já estiver aberta, resolva com ela imediatamente.
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject('Erro ao abrir o IndexedDB. Seu navegador pode estar em modo privado ou com o armazenamento desativado.');
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    /**
     * Este evento é acionado apenas se a versão do banco de dados mudar,
     * ou se o banco de dados for criado pela primeira vez.
     * Usamos isso para configurar o esquema do banco de dados.
     */
    request.onupgradeneeded = (event) => {
      const tempDb = (event.target as IDBOpenDBRequest).result;
      // Cria um object store se ele ainda não existir.
      // Usamos 'id' como o keyPath.
      if (!tempDb.objectStoreNames.contains(STORE_NAME)) {
        tempDb.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

/**
 * Salva uma imagem no armazenamento do IndexedDB. Ele usa 'put' para inserir um novo registro
 * ou atualizar um existente.
 * @param image O objeto da imagem a ser salvo, que deve incluir um 'id'.
 * @returns Uma promessa que é resolvida quando o salvamento é bem-sucedido.
 */
export const saveImageToDB = async (image: ImageFile & { id: string }): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.put(image);
    request.onsuccess = () => resolve();
    request.onerror = () => {
        console.error('Erro ao salvar a imagem no DB:', request.error);
        reject('Não foi possível salvar a imagem no banco de dados.');
    }
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

/**
 * Recupera uma imagem do armazenamento do IndexedDB pelo seu ID.
 * @param id O ID da imagem a ser recuperada ('modelImage' ou 'clothingImage').
 * @returns Uma promessa que resolve com o objeto ImageFile ou nulo se não for encontrado.
 */
export const getImageFromDB = async (id: string): Promise<ImageFile | null> => {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, 'readonly');
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null); // request.result é indefinido se não for encontrado
    request.onerror = () => {
        console.error('Erro ao obter a imagem do DB:', request.error);
        reject('Não foi possível recuperar a imagem do banco de dados.');
    }
  });
};

/**
 * Limpa todos os dados do object store de imagens.
 * @returns Uma promessa que é resolvida quando o armazenamento é limpo com sucesso.
 */
export const clearDB = async (): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => {
          console.error('Erro ao limpar o DB:', request.error);
          reject('Não foi possível limpar o banco de dados.');
      }
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
};