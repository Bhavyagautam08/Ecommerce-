"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import CheckoutModal from "@/components/CheckoutModal/CheckoutModal";
import styles from "./page.module.css";

/* Suggested products shown in "You May Also Like" */
const suggestions = [
  {
    id: "s1",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=400",
    name: "Draped Coat",
  },
  {
    id: "s2",
    image: "https://images.unsplash.com/photo-1617317376997-8748e6862c01?auto=format&fit=crop&q=80&w=400",
    name: "Chromatic Dress",
  },
  {
    id: "s3",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400",
    name: "Archive Jacket",
  },
];

export default function CartPage() {
  const { cart, cartLoading, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [promoCode, setPromoCode] = useState("");

  /* ── Auth guard ── */
  if (!user) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <h2 className={styles.emptyTitle}>Sign in to view your bag</h2>
          <p className={styles.emptyText}>Your saved pieces will be waiting for you.</p>
          <Link href="/login" className={styles.primaryBtn}>SIGN IN</Link>
        </div>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.loadingState}>
          <div className={styles.loadingDots}>
            <span /><span /><span />
          </div>
          <p>Loading your bag...</p>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <h2 className={styles.emptyTitle}>Your bag is empty</h2>
          <p className={styles.emptyText}>Add some curated pieces to get started.</p>
          <Link href="/products" className={styles.primaryBtn}>EXPLORE COLLECTION</Link>
        </div>
      </div>
    );
  }

  const handleQuantityChange = async (productId, qty) => {
    setUpdatingId(productId);
    try { await updateQuantity(productId, qty); }
    catch (err) { console.error(err.message); }
    finally { setUpdatingId(null); }
  };

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    try { await removeFromCart(productId); }
    catch (err) { console.error(err.message); }
    finally { setRemovingId(null); }
  };

  const handleClearCart = async () => {
    if (!confirm("Remove all items from your bag?")) return;
    await clearCart();
  };

  const shippingFree = cartTotal >= 500;
  const tax = Math.round(cartTotal * 0.18);
  const shipping = shippingFree ? 0 : 50;
  const grandTotal = cartTotal + shipping + tax;

  return (
    <div className={styles.pageWrapper}>
      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div className={styles.breadcrumb}>
            <span>NO. 05</span>
            <span className={styles.breadcrumbSep}>—</span>
            <span>REVIEW &amp; CHECKOUT</span>
          </div>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>
              Your Bag <span className={styles.itemCount}>({items.length} item{items.length !== 1 ? "s" : ""})</span>
            </h1>
            <Link href="/products" className={styles.backLink}>
              → BACK TO SHOP
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.pageInner}>
        {/* ── Items Column ── */}
        <div className={styles.itemsCol}>
          {/* Table Header */}
          <div className={styles.tableHeader}>
            <span>PRODUCT</span>
            <span className={styles.thQty}>QTY</span>
            <span className={styles.thSubtotal}>SUBTOTAL</span>
          </div>

          {/* Item Rows */}
          <div className={styles.itemsList}>
            {items.map((item, index) => {
              const isUpdating = updatingId === item.product;
              const isRemoving = removingId === item.product;
              const img = item.productDetails?.images?.[0] ||
                `https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=200`;

              return (
                <div
                  key={item.product}
                  className={`${styles.itemRow} ${isRemoving ? styles.removing : ""}`}
                >
                  {/* Item Number */}
                  <div className={styles.itemNum}>
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  {/* Image */}
                  <div className={styles.itemImg}>
                    <img
                      src={img}
                      alt={item.name}
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=200"; }}
                    />
                  </div>

                  {/* Info */}
                  <div className={styles.itemInfo}>
                    {item.productDetails?.category && (
                      <div className={styles.itemCategory}>{item.productDetails.category.toUpperCase()}</div>
                    )}
                    <Link href={`/products/${item.product}`} className={styles.itemName}>
                      {item.name}
                    </Link>
                    <div className={styles.itemPriceEach}>
                      ₹{item.price?.toLocaleString("en-IN")} ea.
                    </div>
                  </div>

                  {/* Qty */}
                  <div className={styles.itemQty}>
                    <div className={styles.qtyControls}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => handleQuantityChange(item.product, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isUpdating}
                        aria-label="Decrease quantity"
                      >−</button>
                      <span className={styles.qtyVal}>
                        {isUpdating
                          ? <span className={styles.spinner} />
                          : item.quantity
                        }
                      </span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => handleQuantityChange(item.product, item.quantity + 1)}
                        disabled={isUpdating}
                        aria-label="Increase quantity"
                      >+</button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className={styles.itemSubtotal}>
                    ₹{item.subtotal?.toLocaleString("en-IN")}
                  </div>

                  {/* Remove */}
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemove(item.product)}
                    disabled={isRemoving}
                    aria-label="Remove item"
                  >
                    {isRemoving
                      ? <span className={styles.spinner} />
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    }
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className={styles.itemsFooter}>
            <button className={styles.removeAllBtn} onClick={handleClearCart}>
              REMOVE ALL
            </button>
            <Link href="/products" className={styles.continueLink}>
              ← CONTINUE SHOPPING
            </Link>
          </div>
        </div>

        {/* ── Summary Column ── */}
        <div className={styles.summaryCol}>
          {/* Order Summary Card */}
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>ORDER SUMMARY</h2>

            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Subtotal ({items.length} items)</span>
                <span className={styles.summaryAmt}>₹{cartTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span className={shippingFree ? styles.freeTag : styles.summaryAmt}>
                  {shippingFree ? "Free" : `₹${shipping}`}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span>Tax (18% GST)</span>
                <span className={styles.summaryAmt}>₹{tax.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>TOTAL</span>
              <span className={styles.totalAmt}>₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>

            {/* Promo Code */}
            <div className={styles.promoRow}>
              <input
                type="text"
                placeholder="Promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className={styles.promoInput}
              />
              <button className={styles.promoBtn}>APPLY</button>
            </div>

            {/* CTA */}
            <button
              className={styles.checkoutBtn}
              onClick={() => setShowCheckout(true)}
            >
              PROCEED TO CHECKOUT →
            </button>

            <Link href="/products" className={styles.continueShoppingBtn}>
              CONTINUE SHOPPING
            </Link>

            {/* Trust Badges */}
            <div className={styles.trustBadges}>
              {[
                "Free returns within 30 days",
                "Authenticity guaranteed",
                "Secure SSL checkout",
              ].map((txt) => (
                <div key={txt} className={styles.trustItem}>
                  <span className={styles.trustDot} />
                  <span>{txt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* You May Also Like */}
          <div className={styles.suggestionsCard}>
            <h3 className={styles.suggestionsTitle}>YOU MAY ALSO LIKE</h3>
            <div className={styles.suggestionsGrid}>
              {suggestions.map((s) => (
                <Link href="/products" key={s.id} className={styles.suggestionItem}>
                  <img src={s.image} alt={s.name} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          cartTotal={grandTotal}
        />
      )}
    </div>
  );
}
