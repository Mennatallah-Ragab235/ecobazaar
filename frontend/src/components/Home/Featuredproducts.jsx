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

function ProductCard({ product, onAddToCart, animationDelay }) {
  const [imgError, setImgError] = useState(false);

  const img     = product.image || product.images?.[0] || "";
  const price   = parseFloat(product.price || 0);
  const oldPrice= parseFloat(product.originalPrice || 0);
  const rating  = parseFloat(product.rating || 0);
  const reviews = parseInt(product.numReviews || product.reviews || 0);
  const brand   = product.brand || product.storeName || product.sellerName ||
                  (product.seller && product.seller.storeName) || "";
  const hasDiscount = oldPrice && oldPrice > price;

  return (
    <div className="product-card" style={{ animationDelay }}>
      {/* IMAGE */}
      <div className="product-image-wrap">
        {img && !imgError ? (
          <img
            src={img}
            alt={product.name}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="product-img-placeholder">🌿</div>
        )}
        <div className="product-badges">
          {product.isEcoFriendly && <span className="badge eco">🌿 صديق للبيئة</span>}
          {hasDiscount && <span className="badge discount">خصم</span>}
        </div>
      </div>

      {/* INFO */}
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>

        {brand && (
          <div className="product-brand">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="12" height="12">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            {brand}
          </div>
        )}

        <div className="product-rating">
          <StarRating rating={rating} />
          <span className="rating-val">{rating > 0 ? rating.toFixed(1) : "0"}</span>
          <span className="rating-count">({reviews} تقييم)</span>
        </div>

        <div className="product-price-row">
          <div className="product-prices">
            <span className="price-current">{price.toLocaleString("ar-EG")} جنيه</span>
            {hasDiscount && (
              <span className="price-original">{oldPrice.toLocaleString("ar-EG")} جنيه</span>
            )}
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
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={onAddToCart}
                animationDelay={`${i * 0.1}s`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}