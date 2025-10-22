import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

axios.defaults.baseURL = API_URL;

// Request interceptor to add token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post('/users/token/refresh/', {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export interface RegisterData {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  password: string;
  password2: string;
}

export interface LoginData {
  username: string;
  password: string;
  remember_me?: boolean;
}

export interface ResetPasswordData {
  token: string;
  new_password: string;
  new_password2: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  new_password2: string;
}

export const authAPI = {
  register: (data: RegisterData) => axios.post('/users/register/', data),
  
  verifyEmail: (uid: string, token: string) => 
    axios.post('/users/email-verify/', { uid, token }),
  
  login: (data: LoginData) => axios.post('/users/login/', data),
  
  logout: () => {
    const refresh = localStorage.getItem('refresh_token');
    return axios.post('/users/logout/', { refresh });
  },
  
  getUser: () => axios.get('/users/user/'),
  
  updateUser: (data: Record<string, unknown>) => axios.put('/users/user/', data),
  
  requestPasswordReset: (email: string) => 
    axios.post('/users/password-reset/', { email }),
  
  resetPasswordConfirm: (data: ResetPasswordData) =>
    axios.post('/users/password-reset-confirm/', data),
  
  changePassword: (data: ChangePasswordData) =>
    axios.post('/users/change-password/', data),
};