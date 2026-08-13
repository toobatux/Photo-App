const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');

export async function customFetch(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  options.headers = options.headers || {};

  // Auto-set JSON content type for body objects
  if (options.body && !(options.body instanceof FormData)) {
    options.headers["Content-Type"] = "application/json";
  }

  // 💡 Attach Bearer Token if available in localStorage
  const token = localStorage.getItem("accessToken");
  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    method,
    headers: options.headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.error || "Request failed");
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json") || response.status === 204) {
    return null;
  }

  return response.json();
}