"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/order.service";
import styles from "./page.module.css";

const STATUS_COLORS = {
  pending: "badge-pending",
  confirmed: "badge-confirmed",
  processing: "badge-processing",
  shipped: "badge-shipped",
  delivered: "badge-delivered",
  cancelled: "badge-cancelled",
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    orderService.getMyOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">🔐</div>
            <h3>Sign in to view orders</h3>
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

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="section-header">
          <div>
            <h1 className={styles.title}>My Orders</h1>
            <p className={styles.subtitle}>{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
          </div>
          <Link href="/products" className="btn btn-primary">
            Shop More
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Start shopping to see your orders here.</p>
            <Link href="/products" className="btn btn-primary btn-lg">Browse Products</Link>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {orders.map((order) => (
              <Link key={order._id} href={`/orders/${order._id}`} className={styles.orderCard}>
                <div className={styles.orderTop}>
                  <div className={styles.orderId}>
                    <span className={styles.orderLabel}>Order</span>
                    <span className={styles.orderNum}>#{order._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <span className={`badge ${STATUS_COLORS[order.status] || "badge-pending"}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                <div className={styles.orderMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Date</span>
                    <span className={styles.metaValue}>
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Items</span>
                    <span className={styles.metaValue}>{order.items?.length} item{order.items?.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Total</span>
                    <span className={`${styles.metaValue} ${styles.orderTotal}`}>
                      ₹{order.totalAmount?.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Payment</span>
                    <span className={`badge badge-${order.paymentStatus}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className={styles.orderProducts}>
                  {order.items?.slice(0, 3).map((item, i) => (
                    <span key={i} className={styles.productChip}>{item.name}</span>
                  ))}
                  {order.items?.length > 3 && (
                    <span className={styles.moreItems}>+{order.items.length - 3} more</span>
                  )}
                </div>

                <div className={styles.viewLink}>View Details →</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
