export interface BenefitItem {
  id: string;
  title: string;
  description: string;
  icon: "Zap" | "ShieldCheck" | "Clock" | "Sparkles" | "FileText" | "Target";
}

export interface IncludedItem {
  id: string;
  title: string;
  format: string;
  description: string;
  sizeOrDuration: string;
  badge?: string;
  downloadUrl?: string;
}

export interface BonusItem {
  id: string;
  title: string;
  format: string;
  description: string;
  estimatedValue: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ProductConfig {
  id: string;
  name: string;
  headline: string;
  subtitle: string;
  description: string;
  tagline: string;
  coverImage: string;
  price: number;
  originalPrice?: number;
  currency: "BRL";
  installmentsText: string;
  pixDiscountText?: string;
  targetAudience: string[];
  problemsSolved: string[];
  benefits: BenefitItem[];
  includedItems: IncludedItem[];
  bonuses: BonusItem[];
  faq: FaqItem[];
  supportEmail: string;
  deliveryInstructions: string;
  refundPolicy: string;
  guaranteeDays: number;
  checkoutEnabled: boolean;
  checkoutUrl?: string; // Para checkout externo se aplicável
  sellerInfo: {
    name: string;
    description: string;
    supportHours: string;
  };
  demoPreview: {
    headline: string;
    subheadline: string;
    items: Array<{
      title: string;
      category: string;
      description: string;
      highlights: string[];
    }>;
  };
}

export const productConfig: ProductConfig = {
  id: "prod_produtividade_2026",
  name: "Kit Gestão Ágil & Organização Diária",
  tagline: "Produto 100% Digital • Acesso Imediato",
  headline: "Elimine o caos diário e conquiste foco absoluto sem métodos complicados",
  subtitle:
    "Um sistema prático e minimalista para organizar tarefas, rotina e prioridades em menos de 15 minutos por dia. Desenvolvido para profissionais, estudantes e criadores que precisam de clareza mental e execução consistente.",
  description:
    "O Kit Gestão Ágil & Organização Diária reúne ferramentas prontas para uso: guia estratégico em PDF, templates personalizáveis no Notion, planilhas automatizadas e checklists de execução rápida. Sem teorias cansativas, direto ao que funciona no mundo real.",
  coverImage: "/favicon.ico",
  price: 29.9,
  originalPrice: 79.9,
  currency: "BRL",
  installmentsText: "ou até 3x de R$ 10,50 no cartão",
  pixDiscountText: "Acesso liberado imediatamente no PIX",
  targetAudience: [
    "Profissionais que se sentem sobrecarregados com excesso de demandas",
    "Estudantes e concurseiros que precisam de planejamento consistente",
    "Empreendedores e freelancers que precisam gerenciar múltiplos projetos",
    "Qualquer pessoa cansada de métodos de produtividade pesados e difíceis de manter",
  ],
  problemsSolved: [
    "Sensação constante de estar ocupado o dia todo sem ver progresso real",
    "Procrastinação causada pela falta de clareza sobre qual tarefa executar primeiro",
    "Perda de prazos e anotações espalhadas em dezenas de cadernos e abas do navegador",
    "Cansaço mental ao final do dia sem saber onde as horas foram investidas",
  ],
  benefits: [
    {
      id: "b1",
      title: "Planejamento Diário em 10 Minutos",
      description:
        "Estrutura enxuta para definir seus 3 objetivos diários prioritários antes de abrir e-mails e redes sociais.",
      icon: "Clock",
    },
    {
      id: "b2",
      title: "Clareza Mental Imediata",
      description:
        "Técnica de descarrego mental com categorias inteligentes para você nunca mais esquecer compromissos importantes.",
      icon: "Target",
    },
    {
      id: "b3",
      title: "Templates Prontos para Uso",
      description:
        "Basta duplicar e começar a usar. Compatível com Notion gratuito, Google Planilhas e impressão física.",
      icon: "FileText",
    },
    {
      id: "b4",
      title: "Sem Dependência de Ferramentas Pagas",
      description:
        "Tudo foi projetado para funcionar em versões gratuitas ou no formato que você preferir usar no seu dia a dia.",
      icon: "Zap",
    },
    {
      id: "b5",
      title: "Execução Rápida e Sustentável",
      description:
        "Feito para se adaptar à sua rotina real, e não para forçar você a seguir rotinas milagrosas irreais.",
      icon: "Sparkles",
    },
    {
      id: "b6",
      title: "Garantia Total de 7 Dias",
      description:
        "Se o material não for útil e prático para sua rotina, solicite o reembolso integral com apenas um e-mail.",
      icon: "ShieldCheck",
    },
  ],
  includedItems: [
    {
      id: "inc_1",
      title: "Manual Estratégico: Gestão Ágil Pessoal",
      format: "E-book PDF Interativo (64 páginas)",
      description:
        "Guia completo e diagramado explicando passo a passo como implementar o sistema de blocos de foco, triagem de tarefas e rotina semanal.",
      sizeOrDuration: "PDF • 8.4 MB",
      badge: "Guia Principal",
      downloadUrl: "/downloads/manual-gestao-agil.pdf",
    },
    {
      id: "inc_2",
      title: "Template Central de Produtividade no Notion",
      format: "Template Notion (1 clique para duplicar)",
      description:
        "Dashboard com visão diária, semanal e mensal, controle de projetos, repositório de notas e rastreador de hábitos integrado.",
      sizeOrDuration: "Link Notion Duplicável",
      badge: "Template Pronto",
      downloadUrl: "https://notion.so",
    },
    {
      id: "inc_3",
      title: "Planilha de Controle de Hábitos & Metas Trimestrais",
      format: "Google Planilhas & Microsoft Excel (.xlsx)",
      description:
        "Planilha automatizada com gráficos de progresso visual, cálculo de consistência semanal e painel de metas.",
      sizeOrDuration: "Planilha .xlsx e Google Sheets",
      badge: "Automatizada",
      downloadUrl: "/downloads/planilha-habitos-metas.xlsx",
    },
    {
      id: "inc_4",
      title: "Checklists de Rotina Matinal e Encerramento Diário",
      format: "PDF Imprimível + Versão Digital",
      description:
        "Folhas práticas prontas para impressão ou preenchimento em tablets para iniciar o dia focado e encerrar sem pendências na cabeça.",
      sizeOrDuration: "PDF A4 pronto para imprimir",
      downloadUrl: "/downloads/checklists-rotina.pdf",
    },
  ],
  bonuses: [
    {
      id: "bon_1",
      title: "Guia Rápido: Gestão de E-mails & Caixa de Entrada Zero",
      format: "Miniguia em PDF",
      description:
        "Filtros e automações para manter seu e-mail sob controle sem perder mensagens cruciais.",
      estimatedValue: 27.0,
    },
    {
      id: "bon_2",
      title: "Áudio Exclusivo: O Método dos 3 Blocos Diários",
      format: "Áudio MP3 (18 minutos)",
      description:
        "Áudio guiado direto ao ponto para ouvir antes de começar sua jornada de trabalho semanal.",
      estimatedValue: 29.0,
    },
  ],
  faq: [
    {
      question: "O que exatamente vou receber após a confirmação do pagamento?",
      answer:
        "Você recebe acesso imediato à área de download contendo o Manual Estratégico em PDF de alta qualidade, o link oficial para duplicar o Dashboard no Notion em 1 clique, as planilhas para Google Planilhas e Excel (.xlsx), os checklists em PDF para impressão e os bônus inclusos.",
    },
    {
      question: "Como funciona o pagamento via Mercado Pago?",
      answer:
        "O pagamento é processado diretamente pelo Mercado Pago, uma das plataformas de pagamentos mais seguras e consolidadas da América Latina. Você pode pagar via PIX (com liberação imediata) ou cartão de crédito em até 3x.",
    },
    {
      question: "Como e quando receberei o acesso?",
      answer:
        "Assim que o pagamento for confirmado (no PIX isso ocorre em poucos segundos), a página de confirmação exibe na tela todos os links e downloads do produto. Simultaneamente, enviamos um e-mail com as instruções completas para o endereço informado no momento da compra.",
    },
    {
      question: "Preciso pagar mensalidade ou assinar algum software?",
      answer:
        "Não! O valor do kit é de pagamento único, sem nenhuma mensalidade ou cobrança recorrente. Todas as ferramentas utilizadas (Notion, Google Planilhas, leitor de PDF) possuem versões totalmente gratuitas.",
    },
    {
      question: "Preciso ter conhecimento avançado em tecnologia ou no Notion?",
      answer:
        "De forma alguma. O material foi desenvolvido com foco em simplicidade máxima. Você recebe um tutorial em passos simples mostrando exatamente onde clicar para começar a utilizar em menos de 5 minutos.",
    },
    {
      question: "Como funciona a garantia incondicional de 7 dias?",
      answer:
        "Conforme previsto no Artigo 49 do Código de Defesa do Consumidor, você tem 7 dias corridos a partir da compra para avaliar todo o conteúdo. Se achar que o material não atendeu suas expectativas, basta enviar um e-mail para o suporte e devolveremos 100% do valor pago, sem questionamentos ou burocracia.",
    },
    {
      question: "Como entro em contato se tiver dúvidas ou precisar de suporte?",
      answer:
        "Nosso suporte ao cliente está disponível através do e-mail oficial informado no rodapé desta página e na área de entrega. Respondemos todas as solicitações em até 24 horas úteis.",
    },
  ],
  supportEmail: "suporte@gestaoagil.com.br",
  deliveryInstructions:
    "Após a aprovação do seu pagamento, você terá acesso imediato aos arquivos digitais para download na tela de confirmação e receberá uma cópia com todas as instruções no seu e-mail cadastrado.",
  refundPolicy:
    "Garantia incondicional de 7 dias. Solicite o cancelamento e reembolso integral diretamente por e-mail dentro do prazo legal de 7 dias após a compra.",
  guaranteeDays: 7,
  checkoutEnabled: true,
  sellerInfo: {
    name: "Gestão Ágil Conteúdo Digital",
    description:
      "Publicação independente de guias práticos, sistemas de organização e ferramentas digitais para produtividade consciente.",
    supportHours: "Segunda a Sexta, das 09h às 18h (Horário de Brasília)",
  },
  demoPreview: {
    headline: "Veja por dentro do material",
    subheadline:
      "Tudo pronto para aplicar. Veja uma prévia da organização prática que você terá em mãos:",
    items: [
      {
        title: "Manual Estratégico em PDF",
        category: "E-book & Metodologia",
        description:
          "Diagramação limpa e didática dividida em 4 módulos fundamentais: Clareza, Priorização, Execução em Blocos e Revisão Semanal.",
        highlights: [
          "Leitura rápida e objetiva (aprox. 45 min)",
          "Exemplos práticos de rotinas diárias",
          "Protocolo antibloqueio e antifadiga mental",
        ],
      },
      {
        title: "Dashboard Integrado no Notion",
        category: "Template Digital",
        description:
          "Estrutura testada e refinada para gerenciar sua vida profissional e pessoal sem atritos.",
        highlights: [
          "Visão 'Hoje': foco nas 3 tarefas essenciais",
          "Caixa de entrada para ideias e lembretes rápidos",
          "Kanban de projetos com datas e status",
        ],
      },
      {
        title: "Planilha de Hábitos e Metas",
        category: "Planilha Automatizada",
        description:
          "Acompanhe o desenvolvimento de novos hábitos e metas trimestrais com gráficos automáticos.",
        highlights: [
          "Compatível com Google Sheets e Excel",
          "Calculadora de consistência automática",
          "Zero fórmulas complexas para configurar",
        ],
      },
    ],
  },
};
