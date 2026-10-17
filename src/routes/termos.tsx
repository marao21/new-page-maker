import { createFileRoute, Link } from "@tanstack/react-router";
import { productConfig } from "@/config/product";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: `Termos de Uso — ${productConfig.name}` },
      { name: "description", content: "Termos de uso e condições gerais da oferta." },
      { property: "og:title", content: `Termos de Uso — ${productConfig.name}` },
      { property: "og:description", content: "Termos de uso e condições gerais da oferta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

export function TermsPage() {
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Termos de Uso</h1>
          <p className="text-xs text-slate-600">
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed space-y-6">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Natureza do Produto</h2>
            <p>
              O <strong>{productConfig.name}</strong> é um produto exclusivamente digital composto
              por materiais didáticos, templates e planilhas eletrônicas. Não há envio de nenhum
              item físico pelos Correios ou transportadora. O acesso é disponibilizado
              eletronicamente após a confirmação do pagamento.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Licença de Uso Individual</h2>
            <p>
              A aquisição confere ao comprador uma licença pessoal, intransferível e não exclusiva
              para uso individual do conteúdo. É estritamente proibida a reprodução pública,
              revenda, compartilhamento em massa ou distribuição não autorizada dos arquivos.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Processamento de Pagamento</h2>
            <p>
              Os pagamentos são processados com segurança por meio da plataforma Mercado Pago. Não
              armazenamos nem temos acesso a dados de cartão de crédito.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">
              4. Política de Garantia e Reembolso
            </h2>
            <p>
              Em conformidade com o Artigo 49 do Código de Defesa do Consumidor brasileiro, o
              cliente dispõe de <strong>{productConfig.guaranteeDays} dias corridos</strong> a
              partir da data da compra para solicitar o cancelamento e devolução total dos valores
              pagos, bastando enviar uma solicitação para o e-mail de suporte:{" "}
              <strong>{productConfig.supportEmail}</strong>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">5. Contato e Suporte</h2>
            <p>
              Dúvidas adicionais sobre estes termos ou suporte ao uso do material devem ser
              encaminhadas para{" "}
              <a
                href={`mailto:${productConfig.supportEmail}`}
                className="text-violet-600 underline"
              >
                {productConfig.supportEmail}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
