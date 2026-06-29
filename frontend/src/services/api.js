import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to inject the short-lived access token into headers in-memory
export const setLocalAccessToken = (token) => {
  if (token) {
    localStorage.setItem('access_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('access_token');
    delete api.defaults.headers.common['Authorization'];
  }
};

// Response Interceptor: Catches 401 errors and attempts silent refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried retrying this request yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Read the persistent refresh token from localStorage
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // FIX: Hit the unified path and pass the token in the request body object
        const response = await axios.post('http://127.0.0.1:8000/api/auth/token/refresh/', {
          refresh: refreshToken,
        });

        const { access } = response.data;

        // Save the shiny new access token and retry the original user request
        setLocalAccessToken(access);
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // If the refresh token itself is expired or invalid, wipe the slate clean
        localStorage.removeItem('refresh_token');
        setLocalAccessToken(null);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;