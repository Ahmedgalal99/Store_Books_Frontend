import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [stores, setStores] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data from localStorage or fetch from JSON
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to load from localStorage first
        const cachedBooks = localStorage.getItem('library_books');
        const cachedAuthors = localStorage.getItem('library_authors');
        const cachedStores = localStorage.getItem('library_stores');
        const cachedInventory = localStorage.getItem('library_inventory');

        if (cachedBooks && cachedAuthors && cachedStores && cachedInventory) {
          // Use cached data
          setBooks(JSON.parse(cachedBooks));
          setAuthors(JSON.parse(cachedAuthors));
          setStores(JSON.parse(cachedStores));
          setInventory(JSON.parse(cachedInventory));
        } else {
          // Fetch from JSON files
          const [booksData, authorsData, storesData, inventoryData] = await Promise.all([
            fetch('/data/books.json').then(r => r.json()),
            fetch('/data/authors.json').then(r => r.json()),
            fetch('/data/stores.json').then(r => r.json()),
            fetch('/data/inventory.json').then(r => r.json()),
          ]);

          const booksArray = Array.isArray(booksData) ? booksData : [booksData];
          const authorsArray = Array.isArray(authorsData) ? authorsData : [authorsData];
          const storesArray = Array.isArray(storesData) ? storesData : [storesData];
          const inventoryArray = Array.isArray(inventoryData) ? inventoryData : [inventoryData];

          setBooks(booksArray);
          setAuthors(authorsArray);
          setStores(storesArray);
          setInventory(inventoryArray);

          // Cache in localStorage
          localStorage.setItem('library_books', JSON.stringify(booksArray));
          localStorage.setItem('library_authors', JSON.stringify(authorsArray));
          localStorage.setItem('library_stores', JSON.stringify(storesArray));
          localStorage.setItem('library_inventory', JSON.stringify(inventoryArray));
        }
      } catch (err) {
        console.error('Error fetching library data:', err?.message || 'Unknown error');
        setError(err?.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Persist books to localStorage whenever they change
  useEffect(() => {
    if (books.length > 0) {
      localStorage.setItem('library_books', JSON.stringify(books));
    }
  }, [books]);

  // Persist authors to localStorage whenever they change
  useEffect(() => {
    if (authors.length > 0) {
      localStorage.setItem('library_authors', JSON.stringify(authors));
    }
  }, [authors]);

  // Persist stores to localStorage whenever they change
  useEffect(() => {
    if (stores.length > 0) {
      localStorage.setItem('library_stores', JSON.stringify(stores));
    }
  }, [stores]);

  // Persist inventory to localStorage whenever it changes
  useEffect(() => {
    if (inventory.length > 0) {
      localStorage.setItem('library_inventory', JSON.stringify(inventory));
    }
  }, [inventory]);

  // CRUD operations for Books
  const addBook = useCallback((book) => {
    const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
    const newBook = { ...book, id: newId };
    setBooks(prev => [...prev, newBook]);
    return newBook;
  }, [books]);

  const updateBook = useCallback((id, updates) => {
    setBooks(prev => prev.map(book => book.id === id ? { ...book, ...updates } : book));
  }, []);

  const deleteBook = useCallback((id) => {
    setBooks(prev => prev.filter(book => book.id !== id));
  }, []);

  // CRUD operations for Authors
  const addAuthor = useCallback((author) => {
    const newId = authors.length > 0 ? Math.max(...authors.map(a => a.id)) + 1 : 1;
    const newAuthor = { ...author, id: newId };
    setAuthors(prev => [...prev, newAuthor]);
    return newAuthor;
  }, [authors]);

  const updateAuthor = useCallback((id, updates) => {
    setAuthors(prev => prev.map(author => author.id === id ? { ...author, ...updates } : author));
  }, []);

  const deleteAuthor = useCallback((id) => {
    setAuthors(prev => prev.filter(author => author.id !== id));
  }, []);

  // CRUD operations for Stores
  const addStore = useCallback((store) => {
    const newId = stores.length > 0 ? Math.max(...stores.map(s => s.id)) + 1 : 1;
    const newStore = { ...store, id: newId };
    setStores(prev => [...prev, newStore]);
    return newStore;
  }, [stores]);

  const updateStore = useCallback((id, updates) => {
    setStores(prev => prev.map(store => store.id === id ? { ...store, ...updates } : store));
  }, []);

  const deleteStore = useCallback((id) => {
    setStores(prev => prev.filter(store => store.id !== id));
  }, []);

  // CRUD operations for Inventory
  const addInventoryItem = useCallback((item) => {
    const newId = inventory.length > 0 ? Math.max(...inventory.map(i => i.id)) + 1 : 1;
    const newItem = { ...item, id: newId };
    setInventory(prev => [...prev, newItem]);
    return newItem;
  }, [inventory]);

  const updateInventoryItem = useCallback((id, updates) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const deleteInventoryItem = useCallback((id) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  }, []);

  const value = {
    // State
    books,
    authors,
    stores,
    inventory,
    isLoading,
    error,
    
    // Book operations
    addBook,
    updateBook,
    deleteBook,
    
    // Author operations
    addAuthor,
    updateAuthor,
    deleteAuthor,
    
    // Store operations
    addStore,
    updateStore,
    deleteStore,
    
    // Inventory operations
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
}

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
