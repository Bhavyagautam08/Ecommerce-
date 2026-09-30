"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { productService } from "@/services/product.service";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import styles from "./page.module.css";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    productService
      .getById(id)
      .then((data) => setProduct(data.product))
      .catch(() => setError("Product not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setAdding(true);
    setError("");
    try {
      await addToCart(product._id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className={styles.skeleton}>
            <div className={`skeleton ${styles.skeletonImg}`} />
            <div className={styles.skeletonInfo}>
              {[80, 50, 100, 60, 40].map((w, i) => (
                <div key={i} className="skeleton" style={{ height: 20, width: `${w}%`, marginBottom: 12 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">😕</div>
            <h3>Product not found</h3>
            <p>The product you&apos;re looking for doesn&apos;t exist or was removed.</p>
            <Link href="/products" className="btn btn-primary">Browse Products</Link>
          </div>
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : ["https://placehold.co/600x500/16161f/7c3aed?text=No+Image"];
  const isOutOfStock = product.stock === 0;

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSep}>›</span>
          <Link href="/products" className={styles.breadcrumbLink}>Products</Link>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>{product.name}</span>
        </div>

        <div className={`${styles.detail} animate-fade-in`}>
          {/* Images */}
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              <img
                src={images[activeImg]}
                alt={product.name}
                className={styles.mainImg}
                onError={(e) => { e.target.src = "https://placehold.co/600x500/16161f/7c3aed?text=No+Image"; }}
              />
              {isOutOfStock && (
                <div className={styles.outOfStockOverlay}>Out of Stock</div>
              )}
            </div>
            {images.length > 1 && (
              <div className={styles.thumbnails}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ""}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`}
                      onError={(e) => { e.target.src = "https://placehold.co/80x80/16161f/7c3aed?text=Img"; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className={styles.info}>
            <div className={styles.topMeta}>
              <span className={styles.categoryTag}>{product.category}</span>
              {product.brand && <span className={styles.brand}>{product.brand}</span>}
            </div>

            <h1 className={styles.productName}>{product.name}</h1>

            <div className={styles.priceRow}>
              <span className={styles.price}>₹{product.price?.toLocaleString("en-IN")}</span>
              <span className={`${styles.stockBadge} ${isOutOfStock ? styles.outStock : styles.inStock}`}>
                {isOutOfStock ? "Out of Stock" : `${product.stock} in stock`}
              </span>
            </div>

            <p className={styles.description}>{product.description}</p>

            <div className="divider" />

            {!isOutOfStock && (
              <div className={styles.quantityRow}>
                <span className={styles.qtyLabel}>Quantity</span>
                <div className={styles.qtyControls}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >−</button>
                  <span className={styles.qtyValue}>{quantity}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                  >+</button>
                </div>
              </div>
            )}

            {error && <div className="alert alert-error">{error}</div>}

            <div className={styles.ctaBtns}>
              <button
                onClick={handleAddToCart}
                disabled={adding || isOutOfStock}
                className={`btn btn-primary btn-lg ${styles.addBtn} ${added ? styles.addedBtn : ""}`}
              >
                {adding ? (
                  <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Adding...</>
                ) : added ? "✓ Added to Cart!" : isOutOfStock ? "Out of Stock" : "🛒 Add to Cart"}
              </button>
              {user && (
                <Link href="/cart" className="btn btn-secondary btn-lg">
                  View Cart
                </Link>
              )}
            </div>

            {/* Features */}
            <div className={styles.features}>
              {[
                { icon: "🚚", text: "Free delivery on orders above ₹500" },
                { icon: "🔄", text: "Easy 7-day returns" },
                { icon: "🛡️", text: "1 year warranty" },
              ].map((f) => (
                <div key={f.icon} className={styles.feature}>
                  <span>{f.icon}</span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
