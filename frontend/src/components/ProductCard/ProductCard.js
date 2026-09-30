"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { router.push("/login"); return; }
    setAdding(true);
    try {
      await addToCart(product._id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error("Add to cart error:", err.message);
    } finally {
      setAdding(false);
    }
  };

  const imageUrl = product.images?.[0] ||
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600";
  const alternateImageUrl = product.images?.[1];
  const isOutOfStock = product.stock === 0;

  return (
    <Link
      href={`/products/${product._id}`}
      className={styles.card}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className={styles.imageWrapper}>
        <img
          src={hovered && alternateImageUrl ? alternateImageUrl : imageUrl}
          alt={product.name}
          className={styles.image}
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600"; }}
        />

        {/* Tags */}
        {isOutOfStock && <div className={styles.soldOut}>SOLD OUT</div>}
        {!isOutOfStock && product.stock <= 5 && (
          <div className={styles.limitedBadge}>LIMITED</div>
        )}

        {/* Hover overlay with CTA */}
        <div className={`${styles.overlay} ${hovered ? styles.overlayVisible : ""}`}>
          <button
            onClick={handleAddToCart}
            disabled={adding || isOutOfStock}
            className={`${styles.addBtn} ${added ? styles.addBtnSuccess : ""}`}
          >
            {adding ? (
              <span className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }} />
            ) : added ? (
              "✓ Added"
            ) : isOutOfStock ? (
              "Sold Out"
            ) : (
              "Add to Bag"
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.category}>{product.category?.toUpperCase()}</div>
        <h3 className={styles.name}>{product.name}</h3>
        <div className={styles.priceRow}>
          <span className={styles.price}>₹{product.price?.toLocaleString("en-IN")}</span>
          {product.stock > 0 && product.stock <= 10 && (
            <span className={styles.stockHint}>{product.stock} left</span>
          )}
        </div>
      </div>
    </Link>
  );
}
