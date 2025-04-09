import axios from 'axios';

// Create a new axios instance
const instance = axios.create({
  baseURL: 'http://localhost:8080', // Set the base URL for your server
  timeout: 10000, // Optional: Set a timeout for requests
});

// Add a request interceptor to include the token in the Authorization header
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Export the configured axios instance as the default export
export default instance;