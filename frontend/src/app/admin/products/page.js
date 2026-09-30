"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { productService } from "@/services/product.service";
import styles from "./page.module.css";

export default function AdminProductsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    if (!user || user.role !== "admin") return;
    setLoadingData(true);
    try {
      const params = { page, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      const data = await productService.getAll(params);
      setProducts(data.products || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingData(false);
    }
  }, [page, debouncedSearch, user]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (productId, productName) => {
    if (!confirm(`Delete "${productName}"? This cannot be undone.`)) return;
    setDeletingId(productId);
    setError("");
    try {
      await productService.delete(productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading || !user) return (
    <div className="page-wrapper"><div className="loading-center"><div className="spinner spinner-lg" /></div></div>
  );

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Product Management</h1>
            <p className={styles.subtitle}>
              {pagination ? `${pagination.totalProducts} total products` : ""}
            </p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/admin" className="btn btn-ghost">← Dashboard</Link>
            <Link href="/admin/products/new" className="btn btn-primary">+ New Product</Link>
          </div>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

        {/* Search */}
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={`form-input ${styles.searchInput}`}
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        {loadingData ? (
          <div className="loading-center"><div className="spinner spinner-lg" /></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No products found</h3>
            <Link href="/admin/products/new" className="btn btn-primary">Add First Product</Link>
          </div>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>Product</span>
              <span>Category</span>
              <span>Price</span>
              <span>Stock</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {products.map((p) => {
              const img = p.images?.[0] || `https://placehold.co/48x48/16161f/7c3aed?text=${encodeURIComponent(p.name?.slice(0, 1) || "P")}`;
              return (
                <div key={p._id} className={styles.tableRow}>
                  <div className={styles.productCell}>
                    <div className={styles.productImg}>
                      <img src={img} alt={p.name}
                        onError={(e) => { e.target.src = "https://placehold.co/48x48/16161f/7c3aed?text=P"; }} />
                    </div>
                    <div className={styles.productInfo}>
                      <span className={styles.productName}>{p.name}</span>
                      <span className={styles.productBrand}>{p.brand || "—"}</span>
                    </div>
                  </div>
                  <span className={styles.cell}>
                    <span className="badge badge-processing" style={{ fontSize: 11 }}>{p.category}</span>
                  </span>
                  <span className={`${styles.cell} ${styles.price}`}>
                    ₹{p.price?.toLocaleString("en-IN")}
                  </span>
                  <span className={styles.cell} style={{ color: p.stock === 0 ? "var(--danger)" : p.stock < 10 ? "var(--warning)" : "var(--success)" }}>
                    {p.stock}
                  </span>
                  <span className={styles.cell}>
                    <span className={`badge ${p.isActive !== false ? "badge-delivered" : "badge-cancelled"}`}>
                      {p.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </span>
                  <div className={styles.actions}>
                    <Link href={`/admin/products/${p._id}/edit`} className="btn btn-ghost btn-sm">
                      ✏️ Edit
                    </Link>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(p._id, p.name)}
                      disabled={deletingId === p._id}
                    >
                      {deletingId === p._id
                        ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                        : "🗑️"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
            <span className={styles.pageInfo}>{page} / {pagination.totalPages}</span>
            <button className="btn btn-secondary btn-sm" disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
