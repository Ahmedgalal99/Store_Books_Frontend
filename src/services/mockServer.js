/**
 * Mock Server - Simulates backend API
 * Stores data in memory and localStorage
 */

const MOCK_DELAY = parseInt(import.meta.env.VITE_MOCK_DELAY) || 300;

// Mock users for authentication
const MOCK_USERS = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@library.com',
    password: 'admin123',
    role: 'admin',
  },
];

// Helper to simulate network delay
const delay = (ms = MOCK_DELAY) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to simulate API response
const apiResponse = async (data, error = null) => {
  await delay();
  if (error) {
    throw new Error(error);
  }
  return { data, success: true };
};

// Get data from localStorage or default JSON
const getData = async (key, defaultPath) => {
  const stored = localStorage.getItem(`library_${key}`);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Fetch from JSON file
  const response = await fetch(defaultPath);
  const data = await response.json();
  const arrayData = Array.isArray(data) ? data : [data];
  localStorage.setItem(`library_${key}`, JSON.stringify(arrayData));
  return arrayData;
};

// Save data to localStorage
const saveData = (key, data) => {
  localStorage.setItem(`library_${key}`, JSON.stringify(data));
};

// Generate new ID
const generateId = (items) => {
  if (!items || items.length === 0) return 1;
  return Math.max(...items.map(item => item.id)) + 1;
};

// Mock API endpoints
export const mockAPI = {
  // Authentication
  auth: {
    login: async (email, password) => {
      const user = MOCK_USERS.find(u => u.email === email && u.password === password);
      if (!user) {
        return apiResponse(null, 'Invalid email or password');
      }
      const { password: _, ...userWithoutPassword } = user;
      const token = btoa(JSON.stringify({ userId: user.id, timestamp: Date.now() }));
      return apiResponse({ user: userWithoutPassword, token });
    },
    
    logout: async () => {
      return apiResponse({ success: true });
    },
    
    getCurrentUser: async (token) => {
      try {
        const decoded = JSON.parse(atob(token));
        const user = MOCK_USERS.find(u => u.id === decoded.userId);
        if (!user) {
          return apiResponse(null, 'Invalid token');
        }
        const { password: _, ...userWithoutPassword } = user;
        return apiResponse(userWithoutPassword);
      } catch {
        return apiResponse(null, 'Invalid token');
      }
    }
  },

  // Books
  books: {
    getAll: async () => {
      const books = await getData('books', '/data/books.json');
      return apiResponse(books);
    },
    
    getById: async (id) => {
      const books = await getData('books', '/data/books.json');
      const book = books.find(b => b.id === parseInt(id));
      if (!book) {
        return apiResponse(null, 'Book not found');
      }
      return apiResponse(book);
    },
    
    create: async (bookData) => {
      const books = await getData('books', '/data/books.json');
      const newBook = {
        ...bookData,
        id: generateId(books)
      };
      books.push(newBook);
      saveData('books', books);
      return apiResponse(newBook);
    },
    
    update: async (id, updates) => {
      const books = await getData('books', '/data/books.json');
      const index = books.findIndex(b => b.id === parseInt(id));
      if (index === -1) {
        return apiResponse(null, 'Book not found');
      }
      books[index] = { ...books[index], ...updates };
      saveData('books', books);
      return apiResponse(books[index]);
    },
    
    delete: async (id) => {
      const books = await getData('books', '/data/books.json');
      const filtered = books.filter(b => b.id !== parseInt(id));
      if (filtered.length === books.length) {
        return apiResponse(null, 'Book not found');
      }
      saveData('books', filtered);
      return apiResponse({ success: true });
    }
  },

  // Authors
  authors: {
    getAll: async () => {
      const authors = await getData('authors', '/data/authors.json');
      return apiResponse(authors);
    },
    
    create: async (authorData) => {
      const authors = await getData('authors', '/data/authors.json');
      const newAuthor = {
        ...authorData,
        id: generateId(authors)
      };
      authors.push(newAuthor);
      saveData('authors', authors);
      return apiResponse(newAuthor);
    },
    
    update: async (id, updates) => {
      const authors = await getData('authors', '/data/authors.json');
      const index = authors.findIndex(a => a.id === parseInt(id));
      if (index === -1) {
        return apiResponse(null, 'Author not found');
      }
      authors[index] = { ...authors[index], ...updates };
      saveData('authors', authors);
      return apiResponse(authors[index]);
    },
    
    delete: async (id) => {
      const authors = await getData('authors', '/data/authors.json');
      const filtered = authors.filter(a => a.id !== parseInt(id));
      if (filtered.length === authors.length) {
        return apiResponse(null, 'Author not found');
      }
      saveData('authors', filtered);
      return apiResponse({ success: true });
    }
  },

  // Stores
  stores: {
    getAll: async () => {
      const stores = await getData('stores', '/data/stores.json');
      return apiResponse(stores);
    },
    
    getById: async (id) => {
      const stores = await getData('stores', '/data/stores.json');
      const store = stores.find(s => s.id === parseInt(id));
      if (!store) {
        return apiResponse(null, 'Store not found');
      }
      return apiResponse(store);
    },
    
    create: async (storeData) => {
      const stores = await getData('stores', '/data/stores.json');
      const newStore = {
        ...storeData,
        id: generateId(stores)
      };
      stores.push(newStore);
      saveData('stores', stores);
      return apiResponse(newStore);
    },
    
    update: async (id, updates) => {
      const stores = await getData('stores', '/data/stores.json');
      const index = stores.findIndex(s => s.id === parseInt(id));
      if (index === -1) {
        return apiResponse(null, 'Store not found');
      }
      stores[index] = { ...stores[index], ...updates };
      saveData('stores', stores);
      return apiResponse(stores[index]);
    },
    
    delete: async (id) => {
      const stores = await getData('stores', '/data/stores.json');
      const filtered = stores.filter(s => s.id !== parseInt(id));
      if (filtered.length === stores.length) {
        return apiResponse(null, 'Store not found');
      }
      saveData('stores', filtered);
      return apiResponse({ success: true });
    }
  },

  // Inventory
  inventory: {
    getAll: async () => {
      const inventory = await getData('inventory', '/data/inventory.json');
      return apiResponse(inventory);
    },
    
    getByStore: async (storeId) => {
      const inventory = await getData('inventory', '/data/inventory.json');
      const storeInventory = inventory.filter(item => item.store_id === parseInt(storeId));
      return apiResponse(storeInventory);
    },
    
    create: async (inventoryData) => {
      const inventory = await getData('inventory', '/data/inventory.json');
      const newItem = {
        ...inventoryData,
        id: generateId(inventory)
      };
      inventory.push(newItem);
      saveData('inventory', inventory);
      return apiResponse(newItem);
    },
    
    update: async (id, updates) => {
      const inventory = await getData('inventory', '/data/inventory.json');
      const index = inventory.findIndex(i => i.id === parseInt(id));
      if (index === -1) {
        return apiResponse(null, 'Inventory item not found');
      }
      inventory[index] = { ...inventory[index], ...updates };
      saveData('inventory', inventory);
      return apiResponse(inventory[index]);
    },
    
    delete: async (id) => {
      const inventory = await getData('inventory', '/data/inventory.json');
      const filtered = inventory.filter(i => i.id !== parseInt(id));
      if (filtered.length === inventory.length) {
        return apiResponse(null, 'Inventory item not found');
      }
      saveData('inventory', filtered);
      return apiResponse({ success: true });
    },
    
    deleteByStoreAndBook: async (storeId, bookId) => {
      const inventory = await getData('inventory', '/data/inventory.json');
      const filtered = inventory.filter(i => 
        !(i.store_id === parseInt(storeId) && i.book_id === parseInt(bookId))
      );
      if (filtered.length === inventory.length) {
        return apiResponse(null, 'Inventory item not found');
      }
      saveData('inventory', filtered);
      return apiResponse({ success: true });
    }
  }
};

export default mockAPI;
