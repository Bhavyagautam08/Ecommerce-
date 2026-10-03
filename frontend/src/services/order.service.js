import { api } from "./api";

export const orderService = {
  create: (shippingAddress, idempotencyKey) =>
    api.post("/orders", { shippingAddress }, {
      headers: { "Idempotency-Key": idempotencyKey },
    }),
  getMyOrders: () => api.get("/orders"),
  getById: (orderId) => api.get(`/orders/${orderId}`),
  cancel: (orderId) => api.patch(`/orders/${orderId}/cancel`),
  // Admin
  getAll: () => api.get("/admin/orders"),
  updateStatus: (orderId, status) => api.patch(`/admin/orders/${orderId}/status`, { status }),
};
