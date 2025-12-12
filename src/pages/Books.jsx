import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../hooks/useConfirm';
import { useToast } from '../hooks/useToast';
import Header from '../components/Header';
import Loading from './Loading';
import BooksTable from '../components/BooksTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog';
import Toast from '../components/Toast/Toast';

const Books = () => {
  const { books, authors, isLoading, addBook, updateBook, deleteBook: removeBook } = useLibrary();
  const { isAuthenticated } = useAuth();
  const { confirmState, confirm, handleCancel: handleConfirmCancel } = useConfirm();
  const { toast, showToast, hideToast } = useToast();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [editingRowId, setEditingRowId] = useState(null);
  const [editName, setEditName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newBook, setNewBook] = useState({
    author_id: '',
    name: '',
    page_count: '',
  });
  const [errors, setErrors] = useState({});

  // Sync search term with URL params
  useEffect(() => {
    const search = searchParams.get('search') || '';
    setSearchTerm(search);
  }, [searchParams]);

  // Filter books based on search (memoized)
  const filteredBooks = useMemo(() => {
    if (!searchTerm.trim()) return books;
    const lowerSearch = searchTerm.toLowerCase();
    return books.filter((book) =>
      Object.values(book).some((value) =>
        String(value).toLowerCase().includes(lowerSearch)
      )
    );
  }, [books, searchTerm]);

  // Delete book handler with confirmation dialog
  const deleteBook = async (id, name) => {
    const confirmed = await confirm(
      'Delete Book',
      `Are you sure you want to delete "${name}"?`
    );
    
    if (confirmed) {
      removeBook(id);
      setEditingRowId(null);
      setEditName('');
      showToast(`"${name}" deleted successfully`, 'success');
    }
  };

  // Validate new book form
  const validateBook = () => {
    const newErrors = {};
    
    if (!newBook.name.trim()) {
      newErrors.name = 'Book name is required';
    }
    
    if (!newBook.author_id) {
      newErrors.author_id = 'Please select an author';
    }
    
    if (!newBook.page_count || newBook.page_count <= 0) {
      newErrors.page_count = 'Page count must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add new book handler with validation
  const handleAddNew = () => {
    if (!validateBook()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    addBook({
      author_id: parseInt(newBook.author_id),
      name: newBook.name,
      page_count: parseInt(newBook.page_count),
    });

    setNewBook({ author_id: '', name: '', page_count: '' });
    setErrors({});
    setShowModal(false);
    showToast('Book added successfully', 'success');
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="py-6">
      <Header addNew={isAuthenticated ? () => setShowModal(true) : null} title="Books List" />
      <BooksTable
        books={filteredBooks}
        authors={authors}
        editingRowId={editingRowId}
        setEditingRowId={setEditingRowId}
        editName={editName}
        setEditName={setEditName}
        setBooks={updateBook}
        deleteBook={deleteBook}
        isAuthenticated={isAuthenticated}
      />
      
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
      
      {isAuthenticated && (
        <Modal
          title="New Book"
          save={handleAddNew}
          cancel={() => {
            setShowModal(false);
            setErrors({});
          }}
          show={showModal}
          setShow={setShowModal}
        >
          <div className="flex flex-col gap-4 w-full">
            <div>
              <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
                Book Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={newBook.name}
                onChange={(e) => setNewBook({ ...newBook, name: e.target.value })}
                className={`border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded p-2 w-full focus:outline-none focus:ring-2 ${errors.name ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                placeholder="Enter Book Name"
                required
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="page_count" className="block text-gray-700 font-medium mb-1">
                Number of Pages <span className="text-red-500">*</span>
              </label>
              <input
                id="page_count"
                type="number"
                min="1"
                value={newBook.page_count}
                onChange={(e) => setNewBook({ ...newBook, page_count: e.target.value })}
                className={`border ${errors.page_count ? 'border-red-500' : 'border-gray-300'} rounded p-2 w-full focus:outline-none focus:ring-2 ${errors.page_count ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                placeholder="Enter Page Count"
                required
                aria-invalid={!!errors.page_count}
                aria-describedby={errors.page_count ? 'page-error' : undefined}
              />
              {errors.page_count && (
                <p id="page-error" className="text-red-500 text-sm mt-1">{errors.page_count}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="author_id" className="block text-gray-700 font-medium mb-1">
                Author <span className="text-red-500">*</span>
              </label>
              <select
                id="author_id"
                value={newBook.author_id}
                onChange={(e) => setNewBook({ ...newBook, author_id: e.target.value })}
                className={`border ${errors.author_id ? 'border-red-500' : 'border-gray-300'} rounded p-2 w-full focus:outline-none focus:ring-2 ${errors.author_id ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                required
                aria-invalid={!!errors.author_id}
                aria-describedby={errors.author_id ? 'author-error' : undefined}
              >
                <option value="" disabled>Select an Author</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.first_name} {author.last_name}
                  </option>
                ))}
              </select>
              {errors.author_id && (
                <p id="author-error" className="text-red-500 text-sm mt-1">{errors.author_id}</p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Books;