import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import usrImg from '../assets/usr.png'

const Topbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const path = location.pathname;
  
  // Function to get title based on path pattern
  const getPageInfo = () => {
    if (path === '/') {
      return { title: 'Shop', subtitle: 'Shop > Books' };
    } else if (path === '/stores') {
      return { title: 'Stores', subtitle: 'Admin > Stores' };
    } else if (path === '/authors') {
      return { title: 'Authors', subtitle: 'Admin > Authors' };
    } else if (path === '/books') {
      return { title: 'Books', subtitle: 'Admin > Books' };
    } else if (path.startsWith('/store/')) {
      return { title: 'Store Inventory', subtitle: 'Admin > Store Inventory' };
    } else if (path === '/browse-books') {
      return { title: 'Browse Books', subtitle: 'Shop > Books' };
    } else if (path === '/browse-authors') {
      return { title: 'Browse Authors', subtitle: 'Shop > Authors' };
    } else if (path === '/browse-stores') {
      return { title: 'Browse Stores', subtitle: 'Shop > Stores' };
    }
    return { title: '', subtitle: '' };
  };

  const pageInfo = getPageInfo();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className='h-24 border-b border-b-secondary-text flex justify-between items-center'>
      <div className='flex flex-col justify-start items-start '>
        <p className='text-lg text-secondary-text'>{pageInfo.title}</p>
        <p className='font-light text-secondary-text'>{pageInfo.subtitle}</p>
      </div>
      <div className='flex-1 flex justify-end items-center gap-4'>
        {isAuthenticated ? (
          <>
            <div className='flex items-center gap-2'>
              <img src={usrImg} alt="User profile" className='w-10 h-10 rounded-full' />
              <p className='text-secondary-text font-medium text-sm'>{user?.name || 'Admin'}</p>
            </div>
            <button
              onClick={handleLogout}
              className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors text-sm'
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className='bg-main text-white px-4 py-2 rounded hover:bg-main/90 transition-colors text-sm'
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  )
}

export default Topbar