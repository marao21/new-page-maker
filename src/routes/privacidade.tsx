import { createFileRoute, Link } from "@tanstack/react-router";
import { productConfig } from "@/config/product";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: `Política de Privacidade — ${productConfig.name}` },
      { name: "description", content: "Política de privacidade e proteção de dados." },
      { property: "og:title", content: `Política de Privacidade — ${productConfig.name}` },
      { property: "og:description", content: "Política de privacidade e proteção de dados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-violet-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a página inicial</span>
        </Link>

        <div className="space-y-2 border-b border-slate-100 pb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Política de Privacidade
          </h1>
          <p className="text-xs text-slate-600">
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed space-y-6">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Coleta de Dados Mínimos</h2>
            <p>
              Coletamos exclusivamente os dados necessários para o processamento do pedido e entrega
              do produto digital: seu nome completo e endereço de e-mail. Caso opcionalmente
              fornecido para agilizar a emissão de PIX no Mercado Pago, o CPF é transmitido de forma
              criptografada para o gateway.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Finalidade do Tratamento</h2>
            <p>
              Os dados coletados têm por finalidade exclusiva: emitir o comprovante do pedido,
              enviar os links de acesso ao material digital, prestar suporte técnico pós-venda e
              cumprir exigências legais e fiscais. Não vendemos, alugamos nem compartilhamos seus
              dados com terceiros para fins de marketing.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Segurança e Pagamentos</h2>
            <p>
              O processamento do pagamento é terceirizado para o Mercado Pago, que atua em
              conformidade com o padrão internacional de segurança PCI-DSS. Nosso servidor não tem
              acesso a dados confidenciais de cartões de crédito.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Direitos do Titular (LGPD)</h2>
            <p>
              Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você pode
              solicitar a qualquer momento a confirmação, correção ou exclusão de seus dados
              pessoais entrando em contato com nosso encarregado através do e-mail:{" "}
              <strong>{productConfig.supportEmail}</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
