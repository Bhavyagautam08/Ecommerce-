import { api } from "./api";

export const authService = {
  register: (data) => api.post("/register", data),
  login: (data) => api.post("/auth/login", data),
  refresh: (refreshToken) => api.post("/auth/refresh", { refreshToken }),
  me: () => api.get("/auth/me"),
};
