import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { productConfig } from "../config/product";
import {
  createOrder,
  markOrderPaid,
  updateOrderPreference,
  updateOrderStatus,
  getOrderById,
} from "./orders";

let mpConfig: MercadoPagoConfig | null = null;

export function getMercadoPagoClient(): MercadoPagoConfig | null {
  const token = process.env['MERCADO_PAGO_ACCESS_TOKEN']?.trim();
  if (!token) return null;

  if (!mpConfig) {
    mpConfig = new MercadoPagoConfig({
      accessToken: token,
      options: {
        timeout: 10000,
      },
    });
  }
  return mpConfig;
}

export function isMercadoPagoConfigured(): boolean {
  return Boolean(process.env['MERCADO_PAGO_ACCESS_TOKEN']?.trim());
}

export interface CreateCheckoutInput {
  name: string;
  email: string;
  cpf?: string | undefined;
  baseUrl: string;
}

export interface CreateCheckoutResult {
  success: boolean;
  configured: boolean;
  orderId?: string;
  checkoutUrl?: string;
  message?: string;
}

export async function createCheckoutPreference(
  input: CreateCheckoutInput,
): Promise<CreateCheckoutResult> {
  const client = getMercadoPagoClient();

  // Create order in server store first
  const order = createOrder({
    name: input.name,
    email: input.email,
    cpf: input.cpf,
  });

  if (!client) {
    console.warn(
      "[Mercado Pago] MERCADO_PAGO_ACCESS_TOKEN não está definido. O checkout está desativado com segurança.",
    );
    return {
      success: false,
      configured: false,
      orderId: order.id,
      message:
        "O Mercado Pago ainda não foi configurado neste ambiente. Para habilitar pagamentos reais (PIX e Cartão), adicione MERCADO_PAGO_ACCESS_TOKEN nas variáveis de ambiente (.env).",
    };
  }

  try {
    const preference = new Preference(client);
    const cleanBaseUrl = input.baseUrl.replace(/\/+$/, "");

    const preferenceResponse = await preference.create({
      body: {
        items: [
          {
            id: productConfig.id,
            title: productConfig.name,
            quantity: 1,
            unit_price: Number(productConfig.price.toFixed(2)),
            currency_id: "BRL",
            description: productConfig.description.slice(0, 200),
          },
        ],
        payer: {
          name: order.customer.name,
          email: order.customer.email,
          ...(input.cpf
            ? { identification: { type: "CPF", number: input.cpf.replace(/\D/g, "") } }
            : {}),
        },
        back_urls: {
          success: `${cleanBaseUrl}/pedido/${order.id}?status=success`,
          pending: `${cleanBaseUrl}/pedido/${order.id}?status=pending`,
          failure: `${cleanBaseUrl}/pedido/${order.id}?status=failure`,
        },
        auto_return: "approved",
        notification_url: `${cleanBaseUrl}/api/webhook/mercadopago`,
        external_reference: order.id,
        statement_descriptor: "GESTAO AGIL",
        payment_methods: {
          excluded_payment_types: [{ id: "ticket" }], // Remove boleto bancário tradicional para focar em PIX e Cartão
          installments: 3,
        },
      },
    });

    const initPoint = preferenceResponse.init_point || preferenceResponse.sandbox_init_point;
    if (!initPoint || !preferenceResponse.id) {
      throw new Error("Resposta inválida do Mercado Pago ao criar preferência.");
    }

    updateOrderPreference(order.id, preferenceResponse.id);

    return {
      success: true,
      configured: true,
      orderId: order.id,
      checkoutUrl: initPoint,
    };
  } catch (error) {
    console.error("[Mercado Pago] Erro ao criar preferência:", error);
    const errMessage =
      error instanceof Error ? error.message : "Erro desconhecido ao processar pagamento.";
    return {
      success: false,
      configured: true,
      orderId: order.id,
      message: `Erro na comunicação com o Mercado Pago: ${errMessage}`,
    };
  }
}

export interface WebhookResult {
  handled: boolean;
  orderId?: string;
  status?: string;
  message: string;
}

export async function handleMercadoPagoWebhook(
  query: Record<string, string>,
  body: Record<string, unknown> | null | undefined,
): Promise<WebhookResult> {
  const client = getMercadoPagoClient();
  if (!client) {
    return {
      handled: false,
      message: "Webhook recebido mas MERCADO_PAGO_ACCESS_TOKEN não está configurado.",
    };
  }

  // Mercado Pago sends notifications either via query params (?topic=payment&id=123 or ?type=payment&data.id=123)
  // or via JSON body ({ type: 'payment', data: { id: '123' } } or { topic: 'payment', resource: '...' })
  const bodyData = body?.['data'] as { id?: string | number } | undefined;
  const bodyResource = typeof body?.['resource'] === "string" ? body['resource'] : undefined;

  const paymentId = bodyData?.id
    ? String(bodyData.id)
    : query["data.id"] || query['id'] || (bodyResource ? bodyResource.split("/").pop() : undefined);

  const topic =
    (typeof body?.['type'] === "string" ? body['type'] : undefined) ||
    query['type'] ||
    (typeof body?.['topic'] === "string" ? body['topic'] : undefined) ||
    query['topic'];

  if (!paymentId || (topic && topic !== "payment")) {
    return {
      handled: true,
      message: `Notificação ignorada (tópico: ${topic || "desconhecido"}).`,
    };
  }

  try {
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    if (!paymentData) {
      return {
        handled: false,
        message: `Pagamento ${paymentId} não encontrado na API do Mercado Pago.`,
      };
    }

    const orderId = paymentData.external_reference;
    if (!orderId) {
      return {
        handled: false,
        message: `Pagamento ${paymentId} não possui external_reference correspondente.`,
      };
    }

    const order = getOrderById(orderId);
    if (!order) {
      return { handled: false, message: `Pedido ${orderId} não encontrado no sistema.` };
    }

    // Verify amount and currency
    const paidAmount = Number(paymentData.transaction_amount);
    const expectedAmount = Number(order.amount.toFixed(2));

    // Allow minor floating point difference
    if (Math.abs(paidAmount - expectedAmount) > 0.05) {
      console.warn(
        `[Mercado Pago Webhook] Valor divergente para pedido ${orderId}: pago ${paidAmount}, esperado ${expectedAmount}`,
      );
      return { handled: false, message: "Valor do pagamento não confere com o pedido." };
    }

    if (paymentData.status === "approved") {
      markOrderPaid(orderId, String(paymentId), paymentData.payment_method_id);
      console.log(`[Mercado Pago Webhook] Pedido ${orderId} aprovado com sucesso!`);
      return {
        handled: true,
        orderId,
        status: "approved",
        message: "Pagamento aprovado e produto liberado.",
      };
    } else if (paymentData.status === "rejected" || paymentData.status === "cancelled") {
      updateOrderStatus(
        orderId,
        paymentData.status === "rejected" ? "rejected" : "cancelled",
        String(paymentId),
      );
      return {
        handled: true,
        orderId,
        status: paymentData.status,
        message: `Status atualizado para ${paymentData.status}.`,
      };
    } else {
      updateOrderStatus(orderId, "pending", String(paymentId));
      return {
        handled: true,
        orderId,
        status: "pending",
        message: `Pagamento ainda pendente (${paymentData.status}).`,
      };
    }
  } catch (error) {
    console.error(`[Mercado Pago Webhook] Erro ao consultar pagamento ${paymentId}:`, error);
    return {
      handled: false,
      message: error instanceof Error ? error.message : "Erro ao processar webhook.",
    };
  }
}
