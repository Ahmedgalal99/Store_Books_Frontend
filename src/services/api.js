/**
 * API Service Layer
 * Switches between mock server and real backend based on environment variable
 */

import mockAPI from './mockServer';

const API_MODE = import.meta.env.VITE_API_MODE || 'mock';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Real API implementation (placeholder)
const realAPI = {
  auth: {
    login: async (email, password) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return response.json();
    },
    logout: async () => {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    getCurrentUser: async (token) => {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    }
  },
  
  books: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/books`);
      return response.json();
    },
    getById: async (id) => {
      const response = await fetch(`${API_URL}/books/${id}`);
      return response.json();
    },
    create: async (data) => {
      const response = await fetch(`${API_URL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    update: async (id, data) => {
      const response = await fetch(`${API_URL}/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    delete: async (id) => {
      const response = await fetch(`${API_URL}/books/${id}`, {
        method: 'DELETE'
      });
      return response.json();
    }
  },
  
  authors: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/authors`);
      return response.json();
    },
    create: async (data) => {
      const response = await fetch(`${API_URL}/authors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    update: async (id, data) => {
      const response = await fetch(`${API_URL}/authors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    delete: async (id) => {
      const response = await fetch(`${API_URL}/authors/${id}`, {
        method: 'DELETE'
      });
      return response.json();
    }
  },
  
  stores: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/stores`);
      return response.json();
    },
    getById: async (id) => {
      const response = await fetch(`${API_URL}/stores/${id}`);
      return response.json();
    },
    create: async (data) => {
      const response = await fetch(`${API_URL}/stores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    update: async (id, data) => {
      const response = await fetch(`${API_URL}/stores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    delete: async (id) => {
      const response = await fetch(`${API_URL}/stores/${id}`, {
        method: 'DELETE'
      });
      return response.json();
    }
  },
  
  inventory: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/inventory`);
      return response.json();
    },
    getByStore: async (storeId) => {
      const response = await fetch(`${API_URL}/inventory/store/${storeId}`);
      return response.json();
    },
    create: async (data) => {
      const response = await fetch(`${API_URL}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    update: async (id, data) => {
      const response = await fetch(`${API_URL}/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    delete: async (id) => {
      const response = await fetch(`${API_URL}/inventory/${id}`, {
        method: 'DELETE'
      });
      return response.json();
    },
    deleteByStoreAndBook: async (storeId, bookId) => {
      const response = await fetch(`${API_URL}/inventory/store/${storeId}/book/${bookId}`, {
        method: 'DELETE'
      });
      return response.json();
    }
  }
};

// Export the appropriate API based on mode
const api = API_MODE === 'mock' ? mockAPI : realAPI;

export default api;

// Export API mode for debugging
export const getAPIMode = () => API_MODE;
