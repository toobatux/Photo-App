const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
// Removes any trailing slash from the base URL automatically
export const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');

// 1. In-memory CSRF token variable (bypasses third-party cookie blocking)
let inMemoryCsrfToken = null;

/**
 * Call this function whenever your API returns a csrfToken in JSON
 * (e.g. inside checkAuthStatus or after login)
 */
export function setCsrfToken(token) {
  inMemoryCsrfToken = token;
  if (typeof window !== "undefined") {
    window.csrfToken = token; // Easy access for console debugging
  }
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export async function customFetch(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  options.headers = options.headers || {};
  options.credentials = "include";

  if (options.body && !(options.body instanceof FormData)) {
    options.headers["Content-Type"] = "application/json";
  }

  // 2. Check in-memory store first, then window.csrfToken, then fallback to document.cookie
  const csrfToken = inMemoryCsrfToken || (typeof window !== "undefined" && window.csrfToken) || getCookie("csrftoken");

  // 3. Attach X-CSRFToken header for mutating requests (POST, PUT, PATCH, DELETE)
  if (csrfToken && !["GET", "HEAD", "OPTIONS"].includes(method)) {
    options.headers["X-CSRFToken"] = csrfToken;
  }

  // DEBUG
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    console.log(`[customFetch] Mutating Request (${method} ${endpoint})`);
    console.log(`[customFetch] CSRF Token Found in Memory:`, csrfToken);
  }

  if (csrfToken && !["GET", "HEAD", "OPTIONS"].includes(method)) {
    options.headers["X-CSRFToken"] = csrfToken;
  }

  // 🔍 DEBUG LOG 2
  console.log(`[customFetch] Final Outgoing Headers:`, options.headers);



  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.error || "Something went wrong");
  }

  const contentType = response.headers.get("content-type");
  if (
    !contentType ||
    !contentType.includes("application/json") ||
    response.status === 204
  ) {
    return null; // Safely return nothing instead of crashing on empty strings
  }

  return response.json();
}