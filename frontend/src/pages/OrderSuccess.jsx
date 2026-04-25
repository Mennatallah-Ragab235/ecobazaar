import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../assets/OrderSuccess.css";

function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // جيب آخر أوردر للمستخدم
  useEffect(() => {
    if (!token) { navigate("/login"); return; }

    fetch("/api/orders?limit=1", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        // لو array خد أول أوردر، لو object خده مباشرة
        const latest = Array.isArray(data) ? data[0] : data;
        setOrder(latest);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("ar-EG", {
      year: "numeric", month: "long", day: "numeric"
    });
  };

  const statusMap = {
    pending:   { label: "قيد المراجعة", cls: "badge-pending" },
    confirmed: { label: "مؤكد",         cls: "badge-confirmed" },
    paid:      { label: "مدفوع",        cls: "badge-paid" },
    shipped:   { label: "تم الشحن",     cls: "badge-shipped" },
    delivered: { label: "تم التوصيل",   cls: "badge-delivered" },
  };

  const paymentMap = {
    cod:  "الدفع عند الاستلام",
    card: "بطاقة ائتمان",
  };

  const shippingMap = {
    standard: "قياسي — 3 إلى 5 أيام عمل",
    fast:     "سريع — 1 إلى 2 يوم عمل",
  };

  if (loading) return <div className="os-loading">جارٍ التحميل...</div>;
  if (!order)  return <div className="os-loading">لم يتم العثور على الطلب</div>;

  const status = statusMap[order.status] || { label: order.status, cls: "badge-pending" };

  return (
    <div className="os-page" dir="rtl">
      <div className="os-wrap">

        {/* Success Header */}
        <div className="os-header">
          <div className="os-check">
            <svg viewBox="0 0 24 24" fill="none" stroke="#2d7a4f"
              strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h1 className="os-title">تم تأكيد طلبك بنجاح!</h1>
          <p className="os-sub">
            شكراً لك، سيتم التواصل معك قريباً لتأكيد موعد التوصيل
          </p>
          <div className="os-order-num">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="#2d7a4f" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            رقم الطلب: #{order._id.slice(-8)}
          </div>
        </div>

        {/* المنتجات */}
        <div className="os-card">
          <div className="os-card-head">
            <div className="os-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#2d7a4f" strokeWidth="2.5">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
            <span className="os-card-title">المنتجات</span>
          </div>
          <div className="os-card-body">
            {order.items.map((item, i) => (
              <div key={i} className="os-product-row">
                <div className="os-p-thumb">🛍</div>
                <div className="os-p-info">
                  <div className="os-p-name">
                    {item.product?.name || "منتج"}
                  </div>
                  <div className="os-p-qty">الكمية: {item.quantity}</div>
                </div>
                <div className="os-p-price">
                  {(item.price * item.quantity).toLocaleString("ar-EG")} جنيه
                </div>
              </div>
            ))}
          </div>
          <div className="os-total-row">
            <span>المجموع الكلي</span>
            <span className="os-total-val">
              {order.total?.toLocaleString("ar-EG")} جنيه
            </span>
          </div>
        </div>

        {/* تفاصيل الطلب */}
        <div className="os-card">
          <div className="os-card-head">
            <div className="os-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#2d7a4f" strokeWidth="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <span className="os-card-title">تفاصيل الطلب</span>
          </div>
          <div className="os-card-body">
            {[
              { label: "الاسم",    val: order.shippingAddress?.fullName },
              { label: "الهاتف",   val: order.shippingAddress?.phone },
              { label: "العنوان",  val: `${order.shippingAddress?.address}، ${order.shippingAddress?.city}` },
              { label: "الشحن",    val: shippingMap[order.shippingMethod] || order.shippingMethod },
              { label: "الدفع",    val: paymentMap[order.paymentMethod] || order.paymentMethod },
              { label: "تاريخ الطلب", val: formatDate(order.createdAt) },
            ].map((row, i) => (
              <div key={i} className="os-info-row">
                <span className="os-info-label">{row.label}</span>
                <span className="os-info-val">{row.val}</span>
              </div>
            ))}
            <div className="os-info-row">
              <span className="os-info-label">الحالة</span>
              <span className={`os-badge ${status.cls}`}>{status.label}</span>
            </div>
          </div>
        </div>

        {/* أزرار */}
        <div className="os-actions">
          <button className="os-btn-primary" onClick={() => navigate("/")}>
            العودة للمتجر
          </button>
          <button className="os-btn-outline" onClick={() => navigate("/profile")}>
            طلباتي
          </button>
        </div>

      </div>
    </div>
  );
}

export default OrderSuccess;