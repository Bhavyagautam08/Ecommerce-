"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/order.service";
import styles from "./page.module.css";

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

const STATUS_COLORS = {
  pending: "badge-pending",
  confirmed: "badge-confirmed",
  processing: "badge-processing",
  shipped: "badge-shipped",
  delivered: "badge-delivered",
  cancelled: "badge-cancelled",
};

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    if (!user) return;
    orderService
      .getById(orderId)
      .then(setOrder)
      .catch(() => setError("Order not found"))
      .finally(() => setLoading(false));
  }, [orderId, user]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    setCancelError("");
    try {
      const updated = await orderService.cancel(orderId);
      setOrder(updated);
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  if (!user) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">🔐</div>
            <h3>Sign in to view this order</h3>
            <Link href="/login" className="btn btn-primary">Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-center">
          <div className="spinner spinner-lg" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">😕</div>
            <h3>Order not found</h3>
            <Link href="/orders" className="btn btn-primary">Back to Orders</Link>
          </div>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === "cancelled";
  const canCancel = !["shipped", "delivered", "cancelled"].includes(order.status);
  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/orders" className={styles.breadcrumbLink}>← My Orders</Link>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>#{order._id.slice(-8).toUpperCase()}</span>
        </div>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Order #{order._id.slice(-8).toUpperCase()}</h1>
            <p className={styles.date}>
              Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                weekday: "long", day: "numeric", month: "long", year: "numeric"
              })}
            </p>
          </div>
          <div className={styles.headerActions}>
            <span className={`badge ${STATUS_COLORS[order.status] || "badge-pending"}`} style={{ fontSize: 13, padding: "6px 16px" }}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="btn btn-danger"
              >
                {cancelling ? (
                  <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Cancelling...</>
                ) : "Cancel Order"}
              </button>
            )}
          </div>
        </div>

        {cancelError && (
          <div className="alert alert-error" style={{ marginBottom: 24 }}>⚠️ {cancelError}</div>
        )}

        {/* Stepper (not shown for cancelled) */}
        {!isCancelled && (
          <div className={styles.stepper}>
            {STATUS_STEPS.map((step, i) => (
              <div
                key={step}
                className={`${styles.step} ${i <= currentStep ? styles.stepDone : ""} ${i === currentStep ? styles.stepCurrent : ""}`}
              >
                <div className={styles.stepDot}>
                  {i < currentStep ? "✓" : i + 1}
                </div>
                <span className={styles.stepLabel}>{step.charAt(0).toUpperCase() + step.slice(1)}</span>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`${styles.stepLine} ${i < currentStep ? styles.stepLineDone : ""}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {isCancelled && (
          <div className="alert alert-error" style={{ marginBottom: 24 }}>
            ❌ This order has been cancelled.
          </div>
        )}

        <div className={styles.layout}>
          {/* Items */}
          <div>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Order Items</h2>
              <div className={styles.itemsList}>
                {order.items?.map((item, i) => {
                  const img = item.product?.images?.[0] ||
                    `https://placehold.co/72x72/16161f/7c3aed?text=${encodeURIComponent(item.name?.slice(0, 1) || "P")}`;
                  return (
                    <div key={i} className={styles.orderItem}>
                      <div className={styles.itemImg}>
                        <img src={img} alt={item.name}
                          onError={(e) => { e.target.src = "https://placehold.co/72x72/16161f/7c3aed?text=P"; }} />
                      </div>
                      <div className={styles.itemDetails}>
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.itemUnit}>₹{item.price?.toLocaleString("en-IN")} × {item.quantity}</span>
                      </div>
                      <span className={styles.itemSubtotal}>₹{item.subtotal?.toLocaleString("en-IN")}</span>
                    </div>
                  );
                })}
              </div>
              <div className="divider" />
              <div className={styles.totalRow}>
                <span>Order Total</span>
                <span className={styles.totalAmt}>₹{order.totalAmount?.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Shipping */}
            <div className={`${styles.sectionCard} ${styles.shippingCard}`}>
              <h2 className={styles.sectionTitle}>📍 Shipping Address</h2>
              <div className={styles.address}>
                <strong>{order.shippingAddress?.fullName}</strong>
                <span>{order.shippingAddress?.addressLine}</span>
                <span>{order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}</span>
                <span>📞 {order.shippingAddress?.phone}</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Payment</h2>
              <div className={styles.payRow}>
                <span className={styles.payLabel}>Status</span>
                <span className={`badge badge-${order.paymentStatus}`}>
                  {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                </span>
              </div>
              <div className={styles.payRow}>
                <span className={styles.payLabel}>Method</span>
                <span className={styles.payValue}>Cash on Delivery</span>
              </div>
              <div className={styles.payRow}>
                <span className={styles.payLabel}>Amount</span>
                <span className={styles.payAmount}>₹{order.totalAmount?.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
