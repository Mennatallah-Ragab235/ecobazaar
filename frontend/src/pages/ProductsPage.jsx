import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import "../assets/ProductsPage.css";

const CATEGORY_MAP = {
  personal_care: "العناية الشخصية",
  home_garden: "المنزل والحديقة",
  sustainable_fashion: "الأزياء المستدامة",
  organic_food: "الأطعمة العضوية",
};

function getField(p, ...keys) {
  for (const k of keys)
    if (p[k] !== undefined && p[k] !== null && p[k] !== "") return p[k];
  return null;
}

function formatCategory(cat) {
  return CATEGORY_MAP[cat] || cat || "عام";
}

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
          width="14"
          height="14"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="sk-img" />
      <div className="sk-body">
        <div className="sk-line" />
        <div className="sk-line short" />
        <div className="sk-line medium" />
      </div>
    </div>
  );
}

function ProductCard({ product, onAddToCart }) {
  const [imgError, setImgError] = useState(false);

  const name     = getField(product, "name", "title", "Name") || "منتج";
  const price    = parseFloat(getField(product, "price", "Price") || 0);
  const oldPrice = parseFloat(getField(product, "originalPrice", "oldPrice", "comparePrice") || 0);
  const rating   = parseFloat(getField(product, "rating", "averageRating") || 0);
  const reviews  = parseInt(getField(product, "numReviews", "reviewCount", "reviews") || 0);
  const cat      = formatCategory(getField(product, "category", "Category") || "");
  const img      = getField(product, "image") || (Array.isArray(product.images) && product.images[0]) || "";
  const brand    = product.brand || product.storeName || product.sellerName ||
                   (product.seller && product.seller.storeName) || "";
  const hasDiscount = oldPrice && oldPrice > price;

  return (
    <div className="product-card">
      <div className="product-image-wrap">
        {img && !imgError ? (
          <img src={img} alt={name} onError={() => setImgError(true)} />
        ) : (
          <div className="product-img-placeholder">🌿</div>
        )}
        <div className="product-badges">
          {product.isEcoFriendly && <span className="badge eco">🌿 صديق للبيئة</span>}
          {hasDiscount && <span className="badge discount">خصم</span>}
        </div>
      </div>

      <div className="product-info">
        {cat && <div className="product-category">{cat}</div>}

        <h3 className="product-name">{name}</h3>

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

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState(0);

  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minRating, setMinRating] = useState(0);
  const [ecoOnly, setEcoOnly] = useState(false);
  const [selectedCats, setSelectedCats] = useState([]);
  const [sort, setSort] = useState("featured");
  const navigate = useNavigate();

  const CATEGORIES = ["العناية الشخصية", "المنزل والحديقة", "الأزياء المستدامة", "الأطعمة العضوية"];

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/products/approved");
      if (!res.ok) throw new Error("فشل تحميل المنتجات");
      const data = await res.json();
      setAllProducts(Array.isArray(data) ? data : data.products || data.data || []);
    } catch (e) {
      setError(e.message || "تعذّر الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  }

  const applyFilters = useCallback(() => {
    let result = [...allProducts];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => {
        const n = (getField(p, "name", "title") || "").toLowerCase();
        const c = formatCategory(getField(p, "category") || "");
        return n.includes(q) || c.includes(q);
      });
    }

    result = result.filter((p) => parseFloat(getField(p, "price") || 0) <= maxPrice);
    result = result.filter((p) => parseFloat(getField(p, "rating", "averageRating") || 0) >= minRating);
    if (ecoOnly) result = result.filter((p) => p.isEco || p.eco || p.isEcoFriendly);
    if (selectedCats.length > 0)
      result = result.filter((p) => selectedCats.includes(formatCategory(getField(p, "category") || "")));

    if (sort === "price_asc")  result.sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0));
    else if (sort === "price_desc") result.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
    else if (sort === "rating") result.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));

    setFiltered(result);
  }, [allProducts, search, maxPrice, minRating, ecoOnly, selectedCats, sort]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  function toggleCat(cat) {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function handleAddToCart(product) {
    setCart((c) => c + 1);
  }

  return (
    <div className="page-root" dir="ltr">

      <div className="p-hero">
  <button className="view-all-btn" onClick={() => navigate("/")}>
رجوع            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>        <div className="p-hero-inner">
          <h1>تصفح المنتجات</h1>
          <p>اكتشف مجموعتنا الواسعة من المنتجات الصديقة للبيئة</p>
        </div>
      </div>

      <div className="page-wrapper">
        <div className="content-area">

          <aside className="sidebar">
            <div className="sidebar-title"><span>🔧</span> الفلاتر</div>

            <div className="filter-section">
              <h4>الفئات</h4>
              <label className="filter-option">
                <input type="checkbox" checked={selectedCats.length === 0} onChange={() => setSelectedCats([])} />
                الكل
              </label>
              {CATEGORIES.map((cat) => (
                <label key={cat} className="filter-option">
                  <input type="checkbox" checked={selectedCats.includes(cat)} onChange={() => toggleCat(cat)} />
                  {cat}
                </label>
              ))}
            </div>

            <hr className="divider" />

            <div className="filter-section">
              <h4>نطاق السعر</h4>
              <input
                type="range" className="price-range"
                min={0} max={1000} step={10} value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
              <div className="price-labels">
                <span>0 جنيه</span>
                <span>{maxPrice} جنيه</span>
              </div>
            </div>

            <hr className="divider" />

            <div className="filter-section">
              <h4>التقييم</h4>
              {[{ label: "★★★★★ وأعلى", val: 5 }, { label: "★★★★ وأعلى", val: 4 }, { label: "★★★ وأعلى", val: 3 }].map(({ label, val }) => (
                <label key={val} className="filter-option">
                  <input type="radio" name="rating" checked={minRating === val - 1} onChange={() => setMinRating(val - 1)} />
                  <span className="stars-label">{label}</span>
                </label>
              ))}
            </div>

            <hr className="divider" />

            <label className="filter-option eco-filter">
              <input type="checkbox" checked={ecoOnly} onChange={(e) => setEcoOnly(e.target.checked)} />
              <span>🌿 منتجات بيئية فقط</span>
            </label>
          </aside>

          <main className="main-content">
            <div className="top-bar">
              <span className="products-count">
                {loading ? "جارٍ التحميل..." : `عرض ${filtered.length} منتج`}
              </span>
              <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="featured">مميز</option>
                <option value="price_asc">السعر: الأقل أولاً</option>
                <option value="price_desc">السعر: الأعلى أولاً</option>
                <option value="rating">الأعلى تقييماً</option>
              </select>
            </div>

            {loading && (
              <div className="products-grid">
                {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {!loading && error && (
              <div className="error-box">
                <p>⚠️ {error}</p>
                <p className="error-sub">تأكد أن الباك إند شغّال</p>
                <button onClick={fetchProducts} className="retry-btn">إعادة المحاولة</button>
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🌿</div>
                <p className="empty-title">لا توجد منتجات مطابقة</p>
                <p className="empty-sub">جرب تغيير الفلاتر أو البحث بكلمة مختلفة</p>
              </div>
            )}

            {!loading && !error && filtered.length > 0 && (
              <div className="products-grid">
                {filtered.map((product) => (
                  <ProductCard
                    key={product._id || product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}