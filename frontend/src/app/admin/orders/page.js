"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/order.service";
import styles from "./page.module.css";

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    
    orderService.getAll()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoadingData(false));
  }, [user]);

  const handleStatusChange = async (orderId, newStatus) => {
    if (!confirm(`Update order status to ${newStatus}?`)) return;
    setUpdatingId(orderId);
    try {
      const updatedOrder = await orderService.updateStatus(orderId, newStatus);
      setOrders(orders.map(o => o._id === orderId ? updatedOrder : o));
    } catch (error) {
      alert(error.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading || !user) return <div className="page-wrapper"><div className="loading-center"><div className="spinner spinner-lg" /></div></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Order Management</h1>
            <p className={styles.subtitle}>{orders.length} total orders</p>
          </div>
          <Link href="/admin" className="btn btn-ghost">← Dashboard</Link>
        </div>

        {loadingData ? (
          <div className="loading-center"><div className="spinner spinner-lg" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No orders found</h3>
          </div>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>Order ID</span>
              <span>Customer</span>
              <span>Total</span>
              <span>Status</span>
              <span>Payment</span>
              <span>Date</span>
            </div>
            
            {orders.map((order) => (
              <div key={order._id} className={styles.tableRow}>
                <div className={styles.orderId}>
                  #{order._id.slice(-8).toUpperCase()}
                  <div className={styles.itemsCount}>{order.items?.length || 0} items</div>
                </div>
                
                <div className={styles.customer}>
                  <div className={styles.customerName}>{order.user?.name || "Unknown"}</div>
                  <div className={styles.customerEmail}>{order.user?.email || "—"}</div>
                </div>
                
                <div className={styles.amount}>₹{order.totalAmount?.toLocaleString("en-IN")}</div>
                
                <div className={styles.statusCell}>
                  <select
                    className={`form-select ${styles.statusSelect}`}
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    disabled={updatingId === order._id || order.status === "cancelled"}
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                  {updatingId === order._id && <span className="spinner" style={{ width: 14, height: 14 }} />}
                </div>
                
                <div>
                  <span className={`badge badge-${order.paymentStatus}`}>{order.paymentStatus}</span>
                </div>
                
                <div className={styles.dateCell}>
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
