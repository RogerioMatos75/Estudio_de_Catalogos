import React from 'react';
import { CameraIcon } from './components/icons/CameraIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { BookOpenIcon } from './components/icons/BookOpenIcon';

export interface PromptStyle {
  id: string;
  name: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  promptStep1: string;
  promptStep2: string;
}

export const promptStyles: PromptStyle[] = [
  {
    id: 'realistic',
    name: 'Realista',
    description: 'Foco em e-commerce, com resultado fiel à realidade.',
    icon: CameraIcon,
    promptStep1: `Instrução: Vista a modelo (imagem 1) com a roupa (imagem 2).
Requisitos:
- O resultado deve ser fotorrealista.
- Preserve o caimento, dobras e textura do tecido no corpo da modelo.
- O fundo da imagem gerada deve ser branco e neutro, estilo estúdio.
- A saída deve ser somente a imagem, sem nenhum texto.`,
    promptStep2: `Instrução: Coloque a modelo vestida (imagem 1) no cenário de fundo (imagem 2).
Requisitos:
- Integre a modelo ao cenário de forma realista.
- Harmonize iluminação, sombras e perspectiva.
- A saída deve ser somente a imagem da cena composta, sem nenhum texto.`,
  },
  {
    id: 'fashion-week',
    name: 'Fashion Week',
    description: 'Visual de passarela com iluminação e poses dramáticas.',
    icon: SparklesIcon,
    promptStep1: `Instrução: Vista a modelo (imagem 1) com a roupa (imagem 2) para um desfile.
Requisitos:
- O visual deve ser dramático, de alta costura.
- A iluminação deve ser intensa, com luz e sombra marcadas (estilo passarela).
- A pose da modelo deve ser forte e confiante.
- O fundo deve ser simples, de desfile.
- A saída deve ser somente a imagem, sem nenhum texto.`,
    promptStep2: `Instrução: Coloque a modelo (imagem 1) no cenário de desfile (imagem 2).
Requisitos:
- Integre a modelo como a estrela do desfile.
- A iluminação na modelo deve combinar com as luzes do cenário.
- Adicione sombras realistas no chão.
- A saída deve ser somente a imagem da cena, sem nenhum texto.`,
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Estilo de revista, com composição artística e conceitual.',
    icon: BookOpenIcon,
    promptStep1: `Instrução: Vista a modelo (imagem 1) com a roupa (imagem 2).
Requisitos:
- Crie uma imagem de arte conceitual, estilo editorial de revista.
- O estilo deve ser etéreo e artístico, não comercial.
- O fundo deve ser abstrato ou minimalista para complementar o conceito.
- A saída deve ser somente a imagem, sem nenhum texto.`,
    promptStep2: `Instrução: Funda a imagem da modelo (imagem 1) com o fundo artístico (imagem 2).
Requisitos:
- Crie uma composição artística e coesa.
- Integre a modelo ao fundo de forma criativa, usando sobreposições, cores e texturas.
- O resultado não deve ser uma simples colagem.
- A saída deve ser somente a imagem da composição final, sem nenhum texto.`,
  },
];
