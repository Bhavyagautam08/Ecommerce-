"use client";
import Link from "next/link";
import styles from "./page.module.css";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?auto=format&fit=crop&q=80&w=800";

export default function Home() {
  const newArrivals = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800",
      category: "OUTERWEAR",
      name: "Structured Wool Blazer",
      price: 48500,
      tag: "NEW"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800",
      category: "DRESSES",
      name: "Silk Midi Dress",
      price: 32000,
      tag: "LIMITED"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?auto=format&fit=crop&q=80&w=800",
      category: "SETS",
      name: "Tailored Linen Suit",
      price: 69500,
      tag: ""
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&q=80&w=800",
      category: "BOTTOMS",
      name: "Pleated Wide-Leg Trouser",
      price: 26500,
      tag: "NEW"
    }
  ];

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <img 
            src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero Background" 
            className={styles.heroImage} 
          />
          <div className={styles.heroOverlay}></div>
        </div>
        
        <div className={styles.heroContent}>
          <div className={styles.heroTopLabel}>NO. 01 &mdash; FALL / WINTER 2026</div>
          <h1 className={styles.heroTitle}>
            Dressed<br />
            <i>in confidence.</i>
          </h1>
          <p className={styles.heroDescription}>
            Curated pieces that speak to the woman who<br/>
            refuses to compromise &mdash; structured, deliberate,<br/>
            and entirely her own.
          </p>
          <div className={styles.heroActions}>
            <Link href="/collections" className={styles.primaryBtn}>
              SHOP COLLECTION
            </Link>
            <Link href="/lookbook" className={styles.textLink}>
              VIEW LOOKBOOK &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Collections Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionLabel}>NO. 02</div>
              <h2 className={styles.sectionTitle}>Featured Collections</h2>
            </div>
            <Link href="/collections" className={styles.viewAllLink}>
              ALL COLLECTIONS &rarr;
            </Link>
          </div>

          <div className={styles.collectionsGrid}>
            <Link href="/products?category=Outerwear" className={styles.collectionCard}>
              <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1000" alt="Archive I" className={styles.collectionImg} />
              <div className={styles.collectionOverlay}></div>
              <div className={styles.collectionTag}>NEW SEASON</div>
              <div className={styles.collectionInfo}>
                <div className={styles.collectionMeta}>FALL / WINTER 2026 &middot; 42 PIECES</div>
                <h3 className={styles.collectionName}>Archive I</h3>
              </div>
            </Link>
            <Link href="/products?category=Dresses" className={styles.collectionCard}>
              <img src="https://images.unsplash.com/photo-1617317376997-8748e6862c01?auto=format&fit=crop&q=80&w=1000" alt="Chromatic" className={styles.collectionImg} />
              <div className={styles.collectionOverlay}></div>
              <div className={styles.collectionInfo}>
                <div className={styles.collectionMeta}>RESORT COLLECTION &middot; 18 PIECES</div>
                <h3 className={styles.collectionName}>Chromatic</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionLabel}>NO. 03</div>
              <h2 className={styles.sectionTitle}>New Arrivals</h2>
            </div>
            <div className={styles.filterLinks}>
              <Link href="/products" className={styles.filterActive}>ALL</Link>
              <Link href="/products?category=Dresses" className={styles.filterLink}>WOMEN</Link>
              <Link href="/products?category=Tops" className={styles.filterLink}>MEN</Link>
              <Link href="/products?category=Accessories" className={styles.filterLink}>ACCESSORIES</Link>
            </div>
          </div>

          <div className={styles.productsGrid}>
            {newArrivals.map((product) => (
              <Link key={product.id} href={`/products?search=${encodeURIComponent(product.name)}`} className={styles.productCard}>
                <div className={styles.productImageWrapper}>
                  {product.tag && (
                    <div className={`${styles.productBadge} ${product.tag === 'LIMITED' ? styles.badgeLimited : ''}`}>
                      {product.tag}
                    </div>
                  )}
                  <img
                    src={product.image}
                    alt={product.name}
                    className={styles.productImage}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                    }}
                  />
                </div>
                <div className={styles.productDetails}>
                  <div className={styles.productCategory}>{product.category}</div>
                  <h4 className={styles.productName}>{product.name}</h4>
                  <div className={styles.productPrice}>{formatPrice(product.price)}</div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className={styles.centerAction}>
             <Link href="/products" className={styles.outlineBtn}>
              VIEW ALL PRODUCTS
            </Link>
          </div>
        </div>
      </section>

      {/* Special Edition Archive Collection Section */}
      <section className={styles.archiveSection}>
        <div className={styles.archiveBackground}>
          <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=2000" alt="Archive Collection" className={styles.archiveImage} />
          <div className={styles.archiveOverlay}></div>
        </div>
        
        <div className={styles.archiveContent}>
          <div className={styles.archiveLabel}>SPECIAL EDITION</div>
          <h2 className={styles.archiveTitle}>
            The Archive<br />
            <i>Collection</i>
          </h2>
          <p className={styles.archiveDescription}>
            A limited run of 120 numbered pieces &mdash; each hand-finished and<br />
            accompanied by a certificate of authenticity.
          </p>
          <Link href="/archive" className={styles.outlineBtn}>
            RESERVE YOUR PIECE
          </Link>
        </div>
      </section>
      <section className={styles.storySection} id="brand-story">
        <div className={styles.storyImage}>
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=85&w=1200"
            alt="A considered approach to everyday style"
          />
        </div>
        <div className={styles.storyContent}>
          <p className={styles.sectionLabel}>MADE TO BE KEPT</p>
          <h2 className={styles.storyTitle}>Less, but <i>better.</i></h2>
          <p className={styles.storyCopy}>
            MAREN is a study in considered dressing: lasting silhouettes,
            thoughtful materials, and pieces that feel like you from the very
            first wear. Discover a wardrobe designed to move with you.
          </p>
          <Link href="/products" className={styles.storyLink}>DISCOVER THE COLLECTION <span>→</span></Link>
        </div>
      </section>
      <footer className={styles.siteFooter}>
        <div className={styles.footerMain}>
          <div className={styles.footerBrand}>
            <Link href="/" className={styles.footerLogo}>MAREN</Link>
            <p>Considered pieces. Confident dressing.<br />Made for the way you move.</p>
          </div>
          <div className={styles.footerColumn}>
            <h3>EXPLORE</h3>
            <Link href="/products">All pieces</Link>
            <Link href="/products?category=Dresses">Dresses</Link>
            <Link href="/products?category=Accessories">Accessories</Link>
          </div>
          <div className={styles.footerColumn}>
            <h3>YOUR ACCOUNT</h3>
            <Link href="/orders">Orders</Link>
            <Link href="/cart">Shopping bag</Link>
            <Link href="/login">Sign in</Link>
          </div>
          <div className={styles.footerNote}>
            <span>THE MAREN EDIT</span>
            <p>A little inspiration for a more considered wardrobe.</p>
            <Link href="/lookbook">EXPLORE THE EDIT →</Link>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} MAREN. ALL RIGHTS RESERVED.</span>
          <Link href="/">BACK TO THE TOP ↑</Link>
        </div>
      </footer>
    </div>
  );
}
