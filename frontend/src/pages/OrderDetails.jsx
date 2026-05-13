import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../assets/OrderDetails.css";

const STATUS_MAP = {
  pending:           { label: "قيد الانتظار", class: "status-pending",   step: 1 },
  confirmed:         { label: "مؤكد",          class: "status-confirmed", step: 2 },
  paid:              { label: "تم الدفع",      class: "status-paid",      step: 2 },
  processing:        { label: "جاري المعالجة", class: "status-confirmed", step: 2 },
  partially_shipped: { label: "شحن جزئي",      class: "status-shipped",   step: 3 },
  shipped:           { label: "في الطريق",     class: "status-shipped",   step: 3 },
  delivered:         { label: "تم التسليم",    class: "status-delivered", step: 4 },
  cancelled:         { label: "ملغي",          class: "status-cancelled", step: 0 },
};

const SUB_STATUS = {
  pending:    { label: "قيد الانتظار", cls: "status-pending" },
  processing: { label: "جاري المعالجة", cls: "status-confirmed" },
  shipped:    { label: "في الطريق",    cls: "status-shipped" },
  delivered:  { label: "تم التسليم",  cls: "status-delivered" },
  cancelled:  { label: "ملغي",        cls: "status-cancelled" },
};

const PAYMENT_MAP = {
  cod:  "الدفع عند الاستلام",
  card: "بطاقة ائتمان",
};

const SHIPPING_MAP = {
  standard: "قياسي — 3 إلى 5 أيام عمل",
  fast:     "سريع — 1 إلى 2 يوم عمل",
};

const steps = [
  { label: "تم الطلب",   icon: "📋" },
  { label: "تم التأكيد", icon: "✅" },
  { label: "في الطريق",  icon: "🚚" },
  { label: "تم التسليم", icon: "📦" },
];

export default function OrderDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");

  const [order,      setOrder]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  // subOrderId → "confirming" | "confirmed"
  const [subConfirm, setSubConfirm] = useState({});

  // ── FETCH ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) { navigate("/login"); return; }

    fetch(`/api/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.message) setError(data.message);
        else setOrder(data);
      })
      .catch(() => setError("حدث خطأ في تحميل الطلب"))
      .finally(() => setLoading(false));
  }, [id, token]);

  // ── تأكيد استلام SubOrder معين ───────────────────────────────────────────
  const handleConfirmSub = async (subOrderId) => {
    setSubConfirm(prev => ({ ...prev, [subOrderId]: "confirming" }));
    try {
      const res = await fetch("/api/orders/confirm-delivery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({ subOrderId }),
      });

      const data = await res.json();

      if (data.success || data.message === "Already released") {
        // تحديث الـ SubOrder في الـ state
        setOrder(prev => ({
          ...prev,
          subOrders: prev.subOrders.map(sub =>
            sub._id === subOrderId
              ? { ...sub, status: "delivered", escrowStatus: "released" }
              : sub
          ),
        }));
        setSubConfirm(prev => ({ ...prev, [subOrderId]: "confirmed" }));
      } else {
        alert("حدث خطأ، حاول تاني");
        setSubConfirm(prev => ({ ...prev, [subOrderId]: null }));
      }
    } catch {
      alert("حدث خطأ في الاتصال");
      setSubConfirm(prev => ({ ...prev, [subOrderId]: null }));
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  if (loading) return <div className="od-loading">جارٍ التحميل...</div>;
  if (error)   return (
    <div className="od-loading">
      <p>⚠️ {error}</p>
      <button onClick={() => navigate(-1)}>← رجوع</button>
    </div>
  );
  if (!order) return null;

  const st   = STATUS_MAP[order.status] || { label: order.status, class: "status-pending", step: 1 };
  const date = new Date(order.createdAt).toLocaleDateString("ar-EG", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="od-page" dir="rtl">
      <div className="od-wrap">

        {/* Back */}
        <button className="od-back" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          رجوع
        </button>

        {/* Header */}
        <div className="od-header">
          <div className="od-header-right">
            <div className="od-order-num">ORD-{order._id.slice(-6).toUpperCase()}</div>
            <div className="od-date">{date}</div>
          </div>
          <span className={`od-badge ${st.class}`}>{st.label}</span>
        </div>

        {/* Progress — على مستوى الأوردر الكلي */}
        {order.status !== "cancelled" && (
          <div className="od-card">
            <div className="od-progress">
              {steps.map((s, i) => (
                <div key={i} className="od-progress-item">
                  <div className={`od-progress-dot ${i + 1 <= st.step ? "done" : ""}`}>
                    {i + 1 <= st.step ? "✓" : i + 1}
                  </div>
                  <div className={`od-progress-label ${i + 1 <= st.step ? "done" : ""}`}>
                    {s.icon} {s.label}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`od-progress-line ${i + 1 < st.step ? "done" : ""}`}/>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ SubOrders — كل بائع في card لوحده ══════════ */}
        {order.subOrders?.length > 0 && (
          <div className="od-suborders-section">
            <div className="od-section-title">📦 الشحنات</div>

            {order.subOrders.map((sub) => {
              const subSt       = SUB_STATUS[sub.status] || SUB_STATUS.pending;
              const confirmState = subConfirm[sub._id];
              const canConfirm  = sub.status === "shipped" && sub.escrowStatus !== "released"
                                  && confirmState !== "confirmed";

              return (
                <div key={sub._id} className="od-card od-suborder-card">

                  {/* رأس الـ SubOrder */}
                  <div className="od-sub-header">
                    <span className="od-store-name">
                      🏪 {sub.seller?.storeName || sub.seller?.fullName || "بائع"}
                    </span>
                    <span className={`od-badge ${subSt.cls}`}>{subSt.label}</span>
                  </div>

                  {/* منتجات الـ SubOrder */}
                  {sub.items?.map((item, i) => {
                    const img  = item.product?.images?.[0] || item.product?.image || "";
                    const name = item.product?.name || "منتج";
                    return (
                      <div key={i} className="od-product-row">
                        <div className="od-product-img">
                          {img ? <img src={img} alt={name}/> : "🌿"}
                        </div>
                        <div className="od-product-info">
                          <div className="od-product-name">{name}</div>
                          <div className="od-product-qty">الكمية: {item.quantity}</div>
                        </div>
                        <div className="od-product-price">
                          {(item.price * item.quantity).toLocaleString("ar-EG")} جنيه
                        </div>
                      </div>
                    );
                  })}

                  {/* رقم التتبع */}
                  {sub.trackingNumber && (
                    <div className="od-tracking-row">
                      <span className="od-info-label">رقم التتبع</span>
                      <span className="od-tracking-num">{sub.trackingNumber}</span>
                    </div>
                  )}

                  {/* مبلغ الـ SubOrder */}
                  <div className="od-sub-total-row">
                    <span>إجمالي هذه الشحنة</span>
                    <strong>{sub.subtotal?.toLocaleString("ar-EG")} جنيه</strong>
                  </div>

                  {/* ✅ زرار تأكيد الاستلام لكل SubOrder لوحده */}
                  {canConfirm && (
                    <div className="od-confirm-wrap">
                      <p className="od-confirm-hint">
                        📦 وصلتك هذه الشحنة؟ اضغط لتأكيد الاستلام وإطلاق الدفع للبائع
                      </p>
                      <button
                        className="od-confirm-btn"
                        onClick={() => handleConfirmSub(sub._id)}
                        disabled={confirmState === "confirming"}
                      >
                        {confirmState === "confirming" ? "جاري التأكيد..." : "✅ تأكيد استلام الشحنة"}
                      </button>
                    </div>
                  )}

                  {/* رسالة بعد التأكيد */}
                  {(confirmState === "confirmed" || sub.status === "delivered") && (
                    <div className="od-confirmed-msg">
                      ✅ تم تأكيد الاستلام — تم تحويل الدفع للبائع
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

        <div className="od-grid">
          <div className="od-left">

            {/* ملخص الأوردر الكلي */}
            <div className="od-card">
              <div className="od-card-title">🧾 ملخص الطلب</div>
              <div className="od-totals">
                <div className="od-total-row">
                  <span>المجموع الفرعي</span>
                  <span>{order.subtotal?.toLocaleString("ar-EG")} جنيه</span>
                </div>
                <div className="od-total-row">
                  <span>الشحن</span>
                  <span>{order.shippingPrice?.toLocaleString("ar-EG")} جنيه</span>
                </div>
                <div className="od-total-row total">
                  <span>المجموع الكلي</span>
                  <span>{order.total?.toLocaleString("ar-EG")} جنيه</span>
                </div>
              </div>
            </div>

          </div>

          <div className="od-right">

            {/* عنوان التوصيل */}
            <div className="od-card">
              <div className="od-card-title">📍 عنوان التوصيل</div>
              {[
                { label: "الاسم",    val: order.shippingAddress?.fullName },
                { label: "الهاتف",  val: order.shippingAddress?.phone },
                { label: "العنوان", val: order.shippingAddress?.address },
                { label: "المدينة", val: order.shippingAddress?.city },
              ].map((r, i) => r.val && (
                <div key={i} className="od-info-row">
                  <span className="od-info-label">{r.label}</span>
                  <span className="od-info-val">{r.val}</span>
                </div>
              ))}
            </div>

            {/* تفاصيل الدفع */}
            <div className="od-card">
              <div className="od-card-title">💳 تفاصيل الدفع</div>
              {[
                { label: "طريقة الدفع",  val: PAYMENT_MAP[order.paymentMethod]  || order.paymentMethod },
                { label: "طريقة الشحن", val: SHIPPING_MAP[order.shippingMethod] || order.shippingMethod },
              ].map((r, i) => (
                <div key={i} className="od-info-row">
                  <span className="od-info-label">{r.label}</span>
                  <span className="od-info-val">{r.val}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
