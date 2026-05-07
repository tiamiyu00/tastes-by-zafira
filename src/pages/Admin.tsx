import { useState, useEffect } from 'react';
import type { MenuItem, Category, Settings } from '../types';
import ImageUpload from '../components/ImageUpload';
import { fetchMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, fetchSettings, saveSettings } from '../lib/api';

const CATEGORIES: Category[] = [
  'Food Class',
  'Pastries',
  'Desserts',
  'Yogurt Master Class',
  'Drink Class',
  'Cake Class',
  'Soup Class',
];

const ADMIN_PASSWORD = 'zafira2024';

const blankItem = (): Omit<MenuItem, 'id'> => ({
  name: '',
  category: 'Food Class',
  price: 0,
  image: '',
  available: true,
  popular: false,
  chefsSpecial: false,
});

// ——— Item Modal (add / edit) ———
interface ItemModalProps {
  initial: Omit<MenuItem, 'id'> | MenuItem;
  mode: 'add' | 'edit';
  onSave: (data: Omit<MenuItem, 'id'> | MenuItem) => Promise<void>;
  onClose: () => void;
}

const ItemModal = ({ initial, mode, onSave, onClose }: ItemModalProps) => {
  const [form, setForm] = useState({ ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key: string, val: unknown) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Item name is required.'); return; }
    if (!form.price || form.price <= 0) { setError('Price must be greater than 0.'); return; }
    setSaving(true);
    setError('');
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container admin-item-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2 className="modal-title">{mode === 'add' ? 'Add New Item' : 'Edit Item'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="admin-modal-body">
          {/* Left col — image upload */}
          <div className="admin-modal-image-col">
            <ImageUpload value={form.image} onChange={(url) => set('image', url)} />
          </div>

          {/* Right col — fields */}
          <div className="admin-modal-fields-col">
            <div className="form-group">
              <label className="form-label">Item Name *</label>
              <input
                className="form-input"
                placeholder="e.g. Jollof Rice & Chicken"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </div>

            <div className="admin-modal-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={form.category}
                  onChange={(e) => set('category', e.target.value as Category)}
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Price (₦)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.price}
                  onChange={(e) => set('price', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="admin-modal-toggles">
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => set('available', e.target.checked)}
                />
                <span className="admin-toggle-track" />
                <span className="admin-toggle-label">Available on menu</span>
              </label>

              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={form.popular}
                  onChange={(e) => set('popular', e.target.checked)}
                />
                <span className="admin-toggle-track" />
                <span className="admin-toggle-label">Mark as Popular</span>
              </label>

              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={form.chefsSpecial}
                  onChange={(e) => set('chefsSpecial', e.target.checked)}
                />
                <span className="admin-toggle-track" />
                <span className="admin-toggle-label">Chef's Special</span>
              </label>
            </div>

            {error && <p className="form-error" style={{ marginTop: 8 }}>{error}</p>}

            <div className="admin-modal-actions">
              <button className="admin-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : mode === 'add' ? 'Add Item' : 'Save Changes'}
              </button>
              <button className="admin-cancel-btn" onClick={onClose}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ——— Main Admin Page ———
const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [items, setItems] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<Settings>({ whatsapp: '', deliveryFee: 1500, storeName: '' });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'menu' | 'settings'>('menu');

  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<MenuItem | null>(null);

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<'All' | Category>('All');

  const handleLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  useEffect(() => {
    if (!authenticated) return;
    Promise.all([fetchMenuItems(), fetchSettings()])
      .then(([menu, s]) => { setItems(menu); setSettings(s); setLoading(false); })
      .catch(() => setLoading(false));
  }, [authenticated]);

  const handleSaveItem = async (data: Omit<MenuItem, 'id'> | MenuItem) => {
    if (modalMode === 'add') {
      const created = await createMenuItem(data as Omit<MenuItem, 'id'>);
      setItems((prev) => [...prev, created]);
    } else if (editTarget) {
      const updated = await updateMenuItem(editTarget.id, data as Partial<Omit<MenuItem, 'id'>>);
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    }
    setModalMode(null);
    setEditTarget(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item? This cannot be undone.')) return;
    await deleteMenuItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const toggleAvailable = async (item: MenuItem) => {
    const updated = await updateMenuItem(item.id, { available: !item.available });
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    await saveSettings(settings);
    setSavingSettings(false);
    setSettingsMsg('✓ Settings saved!');
    setTimeout(() => setSettingsMsg(''), 2500);
  };

  const filteredItems = items.filter((item) => {
    const matchesCat = filterCat === 'All' || item.category === filterCat;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // ——— Login screen ———
  if (!authenticated) {
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <img
            src="/assets/Tastes_by_Zafira_logo_design__1_-removebg-preview.png"
            alt="Tastes by Zafira"
            className="admin-login-logo"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          <h1 className="admin-login-title">Admin Panel</h1>
          <p className="admin-login-subtitle">Enter your password to continue</p>
          <div className="form-group">
            <input
              type="password"
              className={`form-input ${passwordError ? 'error' : ''}`}
              placeholder="Admin password"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            {passwordError && <span className="form-error">{passwordError}</span>}
          </div>
          <button className="admin-login-btn" onClick={handleLogin}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      {/* Top bar */}
      <div className="admin-topbar">
        <div className="admin-topbar-inner container">
          <h1 className="admin-topbar-title">Admin — Tastes by Zafira</h1>
          <button className="admin-logout-btn" onClick={() => setAuthenticated(false)}>Logout</button>
        </div>
      </div>

      <div className="container admin-body">
        {/* Tabs */}
        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
            Menu Items
          </button>
          <button className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            Store Settings
          </button>
        </div>

        {/* ——— MENU TAB ——— */}
        {activeTab === 'menu' && (
          <div className="admin-menu-section">
            <div className="admin-section-header">
              <div>
                <h2>Menu Items <span className="admin-count-badge">{items.length}</span></h2>
              </div>
              <button className="admin-add-btn" onClick={() => setModalMode('add')}>
                + Add New Item
              </button>
            </div>

            {/* Filter bar */}
            <div className="admin-filter-bar">
              <div className="search-input-wrap" style={{ padding: 0, maxWidth: 280 }}>
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search items…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ fontSize: '0.85rem', padding: '9px 36px' }}
                />
                {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
              </div>

              <select
                className="form-input admin-cat-filter"
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value as 'All' | Category)}
              >
                <option value="All">All categories</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {loading ? (
              <p className="admin-loading">Loading menu…</p>
            ) : (
              <div className="admin-cards-grid">
                {filteredItems.map((item) => (
                  <div key={item.id} className={`admin-item-card ${!item.available ? 'card-unavailable' : ''}`}>
                    <div className="admin-item-card-img-wrap">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="admin-item-card-img"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '';
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="admin-item-card-img-fallback hidden">
                        {item.name[0]}
                      </div>
                      {!item.available && (
                        <div className="admin-card-hidden-overlay">Hidden</div>
                      )}
                    </div>

                    <div className="admin-item-card-body">
                      <div className="admin-item-card-top">
                        <span className="admin-category-badge">{item.category}</span>
                        <div className="admin-card-badges">
                          {item.popular && <span className="badge badge-popular small">Popular</span>}
                          {item.chefsSpecial && <span className="badge badge-chef small">Chef's</span>}
                        </div>
                      </div>
                      <h3 className="admin-item-card-name">{item.name}</h3>
                      <p className="admin-item-card-price">₦{item.price.toLocaleString()}</p>
                    </div>

                    <div className="admin-item-card-footer">
                      <button
                        className={`admin-toggle-avail-btn ${item.available ? 'avail-on' : 'avail-off'}`}
                        onClick={() => toggleAvailable(item)}
                        title={item.available ? 'Click to hide from menu' : 'Click to show on menu'}
                      >
                        {item.available ? '● Active' : '● Hidden'}
                      </button>
                      <div className="admin-card-actions">
                        <button
                          className="admin-edit-btn"
                          onClick={() => { setEditTarget(item); setModalMode('edit'); }}
                        >
                          Edit
                        </button>
                        <button className="admin-delete-btn" onClick={() => handleDelete(item.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredItems.length === 0 && !loading && (
                  <p className="admin-empty">No items match your filter.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ——— SETTINGS TAB ——— */}
        {activeTab === 'settings' && (
          <div className="admin-settings-section">
            <h2>Store Settings</h2>
            <div className="admin-settings-form">
              <div className="form-group">
                <label className="form-label">Store Name</label>
                <input className="form-input" value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp Number (with country code)</label>
                <input className="form-input" type="tel" value={settings.whatsapp}
                  placeholder="+2348000000000"
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Delivery Fee (₦)</label>
                <input className="form-input" type="number" value={settings.deliveryFee}
                  onChange={(e) => setSettings({ ...settings, deliveryFee: Number(e.target.value) })} />
              </div>
              <div className="admin-form-actions">
                <button className="admin-save-btn" onClick={handleSaveSettings} disabled={savingSettings}>
                  {savingSettings ? 'Saving…' : 'Save Settings'}
                </button>
                {settingsMsg && <span className="settings-success">{settingsMsg}</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ——— Add / Edit Modal ——— */}
      {modalMode && (
        <ItemModal
          mode={modalMode}
          initial={modalMode === 'edit' && editTarget ? editTarget : blankItem()}
          onSave={handleSaveItem}
          onClose={() => { setModalMode(null); setEditTarget(null); }}
        />
      )}
    </div>
  );
};

export default Admin;
