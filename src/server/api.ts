import {
  createCheckoutPreference,
  handleMercadoPagoWebhook,
  isMercadoPagoConfigured,
} from "./mercadopago";
import { getOrderById } from "./orders";
import { productConfig } from "../config/product";

export async function handleApiRoute(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;

  // 1. Checkout status
  if (path === "/api/checkout/status" && request.method === "GET") {
    return new Response(
      JSON.stringify({
        configured: isMercadoPagoConfigured(),
        price: productConfig.price,
        productName: productConfig.name,
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // 2. Create Checkout Preference
  if (path === "/api/checkout/create-preference" && request.method === "POST") {
    try {
      const body = (await request.json()) as { name?: string; email?: string; cpf?: string };

      if (!body.name || !body.email) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Nome e e-mail são obrigatórios para a emissão do pedido.",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Por favor, informe um endereço de e-mail válido.",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const baseUrl = `${url.protocol}//${url.host}`;
      const result = await createCheckoutPreference({
        name: body.name,
        email: body.email,
        cpf: body.cpf,
        baseUrl,
      });

      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("[API] Erro ao criar preferência:", err);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Erro interno ao gerar sessão de pagamento.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }

  // 3. Webhook Mercado Pago
  if (path === "/api/webhook/mercadopago") {
    try {
      const queryParams: Record<string, string> = {};
      url.searchParams.forEach((val, key) => {
        queryParams[key] = val;
      });

      let body: Record<string, unknown> | null = null;
      if (request.method === "POST") {
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          body = null;
        }
      }

      const webhookResult = await handleMercadoPagoWebhook(queryParams, body);

      return new Response(JSON.stringify(webhookResult), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("[API] Erro no webhook Mercado Pago:", err);
      return new Response(JSON.stringify({ handled: false, error: "Erro no webhook." }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // 4. Get order details
  if (path.startsWith("/api/orders/") && request.method === "GET") {
    const orderId = path.replace("/api/orders/", "").split("/")[0];
    if (!orderId) {
      return new Response(JSON.stringify({ error: "ID do pedido não informado." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const order = getOrderById(orderId);
    if (!order) {
      return new Response(JSON.stringify({ error: "Pedido não encontrado." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Only return downloadable links if the order status is approved!
    const isApproved = order.status === "approved";

    return new Response(
      JSON.stringify({
        id: order.id,
        status: order.status,
        amount: order.amount,
        currency: order.currency,
        customerName: order.customer.name,
        customerEmail: order.customer.email,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
        isApproved,
        digitalAccess: isApproved
          ? {
              instructions: productConfig.deliveryInstructions,
              items: productConfig.includedItems.map((item) => ({
                id: item.id,
                title: item.title,
                format: item.format,
                downloadUrl: item.downloadUrl,
              })),
            }
          : null,
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return null;
}
