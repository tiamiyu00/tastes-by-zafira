import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, openCart } = useCart();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      <button
        className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}
        onClick={() => navigate('/')}
        aria-label="Home"
      >
        <span className="bottom-nav-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </span>
        <span className="bottom-nav-label">Home</span>
      </button>

      <button
        className={`bottom-nav-item ${isActive('/menu') ? 'active' : ''}`}
        onClick={() => navigate('/menu')}
        aria-label="Menu"
      >
        <span className="bottom-nav-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8h1a4 4 0 010 8h-1" />
            <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
            <line x1="6" y1="1" x2="6" y2="4" />
            <line x1="10" y1="1" x2="10" y2="4" />
            <line x1="14" y1="1" x2="14" y2="4" />
          </svg>
        </span>
        <span className="bottom-nav-label">Menu</span>
      </button>

      <button
        className="bottom-nav-item bottom-nav-cart-item"
        onClick={openCart}
        aria-label={`Cart — ${cartCount} items`}
      >
        <span className="bottom-nav-icon bottom-nav-cart-bubble">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          {cartCount > 0 && (
            <span className="bottom-nav-badge">{cartCount > 99 ? '99+' : cartCount}</span>
          )}
        </span>
        <span className="bottom-nav-label">Cart</span>
      </button>
    </nav>
  );
};

export default BottomNav;
