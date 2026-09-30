"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { productService } from "@/services/product.service";
import styles from "../../new/page.module.css";

const CATEGORIES = [
  "Electronics", "Clothing", "Books", "Sports", "Home", "Beauty",
  "Toys", "Grocery", "Automotive", "Health",
];

export default function EditProductPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  const [form, setForm] = useState({
    name: "", brand: "", category: "", price: "", stock: "", description: "", images: "", isActive: true
  });
  
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!loading && (!user || user.role !== "admin")) {
    router.replace("/");
    return null;
  }

  useEffect(() => {
    if (!id) return;
    productService.getById(id)
      .then(({ product }) => {
        setForm({
          name: product.name || "",
          brand: product.brand || "",
          category: product.category || "",
          price: product.price || "",
          stock: product.stock || "",
          description: product.description || "",
          images: product.images ? product.images.join(", ") : "",
          isActive: product.isActive !== false
        });
      })
      .catch((err) => setError("Failed to load product: " + err.message))
      .finally(() => setLoadingData(false));
  }, [id]);

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: value }));
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
      
      await productService.update(id, payload);
      router.push("/admin/products");
    } catch (err) {
      setError(err.message || "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) return <div className="page-wrapper"><div className="loading-center"><div className="spinner spinner-lg" /></div></div>;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className={styles.header}>
          <h1 className={styles.title}>Edit Product</h1>
          <Link href="/admin/products" className="btn btn-ghost">Cancel</Link>
        </div>

        <div className={styles.card}>
          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>⚠️ {error}</div>}
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Product Name *</label>
              <input
                id="name" name="name" type="text" required
                className="form-input" value={form.name} onChange={handleChange}
              />
            </div>
            
            <div className={styles.row}>
              <div className="form-group">
                <label className="form-label" htmlFor="brand">Brand</label>
                <input
                  id="brand" name="brand" type="text"
                  className="form-input" value={form.brand} onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="category">Category *</label>
                <select
                  id="category" name="category" required
                  className="form-select" value={form.category} onChange={handleChange}
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
                  className="form-input" value={form.price} onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="stock">Stock Quantity *</label>
                <input
                  id="stock" name="stock" type="number" min="0" required
                  className="form-input" value={form.stock} onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="images">Image URLs <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(comma-separated)</span></label>
              <input
                id="images" name="images" type="text"
                className="form-input" value={form.images} onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="description">Description *</label>
              <textarea
                id="description" name="description" required rows="5"
                className="form-input" style={{ resize: "vertical" }}
                value={form.description} onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <input
                id="isActive" name="isActive" type="checkbox"
                checked={form.isActive} onChange={handleChange}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
              <label className="form-label" htmlFor="isActive" style={{ margin: 0, cursor: "pointer" }}>Product is active</label>
            </div>
            
            <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting} style={{ marginTop: 12 }}>
              {isSubmitting ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...</> : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
