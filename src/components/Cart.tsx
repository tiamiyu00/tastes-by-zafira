import { useState } from 'react';
import { useCart } from '../context/CartContext';
import CheckoutModal from './CheckoutModal';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, subtotal, isCartOpen, closeCart, cartCount } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div className="cart-backdrop" onClick={closeCart} />
      )}

      {/* Slide-out cart */}
      <aside className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2 className="cart-title">
            Your Cart
            {cartCount > 0 && <span className="cart-count-badge">{cartCount}</span>}
          </h2>
          <button className="cart-close-btn" onClick={closeCart} aria-label="Close cart">
            ✕
          </button>
        </div>

        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛍️</div>
              <p>Your cart is empty</p>
              <span>Add some delicious items to get started!</span>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img-wrap">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="cart-item-details">
                  <p className="cart-item-name">{item.name}</p>
                  <p className="cart-item-price">₦{item.price.toLocaleString()}</p>
                  <div className="cart-item-controls">
                    <button
                      className="qty-btn small"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn small"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="cart-item-right">
                  <p className="cart-item-total">₦{(item.price * item.quantity).toLocaleString()}</p>
                  <button
                    className="cart-remove-btn"
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Remove item"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal">
              <span>Subtotal</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>
            <p className="cart-delivery-note">+ Delivery fee will be added at checkout</p>
            <button className="place-order-btn" onClick={() => setShowCheckout(true)}>
              Place Order
            </button>
          </div>
        )}
      </aside>

      {showCheckout && (
        <CheckoutModal onClose={() => setShowCheckout(false)} />
      )}
    </>
  );
};

export default Cart;
