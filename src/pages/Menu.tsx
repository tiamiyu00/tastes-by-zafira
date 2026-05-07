import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FoodCard from '../components/FoodCard';
import type { MenuItem, Category } from '../types';

const CATEGORIES: Array<'All' | Category> = [
  'All',
  'Food Class',
  'Pastries',
  'Desserts',
  'Yogurt Master Class',
  'Drink Class',
  'Cake Class',
  'Soup Class',
];

const CATEGORY_ICONS: Record<string, string> = {
  'All': '🍽️',
  'Food Class': '🍚',
  'Pastries': '🥐',
  'Desserts': '🍮',
  'Yogurt Master Class': '🥛',
  'Drink Class': '🥤',
  'Cake Class': '🎂',
  'Soup Class': '🍲',
};

const Menu = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const activeCategory = (searchParams.get('category') ?? 'All') as 'All' | Category;

  useEffect(() => {
    fetch('/api/menu')
      .then((r) => r.json())
      .then((data: MenuItem[]) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const setCategory = (cat: 'All' | Category) => {
    setSearch('');
    if (cat === 'All') setSearchParams({});
    else setSearchParams({ category: cat });
  };

  const filtered = items.filter((item) => {
    if (!item.available) return false;
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="menu-page">
      {/* Sticky search + category bar */}
      <div className="menu-sticky-bar">
        <div className="container">
          <div className="search-input-wrap">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              className="search-input"
              placeholder="Search meals, pastries, drinks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search menu"
            />
            {search && (
              <button className="search-clear" onClick={() => { setSearch(''); searchRef.current?.focus(); }} aria-label="Clear search">✕</button>
            )}
          </div>
        </div>

        <div className="category-tabs-wrap">
          <div className="category-tabs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
                aria-pressed={activeCategory === cat}
              >
                <span className="category-tab-icon">{CATEGORY_ICONS[cat]}</span>
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container menu-body">
        {/* Section heading */}
        <div className="menu-section-heading">
          <div>
            <h2 className="menu-section-title">
              {activeCategory === 'All' ? 'All Items' : activeCategory}
            </h2>
            {!loading && (
              <p className="results-count">
                {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
                {search && ` matching "${search}"`}
              </p>
            )}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="food-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="food-card skeleton-card" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🍽️</div>
            <h3>No items found</h3>
            <p>Try a different category or search term</p>
            <button className="no-results-reset" onClick={() => { setSearch(''); setSearchParams({}); }}>
              Show all items
            </button>
          </div>
        ) : (
          <div className="food-grid">
            {filtered.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Menu;
