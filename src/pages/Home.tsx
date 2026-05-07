import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import FoodCard from '../components/FoodCard';
import PromoSection from '../components/PromoSection';
import type { MenuItem } from '../types';
import { fetchMenuItems } from '../lib/api';

const Home = () => {
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenuItems()
      .then((data) => { setAllItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const popularItems = allItems.filter((i) => i.popular && i.available);
  const chefsItems = allItems.filter((i) => i.chefsSpecial && i.available);
  const totalAvailable = allItems.filter((i) => i.available).length;

  const skeletons = [...Array(4)].map((_, i) => (
    <div key={i} className="popular-scroll-item">
      <div className="food-card skeleton-card" />
    </div>
  ));

  return (
    <main>
      <Hero itemCount={totalAvailable || undefined} />

      {/* Popular Items */}
      <section className="popular-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Popular Items</h2>
            <button className="section-view-all" onClick={() => navigate('/menu')}>View All →</button>
          </div>

          {loading ? (
            <div className="popular-scroll">{skeletons}</div>
          ) : popularItems.length === 0 ? (
            <p className="no-items-text">No popular items available right now.</p>
          ) : (
            <div className="popular-scroll">
              {popularItems.map((item) => (
                <div key={item.id} className="popular-scroll-item">
                  <FoodCard item={item} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Chef's Specials */}
      {(loading || chefsItems.length > 0) && (
        <section className="chefs-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Chef's Specials</h2>
              <button className="section-view-all" onClick={() => navigate('/menu')}>View All →</button>
            </div>

            {loading ? (
              <div className="popular-scroll">{skeletons}</div>
            ) : (
              <div className="popular-scroll">
                {chefsItems.map((item) => (
                  <div key={item.id} className="popular-scroll-item">
                    <FoodCard item={item} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <PromoSection />

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <img
                src="/assets/Tastes_by_Zafira_logo_design__1_-removebg-preview.png"
                alt="Tastes by Zafira"
                className="footer-logo"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              <p className="footer-tagline">Home food, the Zafira way</p>
            </div>
            <div className="footer-links">
              <button className="footer-link" onClick={() => navigate('/')}>Home</button>
              <button className="footer-link" onClick={() => navigate('/menu')}>Menu</button>
            </div>
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} Tastes by Zafira. Made with ❤️</p>
        </div>
      </footer>
    </main>
  );
};

export default Home;
