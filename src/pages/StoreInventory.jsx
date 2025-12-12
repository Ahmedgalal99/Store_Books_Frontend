import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../hooks/useConfirm';
import { useToast } from '../hooks/useToast';
import { useSearchParams } from 'react-router-dom';
import Modal from '../components/Modal';
import Header from '../components/Header';
import Loading from './Loading';
import Table from '../components/Table/Table';
import TableActions from '../components/ActionButton/TableActions';
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog';
import Toast from '../components/Toast/Toast';

const StoreInventory = () => {
  const { storeId } = useParams();
  const { isAuthenticated } = useAuth();
  const { 
    books, 
    authors, 
    stores, 
    inventory, 
    isLoading,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
  } = useLibrary();
  
  const { confirmState, confirm, handleCancel: handleConfirmCancel } = useConfirm();
  const { toast, showToast, hideToast } = useToast();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  
  // State for UI
  const [activeTab, setActiveTab] = useState('books');
  const [showModal, setShowModal] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  
  // State for new inventory item
  const [newInventory, setNewInventory] = useState({
    book_id: '',
    price: ''
  });
  const [errors, setErrors] = useState({});
  
  // State for book search in dropdown
  const [bookSearchTerm, setBookSearchTerm] = useState('');

  // Sync search term with URL params
  useEffect(() => {
    const search = searchParams.get('search') || '';
    setSearchTerm(search);
  }, [searchParams]);

  // Get current store
  const currentStore = useMemo(() => {
    return stores.find(store => store.id === parseInt(storeId, 10));
  }, [stores, storeId]);

  // Get store inventory with book and author details
  const storeInventory = useMemo(() => {
    const storeInv = inventory.filter(item => item.store_id === parseInt(storeId, 10));
    
    return storeInv.map(item => {
      const book = books.find(b => b.id === item.book_id);
      const author = book ? authors.find(a => a.id === book.author_id) : null;
      
      return {
        ...item,
        book_name: book?.name || 'Unknown Book',
        book_pages: book?.page_count || 0,
        author_name: author ? `${author.first_name} ${author.last_name}` : 'Unknown Author',
        author_id: author?.id
      };
    });
  }, [inventory, books, authors, storeId]);

  // Filter inventory based on search
  const filteredInventory = useMemo(() => {
    if (!searchTerm.trim()) return storeInventory;
    const lowerSearch = searchTerm.toLowerCase();
    return storeInventory.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(lowerSearch)
      )
    );
  }, [storeInventory, searchTerm]);

  // Group books by author for Authors tab
  const inventoryByAuthor = useMemo(() => {
    const grouped = {};
    
    filteredInventory.forEach(item => {
      const authorKey = item.author_id || 'unknown';
      if (!grouped[authorKey]) {
        grouped[authorKey] = {
          author_id: item.author_id,
          author_name: item.author_name,
          books: []
        };
      }
      grouped[authorKey].books.push(item);
    });
    
    return Object.values(grouped);
  }, [filteredInventory]);

  // Get available books for dropdown (not already in store)
  const availableBooks = useMemo(() => {
    const inventoryBookIds = storeInventory.map(item => item.book_id);
    return books.filter(book => !inventoryBookIds.includes(book.id));
  }, [books, storeInventory]);

  // Filter books in dropdown based on search
  const filteredAvailableBooks = useMemo(() => {
    if (!bookSearchTerm.trim()) return availableBooks.slice(0, 7);
    
    const lowerSearch = bookSearchTerm.toLowerCase();
    const filtered = availableBooks.filter(book =>
      book.name.toLowerCase().includes(lowerSearch)
    );
    return filtered.slice(0, 7);
  }, [availableBooks, bookSearchTerm]);

  // Table columns for Books tab
  const booksColumns = useMemo(
    () => [
      { header: 'Book ID', accessorKey: 'book_id' },
      { header: 'Name', accessorKey: 'book_name' },
      { header: 'Pages', accessorKey: 'book_pages' },
      { header: 'Author', accessorKey: 'author_name' },
      {
        header: 'Price',
        accessorKey: 'price',
        cell: ({ row }) =>
          editingRowId === row.original.id ? (
            <input
              type="number"
              step="0.01"
              min="0"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSavePrice(row.original.id);
                } else if (e.key === 'Escape') {
                  handleCancelEdit();
                }
              }}
              className="border border-gray-300 rounded p-1 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            `$${row.original.price.toFixed(2)}`
          ),
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <TableActions
            row={row}
            onEdit={
              isAuthenticated
                ? editingRowId === row.original.id
                  ? handleCancelEdit
                  : () => handleEditPrice(row.original)
                : null
            }
            onDelete={
              isAuthenticated
                ? () => handleDeleteInventory(row.original.id, row.original.book_name)
                : null
            }
            disabled={!isAuthenticated}
          />
        ),
      },
    ],
    [editingRowId, editPrice, isAuthenticated]
  );

  // Handle edit price
  const handleEditPrice = (item) => {
    setEditingRowId(item.id);
    setEditPrice(item.price.toString());
  };

  // Handle save price
  const handleSavePrice = (id) => {
    const price = parseFloat(editPrice);
    
    if (isNaN(price) || price <= 0) {
      showToast('Price must be a valid positive number', 'error');
      return;
    }

    updateInventoryItem(id, { price });
    setEditingRowId(null);
    setEditPrice('');
    showToast('Price updated successfully', 'success');
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditPrice('');
  };

  // Handle delete inventory
  const handleDeleteInventory = async (id, bookName) => {
    const confirmed = await confirm(
      'Remove Book from Store',
      `Are you sure you want to remove "${bookName}" from this store's inventory?`
    );
    
    if (confirmed) {
      deleteInventoryItem(id);
      showToast(`"${bookName}" removed from inventory`, 'success');
    }
  };

  // Validate new inventory form
  const validateInventory = () => {
    const newErrors = {};
    
    if (!newInventory.book_id) {
      newErrors.book_id = 'Please select a book';
    }
    
    const price = parseFloat(newInventory.price);
    if (!newInventory.price || isNaN(price) || price <= 0) {
      newErrors.price = 'Price must be a valid positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle add new inventory
  const handleAddInventory = () => {
    if (!validateInventory()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    addInventoryItem({
      store_id: parseInt(storeId, 10),
      book_id: parseInt(newInventory.book_id),
      price: parseFloat(newInventory.price)
    });

    const selectedBook = books.find(b => b.id === parseInt(newInventory.book_id));
    showToast(`"${selectedBook?.name}" added to inventory`, 'success');
    
    setNewInventory({ book_id: '', price: '' });
    setBookSearchTerm('');
    setErrors({});
    setShowModal(false);
  };

  // Open modal
  const openModal = () => {
    if (!isAuthenticated) {
      showToast('Please sign in to add books to inventory', 'warning');
      return;
    }
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setNewInventory({ book_id: '', price: '' });
    setBookSearchTerm('');
    setErrors({});
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!currentStore) {
    return (
      <div className="py-6 px-4">
        <h2 className="text-2xl font-bold text-gray-800">Store Not Found</h2>
        <p className="text-gray-600 mt-2">The requested store does not exist.</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex mb-4 w-full justify-center items-center gap-4">
        <button
          onClick={() => setActiveTab('books')}
          className={`px-6 border-b-2 py-2 font-medium transition-colors ${
            activeTab === 'books' 
              ? 'border-b-main text-main' 
              : 'border-b-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Books
        </button>
        <button
          onClick={() => setActiveTab('authors')}
          className={`px-6 border-b-2 py-2 font-medium transition-colors ${
            activeTab === 'authors' 
              ? 'border-b-main text-main' 
              : 'border-b-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          By Authors
        </button>
      </div>

      <Header 
        addNew={isAuthenticated ? openModal : null} 
        title={`${currentStore.name} - Inventory`} 
        buttonTitle="Add to inventory" 
      />

      {activeTab === 'books' ? (
        filteredInventory.length > 0 ? (
          <Table data={filteredInventory} columns={booksColumns} />
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-600 text-lg">No books found in this store.</p>
            {isAuthenticated && (
              <button
                onClick={openModal}
                className="mt-4 bg-main text-white px-6 py-2 rounded-md hover:bg-main/90 transition-colors"
              >
                Add Your First Book
              </button>
            )}
          </div>
        )
      ) : (
        <div className="p-4">
          {inventoryByAuthor.length > 0 ? (
            inventoryByAuthor.map((authorGroup) => (
              <div key={authorGroup.author_id || 'unknown'} className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3 border-b pb-2">
                  {authorGroup.author_name}
                </h3>
                <Table data={authorGroup.books} columns={booksColumns} />
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-600 text-lg">No authors with books in this store.</p>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={handleConfirmCancel}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <Modal
        title="Add Book to Inventory"
        save={handleAddInventory}
        cancel={closeModal}
        show={showModal}
        setShow={setShowModal}
      >
        <div className="flex flex-col gap-4 w-full">
          <div>
            <label htmlFor="book_select" className="block text-gray-700 font-medium mb-1">
              Select Book <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Search books..."
              value={bookSearchTerm}
              onChange={(e) => setBookSearchTerm(e.target.value)}
              className="border border-gray-300 rounded p-2 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              id="book_select"
              value={newInventory.book_id}
              onChange={(e) => {
                setNewInventory({ ...newInventory, book_id: e.target.value });
                if (errors.book_id) setErrors({ ...errors, book_id: '' });
              }}
              className={`border ${
                errors.book_id ? 'border-red-500' : 'border-gray-300'
              } rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-invalid={!!errors.book_id}
              aria-describedby={errors.book_id ? 'book-error' : undefined}
            >
              <option value="">Select a book</option>
              {filteredAvailableBooks.map((book) => {
                const author = authors.find(a => a.id === book.author_id);
                return (
                  <option key={book.id} value={book.id}>
                    {book.name} - {author ? `${author.first_name} ${author.last_name}` : 'Unknown'}
                  </option>
                );
              })}
            </select>
            {errors.book_id && (
              <span id="book-error" className="text-red-500 text-sm mt-1">
                {errors.book_id}
              </span>
            )}
            {bookSearchTerm && filteredAvailableBooks.length === 0 && (
              <p className="text-gray-500 text-sm mt-1">No books found matching "{bookSearchTerm}"</p>
            )}
          </div>

          <div>
            <label htmlFor="price" className="block text-gray-700 font-medium mb-1">
              Price <span className="text-red-500">*</span>
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={newInventory.price}
              onChange={(e) => {
                setNewInventory({ ...newInventory, price: e.target.value });
                if (errors.price) setErrors({ ...errors, price: '' });
              }}
              className={`border ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              } rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter Price (e.g., 29.99)"
              aria-invalid={!!errors.price}
              aria-describedby={errors.price ? 'price-error' : undefined}
            />
            {errors.price && (
              <span id="price-error" className="text-red-500 text-sm mt-1">
                {errors.price}
              </span>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StoreInventory;
