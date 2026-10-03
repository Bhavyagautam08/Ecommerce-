"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { orderService } from "@/services/order.service";
import { useCart } from "@/context/CartContext";
import styles from "./CheckoutModal.module.css";

export default function CheckoutModal({ onClose, cartTotal }) {
  const router = useRouter();
  const { fetchCart } = useCart();
  const idempotencyKey = useRef(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!idempotencyKey.current) {
        idempotencyKey.current = crypto.randomUUID();
      }

      const order = await orderService.create(form, idempotencyKey.current);
      await fetchCart(); // refresh cart count
      onClose();
      router.push(`/orders/${order._id}`);
    } catch (err) {
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Shipping Details</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.orderSummary}>
          <span className={styles.summaryLabel}>Order Total</span>
          <span className={styles.summaryAmount}>
            ₹{Math.round(cartTotal + (cartTotal >= 500 ? 0 : 50) + cartTotal * 0.18).toLocaleString("en-IN")}
          </span>
        </div>

        {error && <div className="alert alert-error" style={{ margin: "0 0 16px" }}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="form-input"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="addressLine">Address Line</label>
            <input
              id="addressLine"
              name="addressLine"
              type="text"
              className="form-input"
              placeholder="Flat no, Building, Street"
              value={form.addressLine}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.row}>
            <div className="form-group">
              <label className="form-label" htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                type="text"
                className="form-input"
                placeholder="Mumbai"
                value={form.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="state">State</label>
              <input
                id="state"
                name="state"
                type="text"
                className="form-input"
                placeholder="Maharashtra"
                value={form.state}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="pincode">Pincode</label>
              <input
                id="pincode"
                name="pincode"
                type="text"
                className="form-input"
                placeholder="400001"
                value={form.pincode}
                onChange={handleChange}
                required
                pattern="[0-9]{6}"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Placing Order...</>
            ) : "🎉 Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
