import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { LibraryProvider } from './context/LibraryContext';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Loading from './pages/Loading';
import Login from './pages/Login';

// Lazy load components for route-based code splitting
const Home = lazy(() => import('./pages/Home'));
const Stores = lazy(() => import('./pages/Stores'));
const Books = lazy(() => import('./pages/Books'));
const Authors = lazy(() => import('./pages/Authors'));
const NotFound = lazy(() => import('./pages/NotFound'));
const StoreInventory = lazy(() => import('./pages/StoreInventory'));
const BrowseBooks = lazy(() => import('./pages/BrowseBooks'));
const BrowseAuthors = lazy(() => import('./pages/BrowseAuthors'));
const BrowseStores = lazy(() => import('./pages/BrowseStores'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LibraryProvider>
          <Router>
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* Public route - Login */}
                <Route path="/login" element={<Login />} />
                
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/browse-books" element={<BrowseBooks />} />
                  <Route path="/browse-authors" element={<BrowseAuthors />} />
                  <Route path="/browse-stores" element={<BrowseStores />} />
                  
                  <Route path="/stores" element={<Stores />} />
                  <Route path="/books" element={<Books />} />
                  <Route path="/authors" element={<Authors />} />
                  <Route path="/store/:storeId" element={<StoreInventory />} />
                  
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </Router>
        </LibraryProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;