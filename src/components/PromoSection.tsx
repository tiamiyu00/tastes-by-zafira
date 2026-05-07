import { useNavigate } from 'react-router-dom';

const PromoSection = () => {
  const navigate = useNavigate();

  return (
    <section className="promo-section">
      <div className="container">
        <div className="promo-grid">
          <div className="promo-card promo-card-main">
            <div className="promo-card-content">
              <span className="promo-tag">🔥 Limited Offer</span>
              <h2 className="promo-heading">Super Delicious<br />Nigerian Meals</h2>
              <p className="promo-text">
                Jollof, egusi, pounded yam and more — made fresh daily
                with authentic flavours from the heart.
              </p>
              <button className="promo-btn" onClick={() => navigate('/menu')}>
                Explore Meals
              </button>
            </div>
            <div className="promo-card-image">
              <img
                src="https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=300&h=280&fit=crop"
                alt="Jollof Rice"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
          </div>

          <div className="promo-card promo-card-secondary">
            <div className="promo-card-content">
              <span className="promo-tag">🍩 Fresh Bakes</span>
              <h2 className="promo-heading">Pastries &<br />Bakes Daily</h2>
              <p className="promo-text">
                Meat pies, banana bread, doughnuts — baked fresh every morning!
              </p>
              <button className="promo-btn" onClick={() => navigate('/menu?category=Pastries')}>
                Shop Pastries
              </button>
            </div>
            <div className="promo-card-image">
              <img
                src="https://images.unsplash.com/photo-1551024506-0bccd828d730?w=250&h=220&fit=crop"
                alt="Doughnuts"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
          </div>

          <div className="promo-card promo-card-accent">
            <div className="promo-delivery-content">
              <div className="delivery-icon-big">🚀</div>
              <h3 className="promo-delivery-title">Fast Delivery</h3>
              <p className="promo-delivery-text">We deliver to your door. Flat ₦1,500 delivery fee.</p>
              <div className="delivery-features">
                <span>✅ Same-day delivery</span>
                <span>✅ Carefully packaged</span>
                <span>✅ WhatsApp ordering</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
