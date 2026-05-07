import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { createOrder } from '../lib/api';
import type { OrderDetails } from '../types';

interface Props {
  onClose: () => void;
}

const CheckoutModal = ({ onClose }: Props) => {
  const { cartItems, subtotal, clearCart, closeCart } = useCart();
  const { settings } = useSettings();
  const deliveryFee = settings.deliveryFee;
  const grandTotal = subtotal + deliveryFee;

  const [form, setForm] = useState<OrderDetails>({ name: '', phone: '', address: '', notes: '' });
  const [errors, setErrors] = useState<Partial<OrderDetails>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e: Partial<OrderDetails> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    if (!form.address.trim()) e.address = 'Delivery address is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    // Save order to Supabase (silently — don't block if it fails)
    try {
      await createOrder({
        customer_name: form.name,
        customer_phone: form.phone,
        customer_address: form.address,
        notes: form.notes,
        items: cartItems.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        subtotal,
        delivery_fee: deliveryFee,
        total: grandTotal,
        status: 'pending',
      });
    } catch {
      // Continue even if DB save fails
    }

    // Build WhatsApp message
    const itemLines = cartItems
      .map((i, idx) => `${idx + 1}. ${i.name} x${i.quantity} — ₦${(i.price * i.quantity).toLocaleString()}`)
      .join('\n');

    const message = [
      `🍽️ NEW ORDER — ${settings.storeName}`,
      '',
      `------ CUSTOMER DETAILS ------`,
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `Address: ${form.address}`,
      form.notes ? `Notes: ${form.notes}` : '',
      '',
      `------ ORDER ITEMS ------`,
      itemLines,
      '',
      `Subtotal: ₦${subtotal.toLocaleString()}`,
      `Delivery Fee: ₦${deliveryFee.toLocaleString()}`,
      `TOTAL: ₦${grandTotal.toLocaleString()}`,
    ]
      .filter(Boolean)
      .join('\n');

    const whatsappNumber = settings.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');

    setSubmitting(false);
    setSubmitted(true);
  };

  const handleDone = () => {
    clearCart();
    closeCart();
    onClose();
  };

  // ——— Success screen ———
  if (submitted) {
    return (
      <div className="modal-backdrop" onClick={handleDone}>
        <div className="modal-container" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
          <div className="checkout-success">
            <div className="checkout-success-icon">✓</div>
            <h2 className="checkout-success-title">Order Sent!</h2>
            <p className="checkout-success-subtitle">
              Your order has been sent to <strong>{settings.storeName}</strong> via WhatsApp.
              They'll confirm and reach out to you on <strong>{form.phone}</strong>.
            </p>
            <div className="checkout-success-items">
              {cartItems.map((item) => (
                <span key={item.id} className="checkout-success-item-chip">
                  {item.name} ×{item.quantity}
                </span>
              ))}
            </div>
            <p className="checkout-success-total">Total: ₦{grandTotal.toLocaleString()}</p>
            <button className="checkout-success-btn" onClick={handleDone}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title">Complete Your Order</h2>

        <div className="modal-body">
          {/* Form */}
          <div className="checkout-form">
            <h3 className="form-section-title">Delivery Details</h3>

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                className={`form-input ${errors.name ? 'error' : ''}`}
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                className={`form-input ${errors.phone ? 'error' : ''}`}
                type="tel"
                placeholder="e.g. 08012345678"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              {errors.phone && <span className="form-error">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Address *</label>
              <textarea
                className={`form-input form-textarea ${errors.address ? 'error' : ''}`}
                placeholder="Enter your full delivery address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
              />
              {errors.address && <span className="form-error">{errors.address}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Additional Notes</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Any special requests or instructions?"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="checkout-summary">
            <h3 className="form-section-title">Order Summary</h3>
            <div className="summary-items">
              {cartItems.map((item) => (
                <div key={item.id} className="summary-item">
                  <span className="summary-item-name">
                    {item.name} <span className="summary-qty">×{item.quantity}</span>
                  </span>
                  <span className="summary-item-price">₦{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="summary-divider" />

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>₦{deliveryFee.toLocaleString()}</span>
            </div>

            <div className="summary-divider" />

            <div className="summary-row total">
              <span>Grand Total</span>
              <span>₦{grandTotal.toLocaleString()}</span>
            </div>

            <button className="whatsapp-btn" onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="drop-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Sending…
                </span>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 2.118.549 4.107 1.508 5.843L0 24l6.335-1.508A11.933 11.933 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.794 9.794 0 01-5.031-1.383l-.361-.214-3.741.891.907-3.649-.236-.374A9.793 9.793 0 012.182 12C2.182 6.579 6.579 2.182 12 2.182S21.818 6.579 21.818 12 17.421 21.818 12 21.818z"/>
                  </svg>
                  Send Order via WhatsApp
                </>
              )}
            </button>

            <p className="whatsapp-note">
              You'll be redirected to WhatsApp to send your order to {settings.storeName}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
