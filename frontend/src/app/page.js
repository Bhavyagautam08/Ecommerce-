"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  const newArrivals = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800",
      category: "OUTERWEAR",
      name: "Structured Wool Blazer",
      price: "$485",
      tag: "NEW"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800",
      category: "DRESSES",
      name: "Silk Midi Dress",
      price: "$320",
      tag: "LIMITED"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1618932260643-f66d4ffce56a?auto=format&fit=crop&q=80&w=800",
      category: "SETS",
      name: "Tailored Linen Suit",
      price: "$695",
      tag: ""
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&q=80&w=800",
      category: "BOTTOMS",
      name: "Pleated Wide-Leg Trouser",
      price: "$265",
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
            <div className={styles.collectionCard}>
              <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1000" alt="Archive I" className={styles.collectionImg} />
              <div className={styles.collectionOverlay}></div>
              <div className={styles.collectionTag}>NEW SEASON</div>
              <div className={styles.collectionInfo}>
                <div className={styles.collectionMeta}>FALL / WINTER 2026 &middot; 42 PIECES</div>
                <h3 className={styles.collectionName}>Archive I</h3>
              </div>
            </div>
            <div className={styles.collectionCard}>
              <img src="https://images.unsplash.com/photo-1617317376997-8748e6862c01?auto=format&fit=crop&q=80&w=1000" alt="Chromatic" className={styles.collectionImg} />
              <div className={styles.collectionOverlay}></div>
              <div className={styles.collectionInfo}>
                <div className={styles.collectionMeta}>RESORT COLLECTION &middot; 18 PIECES</div>
                <h3 className={styles.collectionName}>Chromatic</h3>
              </div>
            </div>
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
              <span className={styles.filterActive}>ALL</span>
              <span className={styles.filterLink}>WOMEN</span>
              <span className={styles.filterLink}>MEN</span>
              <span className={styles.filterLink}>ACCESSORIES</span>
            </div>
          </div>

          <div className={styles.productsGrid}>
            {newArrivals.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.productImageWrapper}>
                  {product.tag && (
                    <div className={`${styles.productBadge} ${product.tag === 'LIMITED' ? styles.badgeLimited : ''}`}>
                      {product.tag}
                    </div>
                  )}
                  <img src={product.image} alt={product.name} className={styles.productImage} />
                </div>
                <div className={styles.productDetails}>
                  <div className={styles.productCategory}>{product.category}</div>
                  <h4 className={styles.productName}>{product.name}</h4>
                  <div className={styles.productPrice}>{product.price}</div>
                </div>
              </div>
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
    </div>
  );
}
