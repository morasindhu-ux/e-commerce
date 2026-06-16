import api from "./api";

export const checkout = (shippingAddress) =>
  api.post("/orders/checkout", { shippingAddress });

export const getOrders = () =>
  api.get("/orders");

export const getOrderById = (id) =>
  api.get(`/orders/${id}`);
