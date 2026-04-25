import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../assets/ProductDetails.css";
import { getFinalRating, getReviewsCount } from "../utils/rating";



function FieldRow({ label, value }) {
  
  if (!value) return null;

  return (
    <p>
      <strong>{label}:</strong> {value}
    </p>
  );
}

const optionalFields = [
  { label: "الوزن", key: "weight" },
  { label: "الخامات", key: "materials" },
  { label: "بلد المنشأ", key: "origin" },
  { label: "الشهادات", key: "certificates" },
  { label: "SKU", key: "sku" },
];


/* ⭐ STAR DISPLAY */
function StarRating({ rating }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(rating) ? "filled" : ""}>
          ★
        </span>
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
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingValue, setRatingValue] = useState(0);

  /* 🔥 GET PRODUCT */
  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, [id]);

  /* ⭐ FINAL RATING */
 const rating = product.rating || 0;
const reviews = product.numReviews || 0;

  /* 🔥 SUBMIT RATING */
  const submitRating = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("لازم تسجل دخول الأول");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/products/${id}/rate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ value: ratingValue }),
        }
      );

      const data = await res.json();

      setProduct((prev) => ({
        ...prev,
        rating: data.product.rating,
        ratings: data.product.ratings,
      }));

      alert("تم إرسال التقييم");
      setRatingValue(0);
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (!product) return <div>المنتج غير موجود</div>;

  return (
    <div className="product-details-container">
      <button className="view-all-btn" onClick={() => navigate("/products")}>
        رجوع 
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg></button>

      <div className="product-details-card">
        {/* IMAGE */}
        <div className="image-section">
          <img
            src={product.image || product.images?.[0]}
            alt={product.name}
          />
        </div>

        {/* INFO */}
        <div className="info-section">
          <h1>{product.name}</h1>

          {/* ⭐ RATING */}
          <div className="rating-box">
            <StarRating rating={rating} />
            <span>
              {rating.toFixed(1)} ({reviews} تقييم)
            </span>
          </div>

          <p className="desc">{product.description}</p>

          <h2 className="price">{product.price} جنيه</h2>

         <div className="extra">
  <FieldRow label="الفئة" value={product.category} />
  <FieldRow label="البائع" value={product.seller?.storeName} />

  {optionalFields.map((f) => (
    <FieldRow
      key={f.key}
      label={f.label}
      value={product[f.key]}
    />
  ))}

  {product.isEcoFriendly && (
    <p className="eco">🌿 صديق للبيئة</p>
  )}
</div>


          <hr />

          {/* ⭐ RATE */}
          <div className="rate-box">
            <h3>قيم المنتج</h3>

            <StarInput value={ratingValue} setValue={setRatingValue} />

            <button className="rate-btn" onClick={submitRating}>
              إرسال التقييم
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
