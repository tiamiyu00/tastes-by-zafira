import { useState } from 'react';
import type { MenuItem } from '../types';
import { useCart } from '../context/CartContext';

interface Props {
  item: MenuItem;
}

const FoodCard = ({ item }: Props) => {
  const { addToCart, openCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = () => {
    addToCart(item, qty);
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 1500);
    setQty(1);
  };

  return (
    <div className="food-card">
      <div className="food-card-image-wrap">
        {imgError ? (
          <div className="food-card-img-placeholder">
            <span>{item.name[0]}</span>
          </div>
        ) : (
          <img
            src={item.image}
            alt={item.name}
            className="food-card-img"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}
        <div className="food-card-badges">
          {item.popular && <span className="badge badge-popular">Popular</span>}
          {item.chefsSpecial && <span className="badge badge-chef">Chef's Special</span>}
        </div>
      </div>

      <div className="food-card-body">
        <h3 className="food-card-name">{item.name}</h3>
        {item.description && <p className="food-card-description">{item.description}</p>}
        <p className="food-card-category">{item.category}</p>
        <p className="food-card-price">₦{item.price.toLocaleString()}</p>

        <div className="food-card-actions">
          <div className="qty-controls">
            <button
              className="qty-btn"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="qty-value">{qty}</span>
            <button
              className="qty-btn"
              onClick={() => setQty((q) => q + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            className={`add-cart-btn ${added ? 'added' : ''}`}
            onClick={handleAddToCart}
          >
            {added ? '✓ Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
