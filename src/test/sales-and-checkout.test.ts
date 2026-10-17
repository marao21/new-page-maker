import { describe, expect, it } from "vitest";
import { productConfig } from "@/config/product";
import { createOrder, getOrderById, markOrderPaid, updateOrderStatus } from "@/server/orders";
import { createCheckoutPreference, isMercadoPagoConfigured } from "@/server/mercadopago";

describe("Sales Page & Product Configuration", () => {
  it("has valid low-ticket product pricing and currency", () => {
    expect(productConfig.name).toBeTruthy();
    expect(productConfig.price).toBeGreaterThan(0);
    expect(productConfig.price).toBeLessThan(100); // Low-ticket constraint
    expect(productConfig.currency).toBe("BRL");
    expect(productConfig.guaranteeDays).toBeGreaterThanOrEqual(7);
  });

  it("has complete and practical deliverables without placeholder values", () => {
    expect(productConfig.includedItems.length).toBeGreaterThan(0);
    for (const item of productConfig.includedItems) {
      expect(item.title).toBeTruthy();
      expect(item.format).toBeTruthy();
      expect(item.description).toBeTruthy();
    }
    expect(productConfig.faq.length).toBeGreaterThanOrEqual(5);
  });
});

describe("Orders & Server-Authoritative Data Layer", () => {
  it("creates order with price strictly derived from product config", () => {
    const order = createOrder({
      name: "Cliente Teste",
      email: "cliente@teste.com",
    });

    expect(order.id).toBeTruthy();
    expect(order.amount).toBe(productConfig.price);
    expect(order.currency).toBe("BRL");
    expect(order.status).toBe("pending");
    expect(order.customer.email).toBe("cliente@teste.com");

    const retrieved = getOrderById(order.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(order.id);
  });

  it("handles payment approval idempotently", () => {
    const order = createOrder({
      name: "Lucas Teste",
      email: "lucas@teste.com",
    });

    const firstMark = markOrderPaid(order.id, "pay_123456", "pix");
    expect(firstMark?.alreadyPaid).toBe(false);
    expect(firstMark?.order.status).toBe("approved");
    expect(firstMark?.order.mercadoPagoPaymentId).toBe("pay_123456");

    // Second webhook / notification must be recognized as already paid
    const secondMark = markOrderPaid(order.id, "pay_123456", "pix");
    expect(secondMark?.alreadyPaid).toBe(true);
    expect(secondMark?.order.status).toBe("approved");
  });

  it("safely detects unconfigured Mercado Pago credentials without fake checkout", async () => {
    const originalToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    delete process.env.MERCADO_PAGO_ACCESS_TOKEN;

    expect(isMercadoPagoConfigured()).toBe(false);

    const result = await createCheckoutPreference({
      name: "Maria Silva",
      email: "maria@teste.com",
      baseUrl: "http://localhost:3000",
    });

    expect(result.success).toBe(false);
    expect(result.configured).toBe(false);
    expect(result.message).toContain("MERCADO_PAGO_ACCESS_TOKEN");

    // Restore if set
    if (originalToken) {
      process.env.MERCADO_PAGO_ACCESS_TOKEN = originalToken;
    }
  });
});
