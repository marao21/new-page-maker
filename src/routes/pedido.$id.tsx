import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { productConfig } from "@/config/product";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  ExternalLink,
  ArrowLeft,
  Mail,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

interface OrderData {
  id: string;
  status: "pending" | "approved" | "rejected" | "refunded" | "cancelled";
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  paidAt?: string;
  isApproved: boolean;
  digitalAccess?: {
    instructions: string;
    items: Array<{
      id: string;
      title: string;
      format: string;
      downloadUrl?: string;
    }>;
  };
}

export const Route = createFileRoute("/pedido/$id")({
  head: () => ({
    meta: [
      { title: `Seu pedido — ${productConfig.name}` },
      { name: "description", content: "Consulte o andamento do seu pedido." },
      { property: "og:title", content: `Seu pedido — ${productConfig.name}` },
      { property: "og:description", content: "Consulte o andamento do seu pedido." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrderStatusPage,
});

export function OrderStatusPage() {
  const { id } = useParams({ from: "/pedido/$id" });
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(
    async (isManual = false) => {
      if (isManual) setRefreshing(true);
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) {
          throw new Error("Pedido não encontrado ou expirado.");
        }
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar pedido.");
      } finally {
        setLoading(false);
        if (isManual) setRefreshing(false);
      }
    },
    [id],
  );

  useEffect(() => {
    fetchOrder();

    // Auto poll every 5s if order is pending
    const interval = setInterval(() => {
      setOrder((current) => {
        if (current && current.status === "pending") {
          fetchOrder();
        }
        return current;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchOrder]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Top Link */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-violet-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para a página inicial</span>
          </Link>
          <span className="text-xs text-slate-600 font-mono">Pedido #{id}</span>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
            <RefreshCw className="w-8 h-8 text-violet-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-700">
              Consultando status do pedido no Mercado Pago...
            </p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-200 p-8 text-center space-y-4 shadow-sm">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">Pedido não encontrado</h2>
            <p className="text-sm text-slate-600">{error}</p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 transition"
            >
              Ir para a página de vendas
            </Link>
          </div>
        ) : order?.status === "approved" ? (
          /* STATUS: APROVADO — LIBERAÇÃO DO MATERIAL */
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-emerald-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    Pagamento Confirmado
                  </span>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    Seu acesso foi liberado com sucesso!
                  </h1>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Olá, <strong>{order.customerName}</strong>! Confirmamos seu pagamento de{" "}
                <strong>R$ {order.amount.toFixed(2).replace(".", ",")}</strong> via Mercado Pago.
                Seus arquivos digitais estão disponíveis para download logo abaixo e também foram
                enviados para o e-mail:{" "}
                <span className="font-semibold text-slate-800">{order.customerEmail}</span>.
              </p>
            </div>

            {/* Downloads e Acessos */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Seus Materiais para Download</h2>

              <div className="space-y-3">
                {productConfig.includedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {item.format} • {item.sizeOrDuration}
                      </p>
                    </div>

                    <a
                      href={item.downloadUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Acessar Arquivo</span>
                    </a>
                  </div>
                ))}
              </div>

              {/* Instruções de Uso */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <h3 className="font-bold text-sm text-slate-900">Como começar em 3 passos:</h3>
                <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-4 leading-relaxed">
                  <li>Baixe o Manual Estratégico em PDF para entender os 3 blocos de foco.</li>
                  <li>
                    Abra o link do Notion e clique no botão <strong>"Duplicar"</strong> no canto
                    superior direito.
                  </li>
                  <li>Importe a planilha para seu Google Drive ou abra no Microsoft Excel.</li>
                </ol>
              </div>
            </div>

            {/* Suporte & Garantia */}
            <div className="bg-slate-100/70 rounded-xl p-5 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Garantia de 7 dias com suporte prioritário</span>
              </div>
              <a
                href={`mailto:${productConfig.supportEmail}`}
                className="text-violet-700 hover:underline font-semibold flex items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{productConfig.supportEmail}</span>
              </a>
            </div>
          </div>
        ) : (
          /* STATUS: PENDENTE OU AGUARDANDO */
          <div className="bg-white rounded-2xl border border-amber-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Aguardando Confirmação
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Processando seu pagamento
                </h1>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Estamos aguardando a confirmação do Mercado Pago para liberar o seu acesso ao{" "}
              <strong>{productConfig.name}</strong>.
            </p>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-700 space-y-2">
              <p>
                <strong>Tempo médio de aprovação:</strong>
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>
                  <strong>PIX:</strong> Geralmente liberado em até 1 minuto após o pagamento.
                </li>
                <li>
                  <strong>Cartão de Crédito:</strong> Geralmente aprovado instantaneamente ou em
                  poucos minutos pela operadora.
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => fetchOrder(true)}
                disabled={refreshing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-semibold text-sm transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                <span>Verificar status agora</span>
              </button>

              <Link to="/" className="text-xs font-medium text-slate-600 hover:text-slate-900">
                Voltar à página inicial
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
