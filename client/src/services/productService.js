import api from "./api";

export const getProducts = (page = 1, search = "", category = "") => {
  return api.get(`/products?page=${page}&search=${search}&category=${encodeURIComponent(category)}`);
};

export const getProductById = (id) => {
  return api.get(`/products/${id}`);
};

export const createProduct = (data) => {
  return api.post("/products", data);
};

export const updateProduct = (id, data) => {
  return api.put(`/products/${id}`, data);
};

export const deleteProduct = (id) => {
  return api.delete(`/products/${id}`);
};
