// Utilitário para obter o token de autenticação de forma segura
export function getAuthToken(): string {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return "";
    const varLocalStorage = JSON.parse(authStorage);
    return varLocalStorage?.state?.token || "";
  } catch {
    return "";
  }
} 