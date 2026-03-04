import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/FeaturedProducts.css";

function StarRating({ rating }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          viewBox="0 0 24 24"
          className={`star ${s <= Math.round(rating) ? "filled" : ""}`}
          fill={s <= Math.round(rating) ? "#f59e0b" : "none"}
          stroke={s <= Math.round(rating) ? "#f59e0b" : "#d1d5db"}
          strokeWidth="1.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export default function FeaturedProducts({ onAddToCart, searchVal }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/products/approved")
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes((searchVal || "").toLowerCase())
  );

  return (
    <section className="featured-products" id="featured-products">
      <div className="section-container">
        <div className="featured-header">
          <div>
            <h2>المنتجات المميزة</h2>
            <p>اختيارات خاصة من أفضل منتجاتنا</p>
          </div>
          <button className="view-all-btn" onClick={() => navigate("/products")}>
            عرض كل المنتجات
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="loading">جاري التحميل...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty">لا توجد منتجات مطابقة للبحث</div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product, i) => (
              <div className="product-card" key={product._id} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="product-image-wrap">
                  <img
                    src={product.image || product.images?.[0] || "https://placehold.co/300x300?text=No+Image"}
                    alt={product.name}
                  />
                  {product.isEcoFriendly && <span className="badge eco">صديق للبيئة</span>}
                  {product.discount > 0 && <span className="badge discount">خصم</span>}
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-rating">
                    <StarRating rating={product.rating || 0} />
                    <span className="rating-val">{product.rating || "0"}</span>
                    <span className="rating-count">(تقييم {product.reviews || 0})</span>
                  </div>
                  <div className="product-price-row">
                    <div className="product-prices">
                      <span className="price-current">جنيه {product.price}</span>
                      {product.originalPrice && <span className="price-original">جنيه {product.originalPrice}</span>}
                    </div>
                    <button className="add-to-cart" onClick={() => onAddToCart(product)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 0 1-8 0"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
