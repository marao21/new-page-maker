import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { productConfig } from "../config/product";
import {
  ShieldCheck,
  Lock,
  AlertCircle,
  ArrowRight,
  Loader2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unconfiguredInfo, setUnconfiguredInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setUnconfiguredInfo(null);

    if (!name.trim()) {
      setErrorMessage("Por favor, informe seu nome completo.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Por favor, informe um endereço de e-mail válido para entrega.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/checkout/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          cpf: cpf.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        // Redireciona para o checkout seguro do Mercado Pago
        window.location.href = data.checkoutUrl;
      } else if (data.configured === false) {
        setUnconfiguredInfo(
          data.message ||
            "O checkout do Mercado Pago está aguardando as credenciais no arquivo .env (MERCADO_PAGO_ACCESS_TOKEN).",
        );
      } else {
        setErrorMessage(data.message || "Não foi possível iniciar o checkout. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro ao chamar API de checkout:", err);
      setErrorMessage(
        "Erro de conexão ao iniciar o checkout. Verifique sua internet e tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-white border border-slate-200 sm:rounded-2xl shadow-xl">
        {/* Header do Modal */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-5">
          <div className="flex items-center gap-2 text-violet-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Ambiente Seguro • Mercado Pago</span>
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Acesso ao {productConfig.name}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 mt-1">
            Preencha seus dados para prosseguir ao pagamento e receber o acesso imediato.
          </DialogDescription>
        </div>

        <div className="p-6 space-y-6">
          {/* Resumo do Pedido */}
          <div className="bg-violet-50/60 rounded-xl p-4 border border-violet-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                Produto selecionado
              </p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{productConfig.name}</p>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Liberação imediata pós-confirmação</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-600 block line-through">
                {productConfig.originalPrice
                  ? `R$ ${productConfig.originalPrice.toFixed(2).replace(".", ",")}`
                  : ""}
              </span>
              <span className="text-2xl font-extrabold text-violet-900">
                R$ {productConfig.price.toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>

          {/* Aviso quando Mercado Pago ainda não está configurado */}
          {unconfiguredInfo && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-semibold text-amber-950">Configuração de Pagamento Pendente</p>
                  <p className="text-xs leading-relaxed text-amber-800">{unconfiguredInfo}</p>
                  <div className="text-xs font-mono bg-white/80 p-2 rounded border border-amber-200 text-amber-950">
                    MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...
                  </div>
                  <p className="text-xs text-amber-800">
                    Nenhum pagamento fictício foi simulado. Adicione o token no seu ambiente para
                    ativar o checkout real com PIX e Cartão.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mensagem de Erro Geral */}
          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Formulário de Identificação */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="customer-name"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Nome Completo *
              </label>
              <input
                id="customer-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Lucas Mendes"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition"
              />
            </div>

            <div>
              <label
                htmlFor="customer-email"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                E-mail para Envio do Acesso *
              </label>
              <input
                id="customer-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition"
              />
              <p className="text-xs text-slate-600 mt-1">
                Certifique-se de digitar corretamente: o link do material será enviado para cá.
              </p>
            </div>

            <div>
              <label
                htmlFor="customer-cpf"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                CPF (Opcional — agiliza a emissão do PIX)
              </label>
              <input
                id="customer-cpf"
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition"
              />
            </div>

            {/* Botão de Ação */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold text-base shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Conectando ao Mercado Pago...</span>
                  </>
                ) : (
                  <>
                    <span>Ir para Pagamento Seguro</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Informações de Segurança */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100 gap-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Garantia legal de 7 dias</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span>PIX imediato ou Cartão</span>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
