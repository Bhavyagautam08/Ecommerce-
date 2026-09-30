"use client";
import { Suspense } from "react";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard/ProductCard";
import { productService } from "@/services/product.service";
import styles from "./page.module.css";

const CATEGORIES = ["All", "Outerwear", "Dresses", "Sets", "Bottoms", "Tops", "Accessories", "Footwear"];
const SORT_OPTIONS = [
  { value: "newest",    label: "Newest First" },
  { value: "oldest",    label: "Oldest First" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc",label: "Price: High → Low" },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts]     = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState(searchParams.get("search") || "");
  const [category, setCategory]     = useState(searchParams.get("category") || "");
  const [sort, setSort]             = useState(searchParams.get("sort") || "newest");
  const [page, setPage]             = useState(Number(searchParams.get("page")) || 1);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (debouncedSearch) params.search = debouncedSearch;
      if (category && category !== "All") params.category = category;
      const data = await productService.getAll(params);
      setProducts(data.products || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }, [page, sort, debouncedSearch, category]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleCategoryChange = (cat) => { setCategory(cat === "All" ? "" : cat); setPage(1); };

  return (
    <div className={styles.wrapper}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInner}>
          <p className={styles.stepLabel}>NO. 03 — THE COLLECTION</p>
          <div className={styles.headerRow}>
            <h1 className={styles.pageTitle}>
              All <em>Products</em>
            </h1>
            <p className={styles.count}>
              {pagination ? `${pagination.totalProducts} pieces` : "—"}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.inner}>
        {/* Sidebar Filters */}
        <aside className={styles.sidebar}>
          {/* Search */}
          <div className={styles.sideSection}>
            <p className={styles.sideLabel}>SEARCH</p>
            <div className={styles.searchWrap}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.searchIcon}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                id="product-search"
                type="text"
                className={styles.searchInput}
                placeholder="Search pieces..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className={styles.clearBtn} onClick={() => setSearch("")}>✕</button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className={styles.sideSection}>
            <p className={styles.sideLabel}>CATEGORY</p>
            <div className={styles.catList}>
              {CATEGORIES.map((cat) => {
                const isActive = cat === "All" ? !category : category === cat;
                return (
                  <button
                    key={cat}
                    className={`${styles.catBtn} ${isActive ? styles.catBtnActive : ""}`}
                    onClick={() => handleCategoryChange(cat)}
                  >
                    {cat}
                    {isActive && <span className={styles.catDot} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort */}
          <div className={styles.sideSection}>
            <p className={styles.sideLabel}>SORT BY</p>
            <div className={styles.sortList}>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`${styles.sortBtn} ${sort === opt.value ? styles.sortBtnActive : ""}`}
                  onClick={() => { setSort(opt.value); setPage(1); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className={styles.gridArea}>
          {loading ? (
            <div className="grid-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={`skeleton ${styles.skeletonImg}`} />
                  <div style={{ padding: "12px 0", display: "flex", flexDirection: "column", gap: 8 }}>
                    <div className="skeleton" style={{ height: 10, width: "40%" }} />
                    <div className="skeleton" style={{ height: 14, width: "70%" }} />
                    <div className="skeleton" style={{ height: 12, width: "30%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyGlyph}>◇</div>
              <h3>No pieces found</h3>
              <p>Try adjusting your search or category filter.</p>
              <button className="btn btn-primary" onClick={() => { setSearch(""); setCategory(""); }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid-4 animate-fade-in">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageArrow}
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← PREV
              </button>
              <div className={styles.pageNumbers}>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - page) <= 2)
                  .map((p) => (
                    <button
                      key={p}
                      className={`${styles.pageNum} ${p === page ? styles.pageNumActive : ""}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
              </div>
              <button
                className={styles.pageArrow}
                disabled={page === pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                NEXT →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="loading-center">
        <div className="spinner spinner-lg" />
        <p style={{ color: "var(--text-muted)", fontSize: 12, letterSpacing: "0.1em" }}>LOADING COLLECTION...</p>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
