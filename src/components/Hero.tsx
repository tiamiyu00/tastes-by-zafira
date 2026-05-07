import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      {/* Blurred food background */}
      <img
        className="hero-bg-img"
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&auto=format&q=80"
        alt=""
        aria-hidden="true"
      />
      <div className="hero-bg-overlay" />

      <div className="hero-bg-circles">
        <div className="hero-circle circle-1" />
        <div className="hero-circle circle-2" />
        <div className="hero-circle circle-3" />
      </div>

      <div className="hero-content">
        <div className="hero-logo-wrap">
          <img
            src="/assets/Tastes_by_Zafira_logo_design__1_-removebg-preview.png"
            alt="Tastes by Zafira"
            className="hero-logo"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = 'none';
            }}
          />
        </div>

        <div className="hero-text">
          <h1 className="hero-heading">
            Home food,<br />
            <span className="hero-heading-accent">the Zafira way</span>
          </h1>
          <p className="hero-subtext">
            Freshly made Nigerian meals, pastries, snacks & drinks<br />
            delivered straight to your door with love ❤️
          </p>

          <div className="hero-cta-group">
            <button className="hero-cta-btn" onClick={() => navigate('/menu')}>
              Order Now
            </button>
            <div className="hero-delivery-badge">
              <span className="delivery-icon">🚀</span>
              <span>Fast Delivery to Your Door</span>
            </div>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-value">18+</span>
              <span className="stat-label">Menu Items</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="stat-value">100%</span>
              <span className="stat-label">Fresh & Homemade</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="stat-value">⭐ 5.0</span>
              <span className="stat-label">Customer Rated</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
