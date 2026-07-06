import axios from 'axios';
import type {
  ApiResponse,
  AuthTokens,
  UserInfo,
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  ReorderTaskPayload,
  AnnotationImage,
  Polygon,
  CreatePolygonPayload,
} from '@/src/interfaces';

// ─── Axios Instance ──────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) throw new Error('No refresh token');

        const { data } = await axios.post<{ access: string }>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh/`,
          { refresh }
        );

        localStorage.setItem('access_token', data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch {
        // Refresh failed — clear tokens so middleware redirects to /login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth API ────────────────────────────────────────────────────────────────

export const authApi = {
  /** POST /api/auth/login/ — returns access + refresh tokens */
  login: (email: string, password: string) =>
    api.post<ApiResponse<AuthTokens>>('/api/auth/login/', { email, password }),

  /** POST /api/auth/refresh/ — refreshes access token */
  refresh: (refresh: string) =>
    api.post<{ access: string }>('/api/auth/refresh/', { refresh }),

  /** POST /api/auth/logout/ — blacklists refresh token */
  logout: (refresh: string) =>
    api.post<ApiResponse<unknown>>('/api/auth/logout/', { refresh }),

  /** GET /api/auth/me/ — returns current user info */
  me: () =>
    api.get<ApiResponse<UserInfo>>('/api/auth/me/'),
};

// ─── Tasks API ───────────────────────────────────────────────────────────────

export const tasksApi = {
  /** GET /api/tasks/ — fetch all tasks without date filter */
  getAll: () =>
    api.get<ApiResponse<Task[]>>('/api/tasks/'),

  /** GET /api/tasks/?date=YYYY-MM-DD — fetch tasks for a specific date */
  getByDate: (date: string) =>
    api.get<ApiResponse<Task[]>>('/api/tasks/', { params: { date } }),

  /** POST /api/tasks/ — create a new task */
  create: (payload: CreateTaskPayload) =>
    api.post<ApiResponse<Task>>('/api/tasks/', payload),

  /** PATCH /api/tasks/:id/ — update task fields */
  update: (id: number, payload: UpdateTaskPayload) =>
    api.patch<ApiResponse<Task>>(`/api/tasks/${id}/`, payload),

  /** PATCH /api/tasks/:id/reorder/ — update order + status after drag & drop */
  reorder: (id: number, payload: ReorderTaskPayload) =>
    api.patch<ApiResponse<Task>>(`/api/tasks/${id}/reorder/`, payload),

  /** DELETE /api/tasks/:id/ — delete a task */
  delete: (id: number) =>
    api.delete<ApiResponse<unknown>>(`/api/tasks/${id}/`),
};

// ─── Annotate API ─────────────────────────────────────────────────────────────

export const annotateApi = {
  /** GET /api/annotate/images/ — list all uploaded images */
  getImages: () =>
    api.get<ApiResponse<AnnotationImage[]>>('/api/annotate/images/'),

  /** POST /api/annotate/images/ — upload a new image (multipart/form-data) */
  uploadImage: (formData: FormData) =>
    api.post<ApiResponse<AnnotationImage>>('/api/annotate/images/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /** DELETE /api/annotate/images/:id/ — delete an image */
  deleteImage: (id: number) =>
    api.delete<ApiResponse<unknown>>(`/api/annotate/images/${id}/`),

  /** GET /api/annotate/images/:id/polygons/ — get polygons for an image */
  getPolygons: (imageId: number) =>
    api.get<ApiResponse<Polygon[]>>(`/api/annotate/images/${imageId}/polygons/`),

  /** POST /api/annotate/images/:id/polygons/ — save a new polygon */
  createPolygon: (imageId: number, payload: CreatePolygonPayload) =>
    api.post<ApiResponse<Polygon>>(`/api/annotate/images/${imageId}/polygons/`, payload),

  /** DELETE /api/annotate/polygons/:id/ — delete a specific polygon */
  deletePolygon: (id: number) =>
    api.delete<ApiResponse<unknown>>(`/api/annotate/polygons/${id}/`),
};

export default api;
