/**
 * API Client para comunicação com o backend
 * Substitui mockBackend.ts
 */

const API_URL =
  (import.meta as any).env.VITE_API_URL || "http://localhost:5000/api";

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  token?: string;
}

// Funções helper para requisições
const getToken = (): string | null => localStorage.getItem("auth_token");

const setToken = (token: string): void =>
  localStorage.setItem("auth_token", token);

const removeToken = (): void => localStorage.removeItem("auth_token");

const getHeaders = (includeAuth = true) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (includeAuth && getToken()) {
    headers["Authorization"] = `Bearer ${getToken()}`;
  }

  return headers;
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Erro ${response.status}`);
  }
  return response.json();
};

// ============================================
// AUTH
// ============================================

export const apiLogin = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify({ email, password }),
  });

  const data = await handleResponse(response);
  if (data.token) {
    setToken(data.token);
  }
  return data.user;
};

export const apiLogout = () => {
  removeToken();
};

// ============================================
// USERS
// ============================================

export const apiGetUsers = async () => {
  const response = await fetch(`${API_URL}/users`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const apiCreateUser = async (userData: any) => {
  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

export const apiUpdateUser = async (id: string, updates: any) => {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  return handleResponse(response);
};

export const apiUpdateProfile = async (profileData: any) => {
  const response = await fetch(`${API_URL}/profile`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(profileData),
  });
  return handleResponse(response);
};

// ============================================
// VACANCIES
// ============================================

export const apiGetVacancies = async () => {
  const response = await fetch(`${API_URL}/vacancies`, {
    headers: getHeaders(false),
  });
  return handleResponse(response);
};

export const apiGetMyVacancies = async () => {
  const response = await fetch(`${API_URL}/my-vacancies`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const apiCreateVacancy = async (vacancyData: any) => {
  const response = await fetch(`${API_URL}/vacancies`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(vacancyData),
  });
  return handleResponse(response);
};

export const apiUpdateVacancy = async (vacancyId: number, vacancyData: any) => {
  const response = await fetch(`${API_URL}/vacancies/${vacancyId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(vacancyData),
  });
  return handleResponse(response);
};

export const apiDeleteVacancy = async (vacancyId: number) => {
  const response = await fetch(`${API_URL}/vacancies/${vacancyId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const apiGetApplicationsForVacancy = async (vacancyId: number) => {
  const response = await fetch(
    `${API_URL}/vacancies/${vacancyId}/applications`,
    {
      headers: getHeaders(),
    },
  );
  return handleResponse(response);
};

export const apiUpdateApplicationStatus = async (
  appId: string,
  status: string,
) => {
  const response = await fetch(`${API_URL}/applications/${appId}/status`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
};

export const apiAddUserToVacancy = async (
  vacancyId: string,
  userId: string,
) => {
  const response = await fetch(`${API_URL}/vacancies/add-user`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ vacancyId, userId }),
  });
  return handleResponse(response);
};

export const apiRemoveUserFromVacancy = async (applicationId: string) => {
  const response = await fetch(`${API_URL}/applications/${applicationId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const apiGetExpiredVacancies = async () => {
  const response = await fetch(`${API_URL}/vacancies/expired`, {
    headers: getHeaders(false),
  });
  return handleResponse(response);
};

// ============================================
// APPLICATIONS
// ============================================

export const apiApplyToVacancy = async (vacancyId: number) => {
  const response = await fetch(`${API_URL}/apply`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ vacancyId }),
  });
  return handleResponse(response);
};

export const apiGetMyApplications = async () => {
  const response = await fetch(`${API_URL}/my-applications`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const apiCancelApplication = async (appId: string) => {
  const response = await fetch(`${API_URL}/applications/${appId}/cancel`, {
    method: "PUT",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// ============================================
// NEWS
// ============================================

export const apiGetNews = async () => {
  const response = await fetch(`${API_URL}/news`, {
    headers: getHeaders(false),
  });
  return handleResponse(response);
};

export const apiCreateNews = async (newsData: any) => {
  const response = await fetch(`${API_URL}/news`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(newsData),
  });
  return handleResponse(response);
};

// ============================================
// UTILITY
// ============================================

export const apiHealthCheck = async () => {
  try {
    const response = await fetch(`http://localhost:5000/health`);
    return response.ok;
  } catch {
    return false;
  }
};
