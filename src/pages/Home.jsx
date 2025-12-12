import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../pages/Loading';
import StoreCard from '../components/Cards/StoreCard';
import BookCard from '../components/Cards/BookCard';
import AuthorCard from '../components/Cards/AuthorCard';
import { useLibrary } from '../context/LibraryContext';

const Home = () => {
  const {
    stores,
    authors,
    books,
    inventory,
    isLoading,
  } = useLibrary();

  const storesWithMetrics = useMemo(() => {
    return stores.slice(0, 5).map((store) => { 
      const storeInventory = inventory.filter(
        (item) => item.store_id === store.id
      );
      const noOfBooks = storeInventory.length;
      const totalPrice = storeInventory.reduce((sum, item) => sum + item.price, 0);
      const averagePrice = noOfBooks > 0 ? totalPrice / noOfBooks : 0;

      return {
        id: store.id,
        name: store.name,
        noOfBooks,
        averagePrice,
      };
    });
  }, [stores, inventory]);

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

  const limitedBooksWithStores = booksWithStores.slice(0, 5);

  const authorsWithBookCount = useMemo(() => {
    return authors.slice(0, 5).map((author) => { 
      const noOfBooks = books.filter((book) => book.author_id === author.id).length;
      return {
        id: author.id,
        name: `${author.first_name} ${author.last_name}`,
        noOfBooks,
      };
    });
  }, [authors, books]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="py-6 px-4">
      {/* Stores Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Stores</h2>
          <Link 
            to="/browse-stores" 
            className="bg-main text-white px-4 py-2 rounded-md hover:bg-main/90 transition-colors"
          >
            View All
          </Link>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4">
          {storesWithMetrics.map((store) => (
            <div key={store.id} className="flex-shrink-0">
              <StoreCard
                name={store.name}
                noOfBooks={store.noOfBooks}
                averagePrice={store.averagePrice}
                id={store.id}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Books Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Books</h2>
          <Link 
            to="/browse-books" 
            className="bg-main text-white px-4 py-2 rounded-md hover:bg-main/90 transition-colors"
          >
            View All
          </Link>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4">
          {limitedBooksWithStores.map((book) => (
            <div key={book.id} className="flex-shrink-0">
              <BookCard
                title={book.title}
                author={book.author}
                stores={book.stores}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Authors Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Authors</h2>
          <Link 
            to="/browse-authors" 
            className="bg-main text-white px-4 py-2 rounded-md hover:bg-main/90 transition-colors"
          >
            View All
          </Link>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4">
          {authorsWithBookCount.map((author) => (
            <div key={author.id} className="flex-shrink-0">
              <AuthorCard
                name={author.name}
                noOfBooks={author.noOfBooks}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;