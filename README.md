<div align="center">
  <img alt="Banner do Estúdio de Catálogos AI" src="assets/Modelo_Redes_Sociais.jpg" />
</div>

# Estúdio de Catálogos AI

Bem-vindo ao **Estúdio de Catálogos AI**, uma aplicação web inovadora que utiliza o poder da IA generativa do Google Gemini para criar imagens de catálogo de moda de alta qualidade.

Este projeto permite que usuários combinem imagens de modelos, peças de roupa e fundos para gerar cenas de moda completas e profissionais, prontas para serem usadas em e-commerce, redes sociais e campanhas de marketing.

## ✨ Principais Funcionalidades

- **Geração de Looks com IA:** Vista modelos virtualmente com diferentes peças de roupa.
- **Criação de Cenas:** Insira o modelo vestido em um ambiente ou fundo de sua escolha.
- **Refinamento Criativo:** Dê instruções em texto para ajustar e refinar a imagem final.
- **Ajustes de Imagem:** Controle brilho, contraste e saturação para o acabamento perfeito.
- **Segurança em Primeiro Lugar:** Sua chave de API do Gemini é armazenada de forma segura apenas no seu navegador (`localStorage`), garantindo que ela nunca seja exposta.
- **Interface Intuitiva:** Um fluxo de trabalho passo a passo que guia o usuário do início ao fim.

## 🚀 Tecnologias Utilizadas

- **Frontend:** [React](https://react.dev/) e [Vite](https://vitejs.dev/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **IA Generativa:** [Google Gemini API](https://ai.google.dev/)

## ⚙️ Como Começar (Desenvolvimento Local)

Siga os passos abaixo para executar o projeto em sua máquina local.

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Uma [chave de API do Google Gemini](https://ai.google.dev/).

### Instalação e Execução

1.  **Instale as dependências:**
    ```bash
    npm install
    ```

2.  **Execute a aplicação:**
    ```bash
    npm run dev
    ```
    O aplicativo estará disponível em `http://localhost:5173` (ou em outra porta, se a 5173 estiver em uso).

3.  **Configure sua Chave de API:**
    Ao abrir o aplicativo pela primeira vez, você verá uma tela solicitando sua chave de API do Gemini. Cole sua chave e clique em "Salvar e Continuar". A chave será armazenada localmente no seu navegador para sessões futuras.

## 📖 Como Usar

1.  **Passo 1: Vestir a Modelo**
    - Faça o upload da imagem de uma modelo.
    - Faça o upload da imagem de uma peça de roupa.
    - Clique em **Gerar Look**.

2.  **Passo 2: Criar a Cena**
    - Após o look ser gerado, faça o upload de uma imagem de fundo.
    - Clique em **Criar Cena**.

3.  **Passo 3: Refinamento Criativo**
    - Com a cena final gerada, use o campo de texto para dar instruções de ajuste (ex: "close-up no rosto", "mudar a cor do céu para azul claro").
    - Clique em **Refinar Imagem**.

## 🚀 Deploy

Este projeto está configurado para deploy contínuo na [Vercel](https://vercel.com/). Qualquer `push` para a branch principal (`main`) irá automaticamente acionar um novo build e deploy da aplicação.

---
*Este README foi aprimorado com a ajuda do Gemini.*