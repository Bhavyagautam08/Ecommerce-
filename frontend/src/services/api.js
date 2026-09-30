const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const normalizedBaseUrl = configuredBaseUrl.replace(/\/+$/, "");
const BASE_URL = /\/api\/v1$/i.test(normalizedBaseUrl)
  ? normalizedBaseUrl
  : `${normalizedBaseUrl}/api/v1`;

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    throw new Error("Session expired");
  }

  const data = await res.json();
  const newToken = data.accessToken || data.AccessToken;
  localStorage.setItem("accessToken", newToken);
  return newToken;
}

async function request(endpoint, options = {}, retry = true) {
  const accessToken = localStorage.getItem("accessToken");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && retry) {
    try {
      const newToken = await refreshAccessToken();
      headers["Authorization"] = `Bearer ${newToken}`;
      return request(endpoint, { ...options, headers }, false);
    } catch {
      throw new Error("Session expired. Please log in again.");
    }
  }

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { message: text };
  }

  if (!res.ok) {
    throw new Error(data?.message || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  get: (endpoint, options) => request(endpoint, { method: "GET", ...options }),
  post: (endpoint, body, options) =>
    request(endpoint, { method: "POST", body: JSON.stringify(body), ...options }),
  patch: (endpoint, body, options) =>
    request(endpoint, { method: "PATCH", body: JSON.stringify(body), ...options }),
  delete: (endpoint, options) => request(endpoint, { method: "DELETE", ...options }),
};
