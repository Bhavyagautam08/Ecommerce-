"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { label: "Women", href: "/products?category=Dresses" },
  { label: "Men", href: "/products?category=Tops" },
  { label: "Collections", href: "/collections" },
  { label: "Editorial", href: "/lookbook" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const pathname = usePathname();
  const isAdmin = user?.role === "admin";
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  useEffect(() => {
    if (!confirmSignOut) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setConfirmSignOut(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmSignOut]);

  return (
    <>
      {/* Top announcement bar */}
      <div className={styles.topBanner}>
        Complimentary shipping on orders over ₹5,000 &nbsp;·&nbsp; New collection now live
      </div>

      <nav className={styles.nav}>
        <div className={styles.inner}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>MAREN</Link>

          {/* Center nav links */}
          <ul className={styles.links}>
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.link} ${pathname.includes(item.label.toLowerCase()) ? styles.active : ""}`}
                >
                  {item.label.toUpperCase()}
                </Link>
              </li>
            ))}
            {isAdmin && (
              <li>
                <Link
                  href="/admin"
                  className={`${styles.link} ${styles.adminLink} ${pathname.startsWith("/admin") ? styles.active : ""}`}
                >
                  ADMIN
                </Link>
              </li>
            )}
          </ul>

          {/* Right actions */}
          <div className={styles.actions}>
            {/* Search icon */}
            <Link href="/products" className={styles.iconBtn} aria-label="Search products" title="Search products">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </Link>

            {/* Auth */}
            {user ? (
              <>
                <Link href="/orders" className={styles.iconBtn} aria-label="Orders">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                    <rect x="9" y="3" width="6" height="4" rx="1"/>
                    <path d="M9 12h6M9 16h4"/>
                  </svg>
                </Link>
                <button onClick={() => setConfirmSignOut(true)} className={styles.iconBtn} aria-label="Sign out" title={`Signed in as ${user.name}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </button>
              </>
            ) : (
              <Link href="/login" className={styles.signInBtn}>SIGN IN</Link>
            )}

            {/* Cart */}
            <Link href="/cart" className={styles.cartBtn} aria-label="Cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount > 9 ? "9+" : cartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </nav>
      {confirmSignOut && (
        <div
          className={styles.dialogBackdrop}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setConfirmSignOut(false);
          }}
        >
          <section
            className={styles.dialog}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="sign-out-title"
            aria-describedby="sign-out-description"
          >
            <p className={styles.dialogEyebrow}>YOUR MAREN ACCOUNT</p>
            <h2 id="sign-out-title" className={styles.dialogTitle}>Sign out?</h2>
            <p id="sign-out-description" className={styles.dialogCopy}>
              You can sign back in anytime to pick up where you left off.
            </p>
            <div className={styles.dialogActions}>
              <button autoFocus className={styles.dialogCancel} onClick={() => setConfirmSignOut(false)}>
                Stay signed in
              </button>
              <button
                className={styles.dialogConfirm}
                onClick={() => {
                  logout();
                  setConfirmSignOut(false);
                }}
              >
                Sign out
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
