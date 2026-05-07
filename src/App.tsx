import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Cart from './components/Cart';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <CartProvider>
          <Routes>
            <Route path="/admin" element={<Admin />} />
            <Route
              path="/*"
              element={
                <>
                  <Navbar />
                  <Cart />
                  <div className="page-content">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/menu" element={<Menu />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                  <BottomNav />
                </>
              }
            />
          </Routes>
        </CartProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}

export default App;
