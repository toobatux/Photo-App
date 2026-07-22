// const BASE_URL = 'http://192.168.1.166:8000';
const BASE_URL = "http://localhost:8000";

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
  options.headers = options.headers || {};
  options.credentials = "include";

  if (options.body && !(options.body instanceof FormData)) {
    options.headers["Content-Type"] = "application/json";
  }

  const csrfToken = getCookie("csrftoken");
  if (csrfToken) {
    options.headers["X-CSRFToken"] = csrfToken;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Something went wrong");
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
