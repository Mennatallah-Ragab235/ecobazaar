import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../assets/ProductDetails.css";
import { User } from "lucide-react";

function FieldRow({ label, value }) {
  if (!value) return null;
  return <p><strong>{label}:</strong> {value}</p>;
}

const optionalFields = [
  { label: "الوزن", key: "weight" },
  { label: "الخامات", key: "materials" },
  { label: "بلد المنشأ", key: "origin" },
  { label: "الشهادات", key: "certificates" },
  { label: "SKU", key: "sku" },
];

/* ⭐ STAR DISPLAY */
function StarRating({ rating = 0 }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(rating) ? "filled" : ""}>★</span>
      ))}
    </div>
  );
}

/* ⭐ STAR INPUT */
function StarInput({ value, setValue }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="stars-input">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => setValue(star)}
          className={(hover || value) >= star ? "active" : ""}
        >★</span>
      ))}
    </div>
  );
}

export default function ProductDetailsPage({ onAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [product, setProduct]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [ratingValue, setRatingValue] = useState(0);
  const [comment, setComment]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg]   = useState("");
  const [wishlisted, setWishlisted] = useState(false);
  const [cartMsg, setCartMsg]       = useState("");
  const [showAllReviews, setShowAllReviews] = useState(false);



const reviews = product?.reviews || [];

const sortedReviews = [...reviews].sort(
  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
);

const visibleReviews = showAllReviews
  ? sortedReviews
  : sortedReviews.slice(0, 3);
  /* 🔥 GET PRODUCT */
  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data || null))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  /* ❤️ CHECK WISHLIST */
  useEffect(() => {
    if (!token) return;
    fetch("/api/wishlist", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data))
          setWishlisted(data.some((p) => p._id === id));
      })
      .catch(() => {});
  }, [id, token]);

  const rating  = product?.rating ?? 0;
  
console.log("REVIEWS:", reviews);
console.log("FIRST USER:", reviews?.[0]?.user);
  /* 🛒 ADD TO CART */
  const handleAddToCart = async () => {
    if (!token) { navigate("/login"); return; }
    try {
      await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
      });
      setCartMsg("✅ تمت الإضافة للسلة");
      if (onAddToCart) onAddToCart(product);
      setTimeout(() => setCartMsg(""), 2500);
    } catch {
      setCartMsg("❌ حدث خطأ");
    }
  };

  /* ❤️ TOGGLE WISHLIST */
  const handleWishlist = async () => {
    if (!token) { navigate("/login"); return; }
    try {
      const res = await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: product._id }),
      });
const data = await res.json();

if (!res.ok) {
  console.log("ERROR FROM BACKEND:", data);
  setReviewMsg(data.message || "❌ خطأ في السيرفر");
  return;
}      setWishlisted(data.added);
    } catch {}
  };

 const submitReview = async () => {
  if (!token) { navigate("/login"); return; }
  if (!ratingValue) { setReviewMsg("اختر تقييم أولاً"); return; }
  if (!comment.trim()) { setReviewMsg("اكتب تعليقاً"); return; }

  setSubmitting(true);

  try {
    const res = await fetch(`/api/products/${id}/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating: ratingValue, comment }),
    });

    const data = await res.json();

    // 🔴 أهم تعديل هنا
    if (!res.ok) {
      setReviewMsg(data.message || "❌ حدث خطأ");
      return;
    }

    setProduct(data);
    setComment("");
    setRatingValue(0);
    setReviewMsg("✅ تم إضافة تعليقك");

    setTimeout(() => setReviewMsg(""), 3000);

  } catch (err) {
    setReviewMsg("❌ حدث خطأ في الاتصال بالسيرفر");
  } finally {
    setSubmitting(false);
  }
};

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (!product) return <div className="loading">المنتج غير موجود</div>;







return (
<div className="product-details-container">
 <div className="page-wrapper">
      {/* BACK */}
      <button className="back-btn" onClick={() => navigate("/products")}>
        رجوع
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>

      {/* MAIN CARD */}
      <div className="product-details-card">

        {/* IMAGE */}
        <div className="image-section">
          <img src={product.image || product.images?.[0]} alt={product.name} />
        </div>

        {/* INFO */}
        <div className="info-section">
          <h1>{product.name}</h1>

          <div className="rating-box">
            <StarRating rating={rating} />
            <span>{(rating || 0).toFixed(1)} ({reviews.length} تقييم)</span>
          </div>

          <h2 className="price">{product.price} جنيه</h2>
          <p className="desc">{product.description}</p>

          <div className="extra">
            <FieldRow label="الفئة" value={product.category} />
            <FieldRow label="البائع" value={product.seller?.storeName} />
            {optionalFields.map((f) => (
              <FieldRow key={f.key} label={f.label} value={product[f.key]} />
            ))}
            {product.isEcoFriendly && <p className="eco">🌿 صديق للبيئة</p>}
          </div>

          {/* ACTION BUTTONS */}
          <div className="action-buttons">
            <button className="pd-cart-btn" onClick={handleAddToCart}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              أضف للسلة
            </button>

            <button
              className={`pd-wishlist-btn ${wishlisted ? "active" : ""}`}
              onClick={handleWishlist}
            >
              <svg viewBox="0 0 24 24" width="18" height="18"
                fill={wishlisted ? "#e74c3c" : "none"}
                stroke={wishlisted ? "#e74c3c" : "currentColor"}
                strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {wishlisted ? "في المفضلة" : "أضف للمفضلة"}
            </button>
          </div>

          {cartMsg && <p className="action-msg">{cartMsg}</p>}

          <hr />

          {/* ⭐ RATE & REVIEW */}
         
        </div>
      </div>

      {/* REVIEWS LIST */}
  <div className="reviews-section">
 <div className="rate-box">
            <h3>أضف تقييمك</h3>
            <StarInput value={ratingValue} setValue={setRatingValue} />
            <textarea
              className="review-textarea"
              placeholder="شاركنا رأيك في المنتج..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            {reviewMsg && <p className="action-msg">{reviewMsg}</p>}
            <button className="rate-btn" onClick={submitReview} disabled={submitting}>
              {submitting ? "جارٍ الإرسال..." : "إرسال التقييم والتعليق"}
            </button>
          </div>
  {visibleReviews.map((r, i) => (

    <div key={i}>
      
      <div className="review-item">

        {/* header */}
        <div className="review-header">

          <div className="review-avatar">
            {r.user?.fullName?.charAt(0)?.toUpperCase() || "👤"}
          </div>

          <div>
            <div className="review-user-name">
              {r.user?.fullName}
            </div>

            <div className="review-date">
              {new Date(r.createdAt).toLocaleDateString("ar-EG")}
            </div>
          </div>

        </div>

        {/* comment */}
       {/* comment + rating */}
<div className="review-comment">
  <div className="review-stars">
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={star <= Math.round(r?.rating || 0) ? "filled" : ""}
      >
        ★
      </span>
    ))}
  </div>

  <div className="review-text">
    {r.comment}
  </div>
</div>

      </div>

      {/* line */}
      {i !== product.reviews.length - 1 && (
        <div className="review-divider"></div>
      )}

    </div>

  ))}
{reviews.length > 3 && (
  <button
    className="show-more-btn"
    onClick={() => setShowAllReviews(!showAllReviews)}
  >
    {showAllReviews ? "إخفاء التعليقات" : "عرض المزيد من التعليقات"}
  </button>
)}
</div>

    </div>
</div>
  );


}