// ==============================================================
// TIDESK - CLIENTE DE CONEXIÓN A LA API REST (NESTJS)
// ==============================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('tidesk_token');
}

export function setToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tidesk_token', token);
  }
}

export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('tidesk_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    if (!endpoint.includes('/auth/login')) {
      removeToken();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
  }

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg =
      (typeof data === 'object' && data?.message) ||
      (typeof data === 'string' && data) ||
      `Error ${response.status}: ${response.statusText}`;
    throw new ApiError(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg, response.status, data);
  }

  return data as T;
}

export const api = {
  // Autenticación
  auth: {
    login: (correo: string, password: string) =>
      request<{ accessToken: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ correo, password }),
      }),
    me: () => request<any>('/auth/me'),
    logout: () =>
      request<{ message: string }>('/auth/logout', {
        method: 'POST',
      }),
  },

  // Dashboard
  dashboard: {
    getStats: (params: Record<string, any> = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request<any>(`/dashboard/stats${qs ? `?${qs}` : ''}`);
    },
  },

  // Tickets
  tickets: {
    getAll: (params: Record<string, any> = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request<{ items: any[]; total: number; page: number; totalPages: number }>(
        `/tickets${qs ? `?${qs}` : ''}`,
      );
    },
    getById: (id: number) => request<any>(`/tickets/${id}`),
    create: (data: any) =>
      request<any>('/tickets', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: number, data: { idEstado: number; motivo?: string }) =>
      request<any>(`/tickets/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    assign: (id: number, data: { idEspecialista: number; motivoReasignacion?: string }) =>
      request<any>(`/tickets/${id}/assignments`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    addComment: (id: number, data: { comentario: string; comentarioInterno?: boolean }) =>
      request<any>(`/tickets/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    resolve: (id: number, data: { solucion: string }) =>
      request<any>(`/tickets/${id}/solution`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    submitSurvey: (id: number, data: { calificacion: number; comentario?: string }) =>
      request<any>(`/tickets/${id}/survey`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    approveCrq: (id: number, data: { estadoAprobacion: string; comentario?: string }) =>
      request<any>(`/tickets/${id}/approve-crq`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    take: (id: number) =>
      request<any>(`/tickets/${id}/take`, {
        method: 'POST',
      }),
    close: (id: number, data?: { motivo?: string }) =>
      request<any>(`/tickets/${id}/close`, {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }),
    uploadAttachment: async (id: number, file: File) => {
      const token = getToken();
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE_URL}/tickets/${id}/attachments`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Error al subir archivo' }));
        throw new ApiError(err.message || 'Error al subir archivo', res.status, err);
      }
      return res.json();
    },
    getAttachments: (id: number) => request<any[]>(`/tickets/${id}/attachments`),
    downloadAttachmentUrl: (attachmentId: number) =>
      `${API_BASE_URL}/tickets/attachments/${attachmentId}/download?token=${getToken() || ''}`,
  },

  // Catálogos
  catalogs: {
    getAll: () => request<any>('/catalogs'),
    getSedes: () => request<any[]>('/catalogs/sedes'),
    getAreas: () => request<any[]>('/catalogs/areas'),
    getTipos: () => request<any[]>('/catalogs/tipos-ticket'),
    getPrioridades: () => request<any[]>('/catalogs/prioridades'),
    getEstados: () => request<any[]>('/catalogs/estados'),
    getCategorias: () => request<any[]>('/catalogs/categorias'),
    getServicios: (idArea?: number) =>
      request<any[]>(`/catalogs/servicios${idArea ? `?idArea=${idArea}` : ''}`),
    getEspecialistas: (idArea?: number) =>
      request<any[]>(`/catalogs/especialistas${idArea ? `?idArea=${idArea}` : ''}`),
  },

  // Notificaciones
  notifications: {
    getAll: () => request<{ items: any[]; unreadCount: number }>('/notifications'),
    markAsRead: (id: number) =>
      request<any>(`/notifications/${id}/read`, {
        method: 'PATCH',
      }),
    markAllAsRead: () =>
      request<any>('/notifications/read-all', {
        method: 'PATCH',
      }),
  },

  // Usuarios
  users: {
    getAll: (params: Record<string, any> = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request<{ items: any[]; total: number; page: number; totalPages: number }>(
        `/users${qs ? `?${qs}` : ''}`,
      );
    },
    getMe: () => request<any>('/users/me'),
    getById: (id: number) => request<any>(`/users/${id}`),
    create: (data: any) =>
      request<any>('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      request<any>(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    toggleStatus: (id: number) =>
      request<any>(`/users/${id}/toggle-status`, {
        method: 'PATCH',
      }),
  },

  // SLA
  sla: {
    getPolicies: () => request<any[]>('/sla/policies'),
    updatePolicy: (id: number, data: any) =>
      request<any>(`/sla/policies/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    getMetrics: () =>
      request<{
        totalWithSla: number;
        fulfilled: number;
        breached: number;
        inProgress: number;
        complianceRate: number;
      }>('/sla/metrics'),
  },

  // Reportes y Analítica
  reports: {
    getAnalytics: (params: Record<string, any> = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request<any>(`/reports/analytics${qs ? `?${qs}` : ''}`);
    },
    getExcelExportUrl: (params: Record<string, any> = {}) => {
      const qs = new URLSearchParams(params).toString();
      return `${API_BASE_URL}/reports/export/excel${qs ? `?${qs}` : ''}`;
    },
    getCsvExportUrl: (params: Record<string, any> = {}) => {
      const qs = new URLSearchParams(params).toString();
      return `${API_BASE_URL}/reports/export/csv${qs ? `?${qs}` : ''}`;
    },
  },
};
