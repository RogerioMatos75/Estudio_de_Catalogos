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
    promptStep1: `Tarefa: Prova Virtual de Moda.

Receberá duas imagens: uma modelo e uma peça de roupa. Sua única missão é vestir a modelo com a peça de roupa da forma mais fotorrealista possível. Preste atenção ao caimento, dobras do tecido, textura e como a roupa se molda ao corpo. O fundo deve ser neutro e limpo. O resultado final deve ser APENAS a imagem da modelo vestida.`,
    promptStep2: `Tarefa: Composição de Cena de Moda.

Receberá duas imagens: uma modelo já vestida (imagem principal) e um cenário de fundo. Sua missão é recortar a modelo da imagem principal e integrá-la perfeitamente ao cenário de fundo. Harmonize a iluminação, sombras e perspectiva para que a modelo pareça pertencer naturalmente à cena. O resultado final deve ser APENAS a imagem da cena composta.`,
  },
  {
    id: 'fashion-week',
    name: 'Fashion Week',
    description: 'Visual de passarela com iluminação e poses dramáticas.',
    icon: SparklesIcon,
    promptStep1: `Tarefa: Look de Passarela de Alta Costura.

Receberá uma modelo e uma peça de roupa. Sua missão é transformar a modelo, vestindo-a com a roupa para um desfile de moda de luxo. Crie um visual dramático, com iluminação de passarela intensa (luz e sombra marcadas). A pose da modelo deve ser forte e confiante. O fundo deve ser simples, como o de um desfile. O resultado final deve ser APENAS a imagem da modelo no look de passarela.`,
    promptStep2: `Tarefa: Composição de Cena de Desfile.

Receberá duas imagens: uma modelo em um look de passarela (imagem principal) e um cenário de fundo de um evento de moda. Sua missão é integrar a modelo ao cenário, fazendo-a parecer a estrela do desfile. Intensifique a iluminação para combinar com as luzes do evento, adicione sombras realistas no chão e ajuste a perspectiva para uma foto de ação. O resultado final deve ser APENAS a imagem da cena do desfile.`,
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Estilo de revista, com composição artística e conceitual.',
    icon: BookOpenIcon,
    promptStep1: `Tarefa: Fotografia de Moda Editorial.

Receberá uma modelo e uma peça de roupa. Sua missão é criar uma imagem de arte conceitual, vestindo a modelo com a roupa. O estilo deve ser etéreo e artístico, não apenas comercial. Pense em uma capa de revista de moda alternativa. Brinque com texturas e formas de maneira criativa. O fundo deve ser abstrato ou minimalista, complementando o conceito. O resultado final deve ser APENAS a imagem da modelo em estilo editorial.`,
    promptStep2: `Tarefa: Composição de Arte Editorial.

Receberá duas imagens: uma modelo em estilo editorial (imagem principal) e um fundo artístico/abstrato. Sua missão é fundir as duas imagens em uma única peça de arte coesa. Não se limite a apenas colar a modelo; integre-a de forma criativa. Use a iluminação, as cores e as texturas do fundo para influenciar a modelo, talvez com sobreposições sutis ou reflexos. O resultado final deve ser APENAS a imagem da composição artística final.`,
  },
];
