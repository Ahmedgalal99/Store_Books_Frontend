import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../hooks/useConfirm';
import { useToast } from '../hooks/useToast';
import Header from '../components/Header';
import Loading from './Loading';
import Table from '../components/Table/Table';
import Modal from '../components/Modal';
import TableActions from '../components/ActionButton/TableActions';
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog';
import Toast from '../components/Toast/Toast';

const Authors = () => {
  const { authors, isLoading, addAuthor, updateAuthor, deleteAuthor: removeAuthor } = useLibrary();
  const { isAuthenticated } = useAuth();
  const { confirmState, confirm, handleCancel: handleConfirmCancel } = useConfirm();
  const { toast, showToast, hideToast } = useToast();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [editingRowId, setEditingRowId] = useState(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Sync searchTerm with query params
  useEffect(() => {
    const search = searchParams.get('search') || '';
    setSearchTerm(search);
  }, [searchParams]);

  // filter based on search
  const filteredAuthors = useMemo(() => {
    if (!searchTerm.trim()) return authors;
    const lowerSearch = searchTerm.toLowerCase();
    return authors.filter((author) =>
      Object.values(author).some((value) =>
        String(value).toLowerCase().includes(lowerSearch)
      )
    );
  }, [authors, searchTerm]);

  const columns = useMemo(
    () => {
      const baseColumns = [
        { header: 'ID', accessorKey: 'id' },
        {
          header: 'Name',
          accessorFn: (row) => `${row.first_name} ${row.last_name}`,
          id: 'name',
          cell: ({ row }) =>
            editingRowId === row.original.id && isAuthenticated ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave(row.original.id);
                  } else if (e.key === 'Escape') {
                    handleCancel();
                  }
                }}
                className="border border-gray-300 rounded p-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                tooltip="Enter to save"
              />
            ) : (
              `${row.original.first_name} ${row.original.last_name}`
            ),
        },
      ];

      // Only add Actions column if authenticated
      if (isAuthenticated) {
        baseColumns.push({
          header: 'Actions',
          id: 'actions',
          cell: ({ row }) => (
            <TableActions
              row={row}
              onEdit={
                editingRowId === row.original.id
                  ? handleCancel
                  : () => handleEdit(row.original)
              }
              onDelete={() => deleteAuthor(row.original.id, row.original.first_name, row.original.last_name)}
            />
          ),
        });
      }

      return baseColumns;
    },
    [editingRowId, editName, isAuthenticated]
  );

  const deleteAuthor = async (id, first_name, last_name) => {
    const confirmed = await confirm(
      'Delete Author',
      `Are you sure you want to delete ${first_name} ${last_name}?`
    );
    
    if (confirmed) {
      removeAuthor(id);
      setEditingRowId(null);
      setEditName('');
      setNewName('');
      showToast(`${first_name} ${last_name} deleted successfully`, 'success');
    }
  };

  const handleEdit = (author) => {
    setEditingRowId(author.id);
    setEditName(`${author.first_name} ${author.last_name}`);
  };

  const handleSave = (id) => {
    if (!editName.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }

    const [first_name, ...last_name_parts] = editName.trim().split(' ');
    const last_name = last_name_parts.join(' ');

    updateAuthor(id, {
      first_name,
      last_name: last_name || ''
    });

    setEditingRowId(null);
    setEditName('');
    showToast('Author updated successfully', 'success');
  };

  const handleCancel = () => {
    setEditingRowId(null);
    setEditName('');
  };

  const openModal = () => {
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
  };
  const handleAddNew = () => {
    if (newName.trim() === '') {
      showToast('Please enter a name', 'error');
      return;
    }
    const [first_name, ...last_name_parts] = newName.trim().split(' ');
    const last_name = last_name_parts.join(' ');

    addAuthor({
      first_name,
      last_name: last_name || '',
    });

    setNewName('');
    closeModal();
    showToast('Author added successfully', 'success');
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className='py-6'>
      <Header addNew={isAuthenticated ? openModal : null} title="Authors List" />
      <Table
        data={filteredAuthors}
        columns={columns}
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
      <Modal
        title={' New Author'}
        save={handleAddNew}
        cancel={closeModal}
        show={showModal}
        setShow={setShowModal}
      >
        <div className="flex flex-col gap-2 w-full">
          <span>Author Name</span>
          <input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="border border-gray-300 rounded p-1 ps-3 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
          <span className="hidden text-red-500">Please enter a name</span>
        </div>
      </Modal>
    </div>
  );
};

export default Authors;