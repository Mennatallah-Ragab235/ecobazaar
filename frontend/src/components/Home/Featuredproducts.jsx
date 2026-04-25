import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/FeaturedProducts.css";

/* ================= RATING ================= */
function getFinalRating(product) {
  if (!product) return 0;

  if (typeof product.rating === "number" && product.rating > 0)
    return product.rating;

  if (product.ratings?.length > 0) {
    const sum = product.ratings.reduce(
      (acc, r) => acc + (r.value || 0),
      0
    );
    return sum / product.ratings.length;
  }

  return 0;
}

/* ================= STAR RATING ================= */
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

/* ================= PRODUCT CARD ================= */
function ProductCard({
  product,
  onAddToCart,
  animationDelay,
  wishlistIds,
  onToggleWishlist,
}) {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const wishlisted = wishlistIds?.has(product._id);

  const img = product.image || product.images?.[0] || "";
  const price = parseFloat(product.price || 0);
  const oldPrice = parseFloat(product.originalPrice || 0);


  const rating =
  product?.rating ??
  (product?.ratings?.length
    ? product.ratings.reduce((a, b) => a + b.value, 0) /
      product.ratings.length
    : 0);

const reviews =
  product?.numReviews ??
  product?.reviews?.length ??
  product?.ratings?.length ??
  0;


  const brand =
    product.brand ||
    product.storeName ||
    product.sellerName ||
    (product.seller && product.seller.storeName) ||
    "";

  const hasDiscount = oldPrice && oldPrice > price;

  /* ================= WISHLIST TOGGLE ================= */
  const handleWishlist = async (e) => {
    e.stopPropagation();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id }),
      });

      const data = await res.json();
      onToggleWishlist(product._id, data.added);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="product-card"
      style={{ animationDelay }}
      onClick={() => navigate(`/product/${product._id}`)}
    >
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
          {hasDiscount ? (
            <span className="badge discount">خصم</span>
          ) : (
            product.isEcoFriendly && (
              <span className="badge eco">🌿 صديق للبيئة</span>
            )
          )}
        </div>

        {/* ❤️ Wishlist */}
        <button
          className={`wishlist-btn ${wishlisted ? "active" : ""}`}
          onClick={handleWishlist}
          title={wishlisted ? "إزالة من المفضلة" : "أضف للمفضلة"}
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill={wishlisted ? "#e74c3c" : "none"}
            stroke={wishlisted ? "#e74c3c" : "#666"}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* INFO */}
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>

        {brand && <div className="product-brand">{brand}</div>}

        <div className="product-rating">
          <StarRating rating={rating} />
          <span className="rating-val">
            {rating > 0 ? rating.toFixed(1) : "0"}
          </span>
          <span className="rating-count">({reviews} تقييم)</span>
        </div>

        <div className="product-price-row">
          <div className="product-prices">
            <span className="price-current">
              {price.toLocaleString("ar-EG")} جنيه
            </span>

            {hasDiscount && (
              <span className="price-original">
                {oldPrice.toLocaleString("ar-EG")} جنيه
              </span>
            )}
          </div>

          <button className="add-to-cart" onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}>
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

/* ================= MAIN ================= */
export default function FeaturedProducts({ onAddToCart, searchVal }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  /* ================= PRODUCTS ================= */
  const fetchProducts = () => {
    setLoading(true);
    fetch("/api/products/approved")
      .then((res) => res.json())
      .then((data) =>
        setProducts(Array.isArray(data) ? data : [])
      )
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    window.addEventListener("focus", fetchProducts);
    return () => window.removeEventListener("focus", fetchProducts);
  }, []);

  /* ================= WISHLIST FETCH ================= */
  useEffect(() => {
    if (!token) return;

    fetch("/api/wishlist", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setWishlistIds(new Set(data.map((p) => p._id)));
        }
      })
      .catch(() => {});
  }, [token]);

  const handleToggleWishlist = (productId, added) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      added ? next.add(productId) : next.delete(productId);
      return next;
    });
  };

  /* ================= SEARCH ================= */
  const filteredBySearch = products.filter((product) =>
    product.name
      ?.toLowerCase()
      .includes((searchVal || "").toLowerCase())
  );

  const topRatedProducts = [...filteredBySearch]
    .filter((p) => getFinalRating(p) > 0)
    .sort((a, b) => getFinalRating(b) - getFinalRating(a))
    .slice(0, 3);

  return (
    <section className="featured-products" id="featured-products">
      <div className="section-container">
        <div className="featured-header">
          <div>
            <h2>منتجات مميزه</h2>
            <p>أفضل 3 منتجات حسب تقييم المستخدمين</p>
          </div>

          <button
            className="view-all-btn"
            onClick={() => navigate("/products")}
          >
            عرض كل المنتجات
          </button>
        </div>

        {loading ? (
          <div className="loading">جاري التحميل...</div>
        ) : topRatedProducts.length === 0 ? (
          <div className="empty">لا توجد منتجات</div>
        ) : (
          <div className="products-grid">
            {topRatedProducts.map((product, i) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={onAddToCart}
                animationDelay={`${i * 0.1}s`}
                wishlistIds={wishlistIds}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}