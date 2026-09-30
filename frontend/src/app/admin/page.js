"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { productService } from "@/services/product.service";
import { orderService } from "@/services/order.service";
import styles from "./page.module.css";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    Promise.all([
      productService.getAll({ limit: 1 }),
      orderService.getAll(),
    ]).then(([products, orders]) => {
      const revenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      setStats({
        products: products.pagination?.totalProducts || 0,
        orders: orders.length,
        revenue,
      });
      setRecentOrders(orders.slice(0, 5));
    }).catch(console.error)
    .finally(() => setLoadingData(false));
  }, [user]);

  if (loading || !user) return (
    <div className="page-wrapper">
      <div className="loading-center"><div className="spinner spinner-lg" /></div>
    </div>
  );

  if (user.role !== "admin") return null;

  const STATUS_COLORS = {
    pending: "badge-pending", confirmed: "badge-confirmed", processing: "badge-processing",
    shipped: "badge-shipped", delivered: "badge-delivered", cancelled: "badge-cancelled",
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className={styles.header}>
          <div>
            <div className={styles.adminTag}>
              <span>⚙️</span> Admin Dashboard
            </div>
            <h1 className={styles.title}>Welcome back, {user.name?.split(" ")[0]}!</h1>
            <p className={styles.subtitle}>Here&apos;s what&apos;s happening in your store</p>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          {[
            { label: "Total Products", value: stats.products, icon: "📦", color: "#7c3aed", href: "/admin/products" },
            { label: "Total Orders", value: stats.orders, icon: "📋", color: "#2563eb", href: "/admin/orders" },
            { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString("en-IN")}`, icon: "💰", color: "#059669", href: "/admin/orders" },
          ].map((stat) => (
            <Link key={stat.label} href={stat.href} className={styles.statCard}>
              <div className={styles.statIcon} style={{ "--stat-color": stat.color }}>{stat.icon}</div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>
                  {loadingData ? <span className="skeleton" style={{ width: 80, height: 24, display: "block" }} /> : stat.value}
                </span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionGrid}>
            <Link href="/admin/products" className={styles.actionCard}>
              <span className={styles.actionIcon}>📦</span>
              <div>
                <div className={styles.actionTitle}>Manage Products</div>
                <div className={styles.actionSub}>Add, edit or remove products</div>
              </div>
              <span className={styles.actionArrow}>→</span>
            </Link>
            <Link href="/admin/products/new" className={styles.actionCard}>
              <span className={styles.actionIcon}>➕</span>
              <div>
                <div className={styles.actionTitle}>Add New Product</div>
                <div className={styles.actionSub}>Create a new product listing</div>
              </div>
              <span className={styles.actionArrow}>→</span>
            </Link>
            <Link href="/admin/orders" className={styles.actionCard}>
              <span className={styles.actionIcon}>📋</span>
              <div>
                <div className={styles.actionTitle}>Manage Orders</div>
                <div className={styles.actionSub}>View and update order status</div>
              </div>
              <span className={styles.actionArrow}>→</span>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className={styles.recentOrders}>
          <div className="section-header">
            <h2 className={styles.sectionTitle}>Recent Orders</h2>
            <Link href="/admin/orders" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          {loadingData ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            <div className={styles.orderTable}>
              <div className={styles.tableHeader}>
                <span>Order ID</span>
                <span>Customer</span>
                <span>Amount</span>
                <span>Status</span>
                <span>Date</span>
              </div>
              {recentOrders.map((order) => (
                <Link key={order._id} href={`/admin/orders`} className={styles.tableRow}>
                  <span className={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</span>
                  <span className={styles.customer}>{order.user?.name || order.user?.email || "—"}</span>
                  <span className={styles.amount}>₹{order.totalAmount?.toLocaleString("en-IN")}</span>
                  <span>
                    <span className={`badge ${STATUS_COLORS[order.status] || "badge-pending"}`}>
                      {order.status}
                    </span>
                  </span>
                  <span className={styles.date}>
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
