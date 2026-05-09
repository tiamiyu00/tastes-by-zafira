import { useNavigate } from 'react-router-dom';

interface Props {
  itemCount?: number;
}

const Hero = ({ itemCount }: Props) => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <img
        className="hero-bg-img"
        src="https://images.unsplash.com/photo-1599354607448-8ad6e92b027a?q=80&w=1167&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>

        <div className="hero-text">
          <h1 className="hero-heading">
            Home food,<br />
            <span className="hero-heading-accent">the Zafira way</span>
          </h1>
          <p className="hero-subtext">
            Freshly made Nigerian & international meals, pastries, snacks & drinks<br />
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
              <span className="stat-value">{itemCount ? `${itemCount}+` : '—'}</span>
              <span className="stat-label">Menu Items</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="stat-value">100%</span>
              <span className="stat-label">Fresh & Homemade</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="stat-value">Same-day</span>
              <span className="stat-label">Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
