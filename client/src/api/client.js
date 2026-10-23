const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
const TOKEN_KEY = "bookleaf_token";

function expireSession() {
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event("bookleaf:unauthorized"));
}

export async function apiRequest(path, { method = "GET", body, auth = true } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = auth ? localStorage.getItem(TOKEN_KEY) : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("Could not reach the support server. Check that the backend is running.");
  }

  let payload = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    payload = await response.json().catch(() => null);
  }

  if (!response.ok) {
    if (auth && response.status === 401) expireSession();
    throw new Error(payload?.message || `Request failed (${response.status}).`);
  }

  return payload;
}

export { TOKEN_KEY };
