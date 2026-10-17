import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { productConfig } from "@/config/product";
import { CheckoutModal } from "@/components/CheckoutModal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle2,
  Lock,
  ShieldCheck,
  Zap,
  Clock,
  Target,
  FileText,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  Download,
  ExternalLink,
  Laptop,
  Check,
  Mail,
  HelpCircle,
  FileCheck,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${productConfig.name} — Página Oficial` },
      {
        name: "description",
        content: productConfig.subtitle,
      },
      { property: "og:title", content: productConfig.name },
      { property: "og:description", content: productConfig.subtitle },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SalesPage,
});


export function SalesPage() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDemoTab, setSelectedDemoTab] = useState(0);
  const iconMap = {
    Clock: Clock,
    Target: Target,
    FileText: FileText,
    Zap: Zap,
    Sparkles: Sparkles,
    ShieldCheck: ShieldCheck,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* 3.1 Barra Superior */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <a
            href="#"
            className="flex items-center gap-2.5 font-bold text-lg sm:text-xl tracking-tight text-slate-900 hover:opacity-90 transition"
          >
            <span className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
              GA
            </span>
            <span className="font-extrabold">{productConfig.name}</span>
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#beneficios" className="hover:text-emerald-600 transition">
              Benefícios
            </a>
            <a href="#incluso" className="hover:text-emerald-600 transition">
              O que está incluso
            </a>
            <a href="#demonstracao" className="hover:text-emerald-600 transition">
              Por dentro
            </a>
            <a href="#como-funciona" className="hover:text-emerald-600 transition">
              Como funciona
            </a>
            <a href="#faq" className="hover:text-emerald-600 transition">
              Dúvidas
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 hover:text-emerald-600 transition"
            >
              Entrar
            </Link>
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              <span>Quero Acessar</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline-block" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Abrir menu de navegação"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3 animate-in slide-in-from-top-2">
            <a
              href="#beneficios"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 hover:text-emerald-600 py-1"
            >
              Benefícios
            </a>
            <a
              href="#incluso"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 hover:text-emerald-600 py-1"
            >
              O que está incluso
            </a>
            <a
              href="#demonstracao"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 hover:text-emerald-600 py-1"
            >
              Por dentro do material
            </a>
            <a
              href="#como-funciona"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 hover:text-emerald-600 py-1"
            >
              Como funciona
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 hover:text-emerald-600 py-1"
            >
              Perguntas frequentes
            </a>
            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full text-center py-2.5 rounded-lg bg-emerald-600 text-white font-semibold text-sm shadow-sm"
              >
                Garantir Acesso • R$ {productConfig.price.toFixed(2).replace(".", ",")}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 3.2 Hero — Primeira Dobra */}
      <section className="pt-10 pb-16 sm:pt-16 sm:pb-24 px-4 sm:px-6 bg-gradient-to-b from-white via-white to-slate-50 border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-emerald-700">
            <span>Produto 100% Digital</span>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <span>Acesso Imediato</span>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <span>Sem Mensalidade</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
            {productConfig.headline}
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            {productConfig.subtitle}
          </p>

          <div className="pt-4 flex flex-col items-center justify-center gap-3">
            <div className="flex items-center gap-3">
              {productConfig.originalPrice && (
                <span className="text-slate-600 line-through text-base sm:text-lg font-medium">
                  R$ {productConfig.originalPrice.toFixed(2).replace(".", ",")}
                </span>
              )}
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-900">
                R$ {productConfig.price.toFixed(2).replace(".", ",")}
              </span>
              <span className="text-xs sm:text-sm text-slate-600 font-medium">pagamento único</span>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full sm:w-auto min-w-[280px] inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-lg shadow-sm hover:shadow-md transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              <span>Quero Meu Acesso Imediato</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 text-xs text-slate-600 mt-2">
              <span className="inline-flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                Checkout Seguro via Mercado Pago
              </span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Garantia de 7 Dias
              </span>
            </div>
          </div>

          <div className="pt-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 text-left">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">E-book Interativo (PDF)</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    64 páginas diagramadas para leitura em qualquer dispositivo. Passo a passo
                    prático para implementar seu foco diário.
                  </p>
                </div>

                <div className="space-y-3 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Dashboard Notion Pronto</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Duplique para sua conta gratuita do Notion em 1 clique. Visão diária, semanal e
                    acompanhamento de tarefas.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Planilhas & Checklists</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Planilhas para Google Sheets e Excel prontas com fórmulas automáticas, além de
                    checklists imprimíveis em folha A4.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.3 Problema e Solução */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              A rotina que te drena vs. O método simples que liberta
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              A maioria das pessoas tenta ser produtiva usando métodos complicados demais para a
              vida real.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-red-700 uppercase tracking-wider">
                <span>Dificuldades Comuns</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                O ciclo diário de exaustão e falta de clareza
              </h3>
              <ul className="space-y-3.5 text-sm text-slate-700">
                {productConfig.problemsSolved.map((prob, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✕
                    </span>
                    <span>{prob}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                <span>A Solução com o Kit</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Rotina leve, objetiva e com foco consistente
              </h3>
              <ul className="space-y-3.5 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Priorização sem estresse:</strong> identifique as 3 metas do dia em 10
                    minutos pela manhã.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Centralização total:</strong> anotações, tarefas e lembretes em um único
                    lugar fácil de consultar.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Execução por blocos:</strong> trabalhe em blocos de foco que evitam o
                    cansaço mental extremo.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Sensação real de dever cumprido:</strong> encerre o dia sabendo
                    exatamente o que foi avançado.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3.4 Benefícios */}
      <section
        id="beneficios"
        className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-50 border-b border-slate-200/80"
      >
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tudo o que você precisa para assumir o controle da sua rotina
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Ferramentas enxutas pensadas para economizar seu tempo, não para criar mais trabalho
              administrativo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productConfig.benefits.map((benefit) => {
              const IconComp = iconMap[benefit.icon] || Sparkles;
              return (
                <div
                  key={benefit.id}
                  className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-sm hover:border-emerald-200 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg leading-snug">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3.5 O que está incluído */}
      <section
        id="incluso"
        className="py-16 sm:py-24 px-4 sm:px-6 bg-white border-b border-slate-200/80"
      >
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              O que você recebe no pacote digital
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Acesso digital completo e vitalício aos arquivos e atualizações do material.
            </p>
          </div>

          <div className="space-y-4">
            {productConfig.includedItems.map((item, idx) => (
              <div
                key={item.id}
                className="bg-slate-50/70 rounded-xl border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                    0{idx + 1}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                        {item.title}
                      </h3>
                      {item.badge && (
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                      {item.description}
                    </p>
                    <div className="text-xs text-slate-600 font-medium pt-1">
                      Formato: {item.format} • {item.sizeOrDuration}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {productConfig.bonuses.length > 0 && (
              <div className="pt-6">
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">
                  Bônus Inclusos Gratuitamente
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {productConfig.bonuses.map((bonus) => (
                    <div
                      key={bonus.id}
                      className="bg-emerald-50/60 rounded-xl border border-emerald-100 p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-900 uppercase">
                          {bonus.format}
                        </span>
                        <span className="text-xs text-slate-600 font-medium">
                          Valor estimado: R$ {bonus.estimatedValue.toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{bonus.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{bonus.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3.6 Demonstração — Por dentro do material */}
      <section
        id="demonstracao"
        className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-50 border-b border-slate-200/80"
      >
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {productConfig.demoPreview.headline}
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              {productConfig.demoPreview.subheadline}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4 mb-6">
              {productConfig.demoPreview.items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDemoTab(idx)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                    selectedDemoTab === idx
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>

            {productConfig.demoPreview.items[selectedDemoTab] && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                    {productConfig.demoPreview.items[selectedDemoTab].category}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {productConfig.demoPreview.items[selectedDemoTab].title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {productConfig.demoPreview.items[selectedDemoTab].description}
                  </p>
                  <div className="space-y-2 pt-2">
                    {productConfig.demoPreview.items[selectedDemoTab].highlights.map((h, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700"
                      >
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 font-mono text-xs text-slate-600">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <span className="font-semibold text-slate-800">
                      visão_geral_{selectedDemoTab + 1}.preview
                    </span>
                    <span className="text-emerald-700 font-bold">100% pronto</span>
                  </div>
                  <div className="space-y-2 text-slate-600">
                    <div className="p-2.5 bg-white rounded border border-slate-200 flex justify-between">
                      <span>✓ 01. Bloco Matinal de Foco</span>
                      <span className="text-emerald-600 font-bold">90 min</span>
                    </div>
                    <div className="p-2.5 bg-white rounded border border-slate-200 flex justify-between">
                      <span>✓ 02. Tarefas Operacionais</span>
                      <span className="text-emerald-600 font-bold">45 min</span>
                    </div>
                    <div className="p-2.5 bg-white rounded border border-slate-200 flex justify-between">
                      <span>✓ 03. Revisão & Fechamento</span>
                      <span className="text-emerald-600 font-bold">15 min</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3.7 Como Funciona */}
      <section
        id="como-funciona"
        className="py-16 sm:py-24 px-4 sm:px-6 bg-white border-b border-slate-200/80"
      >
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Como funciona o acesso em 3 etapas simples
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Processo seguro, transparente e sem etapas confusas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-3 relative">
              <span className="text-3xl font-extrabold text-emerald-600 block">1</span>
              <h3 className="font-bold text-slate-900 text-lg">Informe seus dados</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Clique no botão de acesso e informe seu nome e e-mail para onde o kit e os acessos
                serão enviados.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-3 relative">
              <span className="text-3xl font-extrabold text-emerald-600 block">2</span>
              <h3 className="font-bold text-slate-900 text-lg">Pagamento Seguro</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pague via PIX ou Cartão no ambiente protegido do Mercado Pago, com confirmação
                imediata.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-3 relative">
              <span className="text-3xl font-extrabold text-emerald-600 block">3</span>
              <h3 className="font-bold text-slate-900 text-lg">Acesso Imediato</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Baixe os arquivos direto na tela de confirmação e receba uma cópia com todas as
                instruções no seu e-mail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3.8 Oferta e Preço */}
      <section
        id="oferta"
        className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-50 border-b border-slate-200/80"
      >
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl border-2 border-emerald-600 p-6 sm:p-10 shadow-lg space-y-8 relative overflow-hidden">
            <div className="space-y-3 text-center">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Acesso Vitalício ao Pacote Completo
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {productConfig.name}
              </h2>
              <p className="text-sm text-slate-600">
                Tudo o que você precisa para implementar seu sistema de organização pessoal hoje
                mesmo.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-200/80 space-y-1">
              {productConfig.originalPrice && (
                <div className="text-sm text-slate-600 line-through">
                  De R$ {productConfig.originalPrice.toFixed(2).replace(".", ",")} por
                </div>
              )}
              <div className="text-4xl sm:text-5xl font-extrabold text-emerald-900">
                R$ {productConfig.price.toFixed(2).replace(".", ",")}
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Pagamento único • {productConfig.installmentsText}
              </p>
              <p className="text-xs font-semibold text-emerald-700 pt-1">
                {productConfig.pixDiscountText}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                O que está incluso:
              </p>
              <ul className="space-y-2.5 text-sm text-slate-700">
                {productConfig.includedItems.map((item) => (
                  <li key={item.id} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>{item.title}:</strong> {item.format}
                    </span>
                  </li>
                ))}
                {productConfig.bonuses.map((bonus) => (
                  <li
                    key={bonus.id}
                    className="flex items-start gap-2.5 text-emerald-950 font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Bônus:</strong> {bonus.title} ({bonus.format})
                    </span>
                  </li>
                ))}
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Atualizações e suporte por e-mail</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Garantia incondicional de 7 dias com reembolso total</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-lg shadow-sm hover:shadow-md transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              >
                <span>Garantir Meu Acesso Agora</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-center gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                  Checkout Seguro Mercado Pago
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Risco Zero: 7 Dias de Teste
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.9 Sobre o Projeto & Metodologia (Sem falsos depoimentos) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white border-b border-slate-200/80">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Transparência & Metodologia
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Por que este material foi desenvolvido?
            </h2>
          </div>
          <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
            <p>
              A maioria dos cursos e aplicativos de produtividade no mercado peca pelo excesso:
              dezenas de horas de aulas teóricas e painéis tão complexos que a pessoa passa mais
              tempo organizando as ferramentas do que realmente produzindo.
            </p>
            <p>
              O <strong>Kit Gestão Ágil & Organização Diária</strong> nasceu como uma resposta
              direta a esse problema. Ele foi projetado para quem quer resolver sua organização sem
              complicação: você abre o material, gasta 15 minutos para entender a lógica e começa a
              aplicar no mesmo dia, usando ferramentas acessíveis que já estão instaladas no seu
              computador ou celular.
            </p>
          </div>
        </div>
      </section>

      {/* 3.10 Garantia e Segurança */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl font-bold text-slate-900">
              Garantia Incondicional de {productConfig.guaranteeDays} Dias
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Você tem 7 dias inteiros para explorar o e-book, duplicar o dashboard e testar as
              planilhas na sua rotina real. Se por qualquer motivo achar que o material não valeu o
              investimento, basta enviar um e-mail para{" "}
              <a
                href={`mailto:${productConfig.supportEmail}`}
                className="text-emerald-600 underline font-medium"
              >
                {productConfig.supportEmail}
              </a>{" "}
              e devolveremos 100% do seu dinheiro, sem perguntas e sem complicações.
            </p>
          </div>
        </div>
      </section>

      {/* 3.11 Perguntas Frequentes (FAQ) */}
      <section
        id="faq"
        className="py-16 sm:py-24 px-4 sm:px-6 bg-white border-b border-slate-200/80"
      >
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Perguntas Frequentes
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Tudo o que você precisa saber sobre o produto, entrega e pagamento.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {productConfig.faq.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-1 text-left"
              >
                <AccordionTrigger className="text-left font-semibold text-slate-900 hover:text-emerald-700 hover:no-underline py-4">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-slate-600 leading-relaxed pb-4 pt-1">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* 3.12 CTA Final */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Comece hoje a organizar suas prioridades com clareza
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Por apenas R$ {productConfig.price.toFixed(2).replace(".", ",")}, você recebe o kit
            completo com acesso vitalício e garantia total de 7 dias.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-lg shadow-sm hover:shadow transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <span>Quero Acessar o Material Agora</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <div className="text-xs text-slate-600 flex items-center justify-center gap-4 pt-2">
            <span>Acesso Digital Imediato</span>
            <span>•</span>
            <span>Mercado Pago Protegido</span>
            <span>•</span>
            <span>7 Dias de Garantia</span>
          </div>
        </div>
      </section>

      {/* 3.13 Rodapé */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 text-xs border-t border-slate-800">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-8 text-center sm:text-left">
            <div>
              <p className="font-bold text-slate-200 text-sm">{productConfig.sellerInfo.name}</p>
              <p className="text-slate-600 mt-1">{productConfig.sellerInfo.description}</p>
            </div>
            <div className="space-y-1 sm:text-right">
              <p className="text-slate-600">Suporte ao cliente:</p>
              <a
                href={`mailto:${productConfig.supportEmail}`}
                className="text-emerald-400 hover:underline"
              >
                {productConfig.supportEmail}
              </a>
              <p className="text-slate-600">{productConfig.sellerInfo.supportHours}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p>
              © {new Date().getFullYear()} {productConfig.sellerInfo.name}. Todos os direitos
              reservados.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/termos" className="hover:text-slate-200 transition">
                Termos de Uso
              </Link>
              <Link to="/privacidade" className="hover:text-slate-200 transition">
                Política de Privacidade
              </Link>
            </div>
          </div>

          <p className="text-slate-600 text-[11px] leading-relaxed text-center sm:text-left">
            Aviso Legal: Os resultados podem variar de pessoa para pessoa de acordo com a aplicação
            prática e disciplina diária. Este site não possui vínculo institucional direto com o
            Mercado Pago nem com as ferramentas mencionadas (Notion, Microsoft, Google), que são
            marcas registradas de seus respectivos proprietários.
          </p>
        </div>
      </footer>

      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </div>
  );
}
