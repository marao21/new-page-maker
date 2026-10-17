import { productConfig } from "../config/product";

export type OrderStatus = "pending" | "approved" | "rejected" | "refunded" | "cancelled";

export interface OrderCustomer {
  name: string;
  email: string;
  cpf?: string | undefined;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  customer: OrderCustomer;
  amount: number;
  currency: string;
  status: OrderStatus;
  mercadoPagoPaymentId?: string;
  mercadoPagoPreferenceId?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  accessToken: string;
}

// In-memory persistent order storage on server runtime
const ordersStore = new Map<string, Order>();

function generateId(prefix = "ord"): string {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${time}_${rand}`;
}

export function createOrder(customer: OrderCustomer): Order {
  const orderId = generateId("ord");
  const accessToken = generateId("tok");

  const order: Order = {
    id: orderId,
    productId: productConfig.id,
    productName: productConfig.name,
    customer: {
      name: customer.name.trim(),
      email: customer.email.trim().toLowerCase(),
      cpf: customer.cpf?.trim(),
    },
    // CRITICAL: Amount is strictly sourced from server-side product config!
    amount: productConfig.price,
    currency: productConfig.currency,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accessToken,
  };

  ordersStore.set(order.id, order);
  return order;
}

export function getOrderById(orderId: string): Order | undefined {
  return ordersStore.get(orderId);
}

export function getOrderByPreferenceId(preferenceId: string): Order | undefined {
  for (const order of ordersStore.values()) {
    if (order.mercadoPagoPreferenceId === preferenceId) {
      return order;
    }
  }
  return undefined;
}

export function updateOrderPreference(orderId: string, preferenceId: string): Order | undefined {
  const order = ordersStore.get(orderId);
  if (!order) return undefined;
  order.mercadoPagoPreferenceId = preferenceId;
  order.updatedAt = new Date().toISOString();
  ordersStore.set(orderId, order);
  return order;
}

export function markOrderPaid(
  orderId: string,
  paymentId: string,
  paymentMethod?: string,
): { order: Order; alreadyPaid: boolean } | undefined {
  const order = ordersStore.get(orderId);
  if (!order) return undefined;

  const alreadyPaid = order.status === "approved";
  if (!alreadyPaid) {
    order.status = "approved";
    order.mercadoPagoPaymentId = paymentId;
    order.paymentMethod = paymentMethod ?? "mercadopago";
    order.paidAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    ordersStore.set(orderId, order);
  }

  return { order, alreadyPaid };
}

export function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  paymentId?: string,
): Order | undefined {
  const order = ordersStore.get(orderId);
  if (!order) return undefined;

  order.status = status;
  if (paymentId) order.mercadoPagoPaymentId = paymentId;
  order.updatedAt = new Date().toISOString();
  ordersStore.set(orderId, order);
  return order;
}
