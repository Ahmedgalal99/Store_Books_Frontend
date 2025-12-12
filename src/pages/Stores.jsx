import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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

const Stores = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { stores, isLoading, addStore, updateStore, deleteStore: removeStore } = useLibrary();
  const { confirmState, confirm, handleCancel: handleConfirmCancel } = useConfirm();
  const { toast, showToast, hideToast } = useToast();
  
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [editingRowId, setEditingRowId] = useState(null);
  const [editName, setEditName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    address: '',
  });
  const [errors, setErrors] = useState({});

  const handleViewStoreInventory = (storeId) => {
    navigate(`/store/${storeId}`);
  };

  // Sync search term with URL query parameters
  useEffect(() => {
    const search = searchParams.get('search') || '';
    setSearchTerm(search);
  }, [searchParams]);

  // Enrich stores with computed address and filter based on search term
  const filteredStores = useMemo(() => {
    const enrichedStores = stores.map((store) => ({
      ...store,
      full_address: `${store.address_1}${store.address_2 ? `, ${store.address_2}` : ''}, ${store.city}, ${store.state} ${store.zip}`,
    }));

    if (!searchTerm.trim()) return enrichedStores;

    const lowerSearch = searchTerm.toLowerCase();
    return enrichedStores.filter((store) =>
      Object.values(store).some((value) =>
        String(value).toLowerCase().includes(lowerSearch)
      )
    );
  }, [stores, searchTerm]);

  // Define table columns
  const columns = useMemo(
    () => {
      const baseColumns = [
        { header: 'Store Id', accessorKey: 'id' },
        {
          header: 'Name',
          accessorKey: 'name',
          cell: ({ row }) =>
            editingRowId === row.original.id && isAuthenticated ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave(row.original.id);
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                className="border border-gray-300 rounded p-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            ) : (
              row.original.name
            ),
        },
        { header: 'Address', accessorKey: 'full_address' },
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
                  ? handleCancelEdit
                  : () => handleEdit(row.original)
              }
              onDelete={() => handleDeleteStore(row.original.id, row.original.name)}
            />
          ),
        });
      }

      return baseColumns;
    },
    [editingRowId, editName, isAuthenticated]
  );

  // Handle store deletion
  const handleDeleteStore = async (id, name) => {
    const confirmed = await confirm(
      'Delete Store',
      `Are you sure you want to delete "${name}"?`
    );
    
    if (confirmed) {
      removeStore(id);
      setEditingRowId(null);
      setEditName('');
      showToast(`"${name}" deleted successfully`, 'success');
    }
  };

  // Initiate editing
  const handleEdit = (store) => {
    setEditingRowId(store.id);
    setEditName(store.name);
  };

  // Save edited name
  const handleSave = (id) => {
    if (!editName.trim()) {
      showToast('Store name cannot be empty', 'error');
      return;
    }

    updateStore(id, { name: editName });
    setEditingRowId(null);
    setEditName('');
    showToast('Store updated successfully', 'success');
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditName('');
  };

  // Modal controls
  const openModal = () => {
    if (!isAuthenticated) {
      showToast('Please sign in to add stores', 'warning');
      return;
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setNewStore({ name: '', address: '' });
    setErrors({});
  };

  // Parse address to extract address_1, address_2, city, state, and zip
  const parseAddress = (address) => {
    if (!address || address.trim() === '') {
      return { address_1: '', address_2: '', city: '', state: '', zip: '' };
    }

    const parts = address.split(',').map((part) => part.trim());

    if (parts.length < 3) {
      return { address_1: address, address_2: '', city: '', state: '', zip: '' };
    }

    // Last part should be "state zip"
    const lastPart = parts[parts.length - 1].trim();
    const stateZipMatch = lastPart.match(/(\w+)\s+(\d{5})/);
    let state = '';
    let zip = '';
    if (stateZipMatch) {
      state = stateZipMatch[1];
      zip = stateZipMatch[2];
    } else {
      state = lastPart;
      zip = '';
    }

    const city = parts[parts.length - 2];
    const address_1 = parts[0];
    const address_2 = parts.length > 3 ? parts[1] : '';

    return { address_1, address_2, city, state, zip };
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!newStore.name.trim()) {
      newErrors.name = 'Store name is required';
    }
    
    if (!newStore.address.trim()) {
      newErrors.address = 'Address is required';
    } else {
      const { city, state, zip } = parseAddress(newStore.address);
      if (!city || !state || !zip) {
        newErrors.address = 'Address must include city, state, and zip (e.g., "123 Main St, Athens, GA 30605")';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add new store
  const handleAddNew = () => {
    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    const { address_1, address_2, city, state, zip } = parseAddress(newStore.address);

    addStore({
      name: newStore.name,
      address_1,
      address_2,
      city,
      state,
      zip,
    });

    showToast(`"${newStore.name}" added successfully`, 'success');
    setNewStore({ name: '', address: '' });
    setErrors({});
    closeModal();
  };

  const onRowClick = (e, row) => {
    handleViewStoreInventory(row.id);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="py-6">
      <Header addNew={isAuthenticated ? openModal : null} title="Stores List" />
      <Table data={filteredStores} columns={columns} onRowClick={onRowClick} />
      
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
        title="New Store"
        save={handleAddNew}
        cancel={closeModal}
        show={showModal}
        setShow={setShowModal}
      >
        <div className="flex flex-col gap-4 w-full">
          <div>
            <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
              Store Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={newStore.name}
              onChange={(e) => {
                setNewStore({ ...newStore, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              className={`border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter Store Name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <span id="name-error" className="text-red-500 text-sm mt-1">
                {errors.name}
              </span>
            )}
          </div>
          <div>
            <label htmlFor="address" className="block text-gray-700 font-medium mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              id="address"
              type="text"
              value={newStore.address}
              onChange={(e) => {
                setNewStore({ ...newStore, address: e.target.value });
                if (errors.address) setErrors({ ...errors, address: '' });
              }}
              className={`border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="e.g., 123 Main St, Athens, GA 30605"
              aria-invalid={!!errors.address}
              aria-describedby={errors.address ? 'address-error' : undefined}
            />
            {errors.address && (
              <span id="address-error" className="text-red-500 text-sm mt-1">
                {errors.address}
              </span>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Stores;
