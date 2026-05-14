interface PageMetadata {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
}

const PAGE_METADATA: Record<string, PageMetadata> = {
  '/': {
    title: 'Academia dos Números - Plataforma Educacional de Matemática',
    description: 'Plataforma educacional interativa para ensinar multiplicação, divisão e leitura de horas. Aprenda matemática de forma divertida com o assistente virtual Arquimedes.',
    keywords: 'matemática, educação, tabuada, multiplicação, aprendizado infantil, plataforma educacional',
    ogImage: 'https://via.placeholder.com/1200x630/4F46E5/FFFFFF?text=Academia+dos+N%C3%BAmeros'
  },
  '/tabuadas': {
    title: 'Tabuadas Individuais - Academia dos Números',
    description: 'Aprenda as tabuadas individuais de multiplicação de forma interativa. Escolha a tabuada desejada e domine cada operação.',
    keywords: 'tabuada, multiplicação, educação matemática, prática interativa',
    ogImage: 'https://via.placeholder.com/1200x630/3B82F6/FFFFFF?text=Tabuadas+Individuais'
  },
  '/divisao': {
    title: 'Tabuadas de Divisão - Academia dos Números',
    description: 'Domine a divisão através de exercícios interativos. Aprenda a dividir números e conquiste o desafio matemático.',
    keywords: 'divisão, operações matemáticas, educação, prática interativa',
    ogImage: 'https://via.placeholder.com/1200x630/3B82F6/FFFFFF?text=Divis%C3%A3o'
  },
  '/simulado': {
    title: 'Desafio Cronometrado - Quiz Matemático',
    description: 'Teste seus conhecimentos em um desafio cronometrado de matemática. Resolva operações contra o relógio e veja seu desempenho.',
    keywords: 'quiz, desafio, matemática, teste de conhecimento, cronometrado',
    ogImage: 'https://via.placeholder.com/1200x630/8B5CF6/FFFFFF?text=Desafio+Cronometrado'
  },
  '/relogio': {
    title: 'Aprenda Horas - Leitura de Relógio',
    description: 'Aprenda a ler e entender horas digitalmente. Exercícios interativos para dominar a leitura de relógio.',
    keywords: 'relógio, horas, leitura de tempo, educação temporal',
    ogImage: 'https://via.placeholder.com/1200x630/06B6D4/FFFFFF?text=Aprenda+Horas'
  },
  '/adicao': {
    title: 'Adição - Tabuadas de Soma',
    description: 'Domine a adição através de tabuadas interativas. Pratique somas e construa uma base sólida em matemática.',
    keywords: 'adição, soma, tabuada, operações matemáticas, educação',
    ogImage: 'https://via.placeholder.com/1200x630/10B981/FFFFFF?text=Adi%C3%A7%C3%A3o'
  },
  '/subtracao': {
    title: 'Subtração - Tabuadas de Subtração',
    description: 'Aprenda subtração de forma interativa. Pratique tabuadas de subtração e fortaleça suas habilidades matemáticas.',
    keywords: 'subtração, operações matemáticas, tabuada, educação matemática',
    ogImage: 'https://via.placeholder.com/1200x630/EF4444/FFFFFF?text=Subtra%C3%A7%C3%A3o'
  },
  '/contagem': {
    title: 'Contagem - Aprendizado Numérico Básico',
    description: 'Desenvolva habilidades de contagem através de exercícios interativos. Perfeito para aprendizado inicial de números.',
    keywords: 'contagem, números, aprendizado básico, educação infantil',
    ogImage: 'https://via.placeholder.com/1200x630/F59E0B/FFFFFF?text=Contagem'
  },
  '/calculadora': {
    title: 'Calculadora IA - Cálculos Sem Limite',
    description: 'Calculadora inteligente com IA para resolver qualquer cálculo matemático. Aprenda enquanto calcula.',
    keywords: 'calculadora, matemática, IA, cálculos, operações matemáticas',
    ogImage: 'https://via.placeholder.com/1200x630/D97706/FFFFFF?text=Calculadora+IA'
  },
  '/not-found': {
    title: 'Página Não Encontrada - Academia dos Números',
    description: 'A página que você procura não existe. Retorne à página inicial para continuar aprendendo.',
    keywords: 'erro 404, página não encontrada',
    ogImage: 'https://via.placeholder.com/1200x630/6B7280/FFFFFF?text=P%C3%A1gina+N%C3%A3o+Encontrada'
  }
};

export function updateMetaTags(pathname: string): void {
  const metadata = PAGE_METADATA[pathname] || PAGE_METADATA['/'];

  // Update title
  document.title = metadata.title;

  // Update or create meta tags
  updateOrCreateMetaTag('name', 'description', metadata.description);
  updateOrCreateMetaTag('name', 'keywords', metadata.keywords);
  updateOrCreateMetaTag('property', 'og:title', metadata.title);
  updateOrCreateMetaTag('property', 'og:description', metadata.description);
  updateOrCreateMetaTag('property', 'og:image', metadata.ogImage);
  updateOrCreateMetaTag('name', 'twitter:title', metadata.title);
  updateOrCreateMetaTag('name', 'twitter:description', metadata.description);
  updateOrCreateMetaTag('name', 'twitter:image', metadata.ogImage);

  // Update canonical URL
  const canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (canonicalLink) {
    canonicalLink.href = `${window.location.origin}${pathname}`;
  }
}

function updateOrCreateMetaTag(attributeName: 'name' | 'property', attributeValue: string, content: string): void {
  let tag = document.querySelector(`meta[${attributeName}="${attributeValue}"]`) as HTMLMetaElement;

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attributeName, attributeValue);
    document.head.appendChild(tag);
  }

  tag.content = content;
}

export function getPageMetadata(pathname: string): PageMetadata {
  return PAGE_METADATA[pathname] || PAGE_METADATA['/'];
}
