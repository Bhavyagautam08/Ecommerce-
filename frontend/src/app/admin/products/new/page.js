"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { productService } from "@/services/product.service";
import styles from "./page.module.css";

const CATEGORIES = [
  "Electronics", "Clothing", "Books", "Sports", "Home", "Beauty",
  "Toys", "Grocery", "Automotive", "Health",
];

export default function NewProductPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    images: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!loading && (!user || user.role !== "admin")) {
    router.replace("/");
    return null;
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        images: form.images ? form.images.split(",").map(url => url.trim()).filter(url => url) : [],
      };
      
      await productService.create(payload);
      router.push("/admin/products");
    } catch (err) {
      setError(err.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className={styles.header}>
          <h1 className={styles.title}>Add New Product</h1>
          <Link href="/admin/products" className="btn btn-ghost">Cancel</Link>
        </div>

        <div className={styles.card}>
          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>⚠️ {error}</div>}
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Product Name *</label>
              <input
                id="name" name="name" type="text" required
                className="form-input" placeholder="e.g. Wireless Headphones"
                value={form.name} onChange={handleChange}
              />
            </div>
            
            <div className={styles.row}>
              <div className="form-group">
                <label className="form-label" htmlFor="brand">Brand</label>
                <input
                  id="brand" name="brand" type="text"
                  className="form-input" placeholder="e.g. Sony"
                  value={form.brand} onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="category">Category *</label>
                <select
                  id="category" name="category" required
                  className="form-select"
                  value={form.category} onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className={styles.row}>
              <div className="form-group">
                <label className="form-label" htmlFor="price">Price (₹) *</label>
                <input
                  id="price" name="price" type="number" min="0" required
                  className="form-input" placeholder="0.00"
                  value={form.price} onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="stock">Stock Quantity *</label>
                <input
                  id="stock" name="stock" type="number" min="0" required
                  className="form-input" placeholder="0"
                  value={form.stock} onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="images">Image URLs <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(comma-separated)</span></label>
              <input
                id="images" name="images" type="text"
                className="form-input" placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                value={form.images} onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="description">Description *</label>
              <textarea
                id="description" name="description" required rows="5"
                className="form-input" style={{ resize: "vertical" }}
                placeholder="Detailed product description..."
                value={form.description} onChange={handleChange}
              />
            </div>
            
            <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting} style={{ marginTop: 12 }}>
              {isSubmitting ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating...</> : "Create Product"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
