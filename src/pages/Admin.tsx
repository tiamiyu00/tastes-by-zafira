import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { MenuItem, Category, Settings, Order, OrderStatus } from '../types';
import ImageUpload from '../components/ImageUpload';
import {
  fetchMenuItems, createMenuItem, updateMenuItem, deleteMenuItem,
  fetchSettings, saveSettings,
  fetchOrders, updateOrderStatus,
  signIn, signOut, getSession, subscribeAuthChanges,
} from '../lib/api';

const CATEGORIES: Category[] = [
  'Food Class', 'Pastries', 'Desserts', 'Yogurt Master Class',
  'Drink Class', 'Cake Class', 'Soup Class',
];

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;

const blankItem = (): Omit<MenuItem, 'id'> => ({
  name: '', description: '', category: 'Food Class', price: 0,
  image: '', available: true, popular: false, chefsSpecial: false,
});

// ——— Item Modal ———
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
    try {
      await onSave(form);
    } catch {
      setError('Failed to save. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container admin-item-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2 className="modal-title">{mode === 'add' ? 'Add New Item' : 'Edit Item'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="admin-modal-body">
          <div className="admin-modal-image-col">
            <ImageUpload value={form.image} onChange={(url) => set('image', url)} />
          </div>

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

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Describe the dish — ingredients, taste, portion size…"
                value={form.description ?? ''}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
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
                <input type="checkbox" checked={form.available} onChange={(e) => set('available', e.target.checked)} />
                <span className="admin-toggle-track" />
                <span className="admin-toggle-label">Available on menu</span>
              </label>
              <label className="admin-toggle">
                <input type="checkbox" checked={form.popular} onChange={(e) => set('popular', e.target.checked)} />
                <span className="admin-toggle-track" />
                <span className="admin-toggle-label">Mark as Popular</span>
              </label>
              <label className="admin-toggle">
                <input type="checkbox" checked={form.chefsSpecial} onChange={(e) => set('chefsSpecial', e.target.checked)} />
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
  // Auth
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [lockCountdown, setLockCountdown] = useState(0);

  // Data
  const [items, setItems] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<Settings>({ whatsapp: '', deliveryFee: 1500, storeName: '' });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'menu' | 'settings' | 'orders'>('menu');

  // Menu tab state
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<MenuItem | null>(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<'All' | Category>('All');

  // Settings tab state
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');

  // Orders tab state
  const [orderFilter, setOrderFilter] = useState<'all' | OrderStatus>('all');

  // Auth — check session on mount
  useEffect(() => {
    getSession().then((s) => { setSession(s); setAuthChecked(true); });
    const sub = subscribeAuthChanges((s) => setSession(s));
    return () => sub.unsubscribe();
  }, []);

  // Lockout countdown
  useEffect(() => {
    if (!lockedUntil) return;
    const id = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) { setLockCountdown(0); setLockedUntil(0); }
      else setLockCountdown(remaining);
    }, 500);
    return () => clearInterval(id);
  }, [lockedUntil]);

  // Load data once authenticated
  useEffect(() => {
    if (!session) return;
    setLoading(true);
    Promise.all([fetchMenuItems(), fetchSettings(), fetchOrders()])
      .then(([menu, s, orderList]) => {
        setItems(menu);
        setSettings(s);
        setOrders(orderList);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session]);

  const handleLogin = async () => {
    if (Date.now() < lockedUntil) return;
    if (!email.trim() || !password) { setLoginError('Please enter your email and password.'); return; }
    setLoginLoading(true);
    setLoginError('');
    try {
      await signIn(email.trim(), password);
      setFailedAttempts(0);
    } catch {
      const next = failedAttempts + 1;
      setFailedAttempts(next);
      if (next >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_MS;
        setLockedUntil(until);
        setLockCountdown(Math.ceil(LOCKOUT_MS / 1000));
        setLoginError(`Too many failed attempts. Try again in ${Math.ceil(LOCKOUT_MS / 1000)} seconds.`);
      } else {
        setLoginError(`Invalid email or password. ${MAX_ATTEMPTS - next} attempt${MAX_ATTEMPTS - next === 1 ? '' : 's'} remaining.`);
      }
    } finally {
      setLoginLoading(false);
    }
  };

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
    setSettingsMsg('Settings saved!');
    setTimeout(() => setSettingsMsg(''), 2500);
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    try { await updateOrderStatus(orderId, status); } catch { /* silent */ }
  };

  const filteredItems = items.filter((item) => {
    const matchesCat = filterCat === 'All' || item.category === filterCat;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredOrders = orderFilter === 'all' ? orders : orders.filter((o) => o.status === orderFilter);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  const ORDER_STATUSES: Array<{ value: 'all' | OrderStatus; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  // ——— Loading (checking session) ———
  if (!authChecked) {
    return (
      <div className="admin-login">
        <div className="admin-login-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
          <div className="drop-spinner" />
        </div>
      </div>
    );
  }

  // ——— Login screen ———
  if (!session) {
    const isLocked = Date.now() < lockedUntil;
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
          <p className="admin-login-subtitle">Sign in to continue</p>

          <div className="form-group">
            <input
              type="email"
              className={`form-input ${loginError ? 'error' : ''}`}
              placeholder="Email address"
              value={email}
              autoComplete="email"
              disabled={isLocked || loginLoading}
              onChange={(e) => { setEmail(e.target.value); setLoginError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              className={`form-input ${loginError ? 'error' : ''}`}
              placeholder="Password"
              value={password}
              autoComplete="current-password"
              disabled={isLocked || loginLoading}
              onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4 }}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {loginError && (
            <p className="form-error" style={{ marginBottom: 8, textAlign: 'center' }}>
              {isLocked && lockCountdown > 0 ? `Too many attempts. Try again in ${lockCountdown}s.` : loginError}
            </p>
          )}

          <button className="admin-login-btn" onClick={handleLogin} disabled={isLocked || loginLoading}>
            {loginLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </div>
      </div>
    );
  }

  // ——— Admin panel ———
  return (
    <div className="admin-panel">
      <div className="admin-topbar">
        <div className="admin-topbar-inner container">
          <h1 className="admin-topbar-title">Admin — Tastes by Zafira</h1>
          <button className="admin-logout-btn" onClick={signOut}>Logout</button>
        </div>
      </div>

      <div className="container admin-body">
        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
            Menu Items <span className="admin-count-badge">{items.length}</span>
          </button>
          <button className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            Orders {pendingCount > 0 && <span className="admin-count-badge" style={{ background: '#ff4444', color: 'white', borderColor: '#ff4444' }}>{pendingCount}</span>}
          </button>
          <button className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            Settings
          </button>
        </div>

        {/* ——— MENU TAB ——— */}
        {activeTab === 'menu' && (
          <div className="admin-menu-section">
            <div className="admin-section-header">
              <h2>Menu Items</h2>
              <button className="admin-add-btn" onClick={() => setModalMode('add')}>+ Add New Item</button>
            </div>

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
                      <div className="admin-item-card-img-fallback hidden">{item.name[0]}</div>
                      {!item.available && <div className="admin-card-hidden-overlay">Hidden</div>}
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
                      {item.description && (
                        <p style={{ fontSize: '0.75rem', color: '#8888aa', margin: '2px 0 0', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.description}
                        </p>
                      )}
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
                        <button className="admin-edit-btn" onClick={() => { setEditTarget(item); setModalMode('edit'); }}>Edit</button>
                        <button className="admin-delete-btn" onClick={() => handleDelete(item.id)}>Delete</button>
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

        {/* ——— ORDERS TAB ——— */}
        {activeTab === 'orders' && (
          <div className="admin-orders-section">
            <div className="admin-section-header">
              <h2>Orders</h2>
            </div>

            <div className="admin-order-filters">
              {ORDER_STATUSES.map(({ value, label }) => (
                <button
                  key={value}
                  className={`admin-order-filter-btn ${orderFilter === value ? 'active' : ''}`}
                  onClick={() => setOrderFilter(value)}
                >
                  {label}
                  {value === 'pending' && pendingCount > 0 && (
                    <span className="order-filter-badge">{pendingCount}</span>
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="admin-loading">Loading orders…</p>
            ) : filteredOrders.length === 0 ? (
              <div className="admin-orders-empty">
                <div className="admin-orders-empty-icon">📋</div>
                <p>{orderFilter === 'all' ? 'No orders yet.' : `No ${orderFilter} orders.`}</p>
              </div>
            ) : (
              <div className="admin-order-list">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="admin-order-card">
                    <div className="admin-order-card-header">
                      <div>
                        <span className="order-ref">#{order.id.slice(-8).toUpperCase()}</span>
                        <span className="order-date">
                          {new Date(order.created_at).toLocaleDateString('en-NG', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <select
                        className={`order-status-select order-status-${order.status}`}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className="admin-order-card-customer">
                      <span className="order-customer-name">{order.customer_name}</span>
                      <span className="order-customer-phone">{order.customer_phone}</span>
                      <span className="order-customer-address">{order.customer_address}</span>
                      {order.notes && <span className="order-notes">Note: {order.notes}</span>}
                    </div>

                    <div className="admin-order-card-items">
                      {order.items.map((item, i) => (
                        <span key={i} className="order-item-chip">
                          {item.name} ×{item.quantity}
                        </span>
                      ))}
                    </div>

                    <div className="admin-order-card-footer">
                      <span>Subtotal: ₦{order.subtotal.toLocaleString()}</span>
                      <span>Delivery: ₦{order.delivery_fee.toLocaleString()}</span>
                      <span className="order-total">Total: ₦{order.total.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
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
