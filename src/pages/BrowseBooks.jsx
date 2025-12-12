// src/pages/BrowseBooks.jsx
import { useMemo } from 'react';
import { useLibrary } from '../context/LibraryContext';
import Loading from '../pages/Loading';
import BookCard from '../components/Cards/BookCard';

const BrowseBooks = () => {
  // Use the LibraryContext
  const { books, authors, stores, inventory, isLoading } = useLibrary();

  // Create a memoized value for booksWithStores
  const booksWithStores = useMemo(() => {
    return books.map((book) => {
      const bookInventory = inventory.filter((item) => item.book_id === book.id);
      const bookStores = bookInventory.map((item) => {
        const store = stores.find(s => s.id === item.store_id);
        return {
          name: store?.name || 'Unknown Store',
          price: item.price,
        };
      });

      const author = authors.find(a => a.id === book.author_id);
      return {
        id: book.id,
        title: book.name,
        author: author ? `${author.first_name} ${author.last_name}` : 'Unknown Author',
        stores: bookStores,
      };
    });
  }, [books, inventory, authors, stores]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="py-6 px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Browse All Books</h2>
      <div className="flex flex-wrap gap-6 ">
        {booksWithStores.map((book) => (
          <BookCard
            key={book.id}
            title={book.title}
            author={book.author}
            stores={book.stores}
          />
        ))}
      </div>
    </div>
  );
};

export default BrowseBooks;