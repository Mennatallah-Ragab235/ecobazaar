import { useState, useEffect, useCallback } from "react";
import "../../assets/sellerOrders.css";
import SellerLayout from "../../components/Seller/SellerLayout";
import "../../assets/SellerLayout.css";

const STATUS = {
  pending:    { label: "قيد الانتظار", cls: "pending" },
  processing: { label: "جاري المعالجة", cls: "processing" },
  shipped:    { label: "تم الشحن",     cls: "shipped" },
  delivered:  { label: "تم التسليم",   cls: "delivered" },
  cancelled:  { label: "ملغي",         cls: "cancelled" },
};

const fmtDate = (iso) =>
  new Date(iso).toLocaleString("ar-EG", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });

export default function SellerOrders() {
  const [subOrders, setSubOrders]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("all");
  const [shipTarget, setShipTarget]     = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [toast, setToast]               = useState(null);

  // ── FETCH SubOrders الخاصة بالبائع ─────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders/seller/my-orders", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const json = await res.json();
      setSubOrders(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── SHIP — بيبعت subOrder._id ──────────────────────────────────────────
  const handleShip = async (subOrder) => {
    try {
      const res = await fetch(`/api/orders/seller/${subOrder._id}/ship`, {
        method:  "PATCH",
        headers: {
          Authorization:  `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "فشل الشحن");
        return;
      }

      // ✅ بنحدث الـ SubOrder اللي اتشحن بس في الـ state
      setSubOrders((prev) =>
        prev.map((o) =>
          o._id === subOrder._id
            ? { ...o, status: "shipped", trackingNumber: data.subOrder.trackingNumber }
            : o
        )
      );

      setShipTarget(null);
      setToast({
        title: "تم الشحن بنجاح 🚚",
        body:  `رقم التتبع: ${data.subOrder.trackingNumber}`,
      });
      setTimeout(() => setToast(null), 4000);

    } catch (err) {
      console.error("SHIP ERROR:", err);
      alert("حدث خطأ أثناء الشحن");
    }
  };

  // ── FILTER ──────────────────────────────────────────────────────────────
  const filtered = filter === "all"
    ? subOrders
    : subOrders.filter((o) => o.status === filter);

  const counts = {
    all:       subOrders.length,
    pending:   subOrders.filter((o) => o.status === "pending").length,
    processing: subOrders.filter((o) => o.status === "processing").length,
    shipped:   subOrders.filter((o) => o.status === "shipped").length,
    delivered: subOrders.filter((o) => o.status === "delivered").length,
  };

  const TABS = [
    { key: "all",        label: "الكل" },
    { key: "pending",    label: "قيد الانتظار" },
    { key: "processing", label: "جاري المعالجة" },
    { key: "shipped",    label: "تم الشحن" },
    { key: "delivered",  label: "تم التسليم" },
  ];

  return (
<div className="so-page">
      <div className="so-hdr">
        <h1>إدارة الطلبات</h1>
        <p>كل طلب هنا خاص بك أنت فقط</p>
      </div>
      {/* STATS */}
      <div className="so-stats">
        <div className="so-stat">
          <span className="so-stat-num">{counts.pending}</span>
          <span className="so-stat-label">⏳ قيد الانتظار</span>
        </div>
        <div className="so-stat">
          <span className="so-stat-num">{counts.shipped}</span>
          <span className="so-stat-label">🚚 تم الشحن</span>
        </div>
        <div className="so-stat">
          <span className="so-stat-num">{counts.delivered}</span>
          <span className="so-stat-label">✅ تم التسليم</span>
        </div>
      </div>
      {/* TABS */}
      <div className="so-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`so-tab ${filter === t.key ? "active" : ""}`}
            onClick={() => setFilter(t.key)}
          >
            {t.label}
            <span className="so-tab-count">{counts[t.key]}</span>
          </button>
        ))}
      </div>
      {/* TABLE */}
      {loading ? (
        <div className="so-loading">جارٍ التحميل...</div>
      ) : (
        <div className="so-table-wrap">
          <table className="so-table">
            <thead>
              <tr>
                <th>العميل</th>
                <th>المنتجات</th>
                <th>مبلغك</th>
                <th>الحالة</th>
                <th>رقم التتبع</th>
                <th>التاريخ</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="so-empty">لا توجد طلبات</td>
                </tr>
              ) : (
                filtered.map((subOrder) => (
                  <tr key={subOrder._id}>

                    {/* العميل */}
                    <td>
                      <div className="so-customer-name">
                        {subOrder.buyer?.fullName || "—"}
                      </div>
                      <div className="so-store-name">
                        {subOrder.buyer?.phone || ""}
                      </div>
                    </td>

                    {/* المنتجات */}
                    <td>
                      {subOrder.items?.map((item, i) => (
                        <div key={i} className="so-product-line">
                          {item.product?.name} × {item.quantity}
                        </div>
                      ))}
                    </td>

                    {/* ✅ مبلغ البائع بس */}
<td className="so-amount">
  <div>
    <strong>
      {(
        subOrder.status === "delivered"
          ? subOrder.netAmount
          : subOrder.subtotal
      )?.toLocaleString("ar-EG")} جنيه
    </strong>

    <div style={{ fontSize: "12px", color: "#888" }}>
      {subOrder.status === "delivered"
        ? "بعد خصم عمولة الموقع"
        : "قيمة الطلب قبل خصم العمولة"}
    </div>
  </div>
</td>

                    {/* ✅ status الـ SubOrder بتاعه هو */}
                    <td>
                      <span className={`so-badge ${STATUS[subOrder.status]?.cls}`}>
                        {STATUS[subOrder.status]?.label}
                      </span>
                    </td>

                    {/* رقم التتبع */}
                    <td className="so-tracking">
                      {subOrder.trackingNumber || "—"}
                    </td>

                    {/* التاريخ */}
                    <td className="so-date">{fmtDate(subOrder.createdAt)}</td>

                    {/* الإجراءات */}
                    <td>
                      <div className="so-actions">
                        <button
                          className="so-btn-view"
                          onClick={() => setDetailTarget(subOrder)}
                          title="عرض التفاصيل"
                        >
                          👁
                        </button>
                        {/* زرار الشحن بيظهر بس لو pending أو processing */}
                        {(subOrder.status === "pending" || subOrder.status === "processing") && (
                          <button
                            className="so-btn-ship"
                            onClick={() => setShipTarget(subOrder)}
                            title="شحن الطلب"
                          >
                            🚚 شحن
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL — تأكيد الشحن */}
      {shipTarget && (
        <div className="so-overlay" onClick={() => setShipTarget(null)}>
          <div className="so-modal" onClick={(e) => e.stopPropagation()}>
            <h3>تأكيد الشحن</h3>
            <p>
              هل تريد تأكيد شحن الطلب{" "}
              <strong>#{shipTarget._id.slice(-6).toUpperCase()}</strong>؟
            </p>
            <div className="so-detail-products" style={{ marginBottom: "12px" }}>
              {shipTarget.items?.map((item, i) => (
                <div key={i} className="so-detail-product-row">
                  <span>{item.product?.name}</span>
                  <span>× {item.quantity}</span>
                  <span>{(item.price * item.quantity).toLocaleString("ar-EG")} جنيه</span>
                </div>
              ))}
            </div>
            <div className="so-modal-actions">
              <button className="so-btn-confirm" onClick={() => handleShip(shipTarget)}>
                🚚 تأكيد الشحن
              </button>
              <button className="so-btn-cancel" onClick={() => setShipTarget(null)}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL — تفاصيل الطلب */}
      {detailTarget && (
        <div className="so-overlay" onClick={() => setDetailTarget(null)}>
          <div className="so-modal" onClick={(e) => e.stopPropagation()}>
            <h3>تفاصيل الطلب</h3>

            <div className="so-detail-row">
              <span>رقم الطلب</span>
              <strong>#{detailTarget._id.slice(-6).toUpperCase()}</strong>
            </div>
            <div className="so-detail-row">
              <span>العميل</span>
              <strong>{detailTarget.buyer?.fullName}</strong>
            </div>
            <div className="so-detail-row">
              <span>الهاتف</span>
              <strong>{detailTarget.buyer?.phone || "—"}</strong>
            </div>
            <div className="so-detail-row">
              <span>مبلغك</span>
              <strong>{detailTarget.subtotal?.toLocaleString("ar-EG")} جنيه</strong>
            </div>
            <div className="so-detail-row">
              <span>طريقة الدفع</span>
              <strong>
                {detailTarget.mainOrder?.paymentMethod === "cod"
                  ? "الدفع عند الاستلام"
                  : "بطاقة ائتمان"}
              </strong>
            </div>
            <div className="so-detail-row">
              <span>الحالة</span>
              <span className={`so-badge ${STATUS[detailTarget.status]?.cls}`}>
                {STATUS[detailTarget.status]?.label}
              </span>
            </div>
            {detailTarget.trackingNumber && (
              <div className="so-detail-row">
                <span>رقم التتبع</span>
                <strong>{detailTarget.trackingNumber}</strong>
              </div>
            )}
            <div className="so-detail-row">
              <span>التاريخ</span>
              <strong>{fmtDate(detailTarget.createdAt)}</strong>
            </div>

            <div className="so-detail-products">
              <p className="so-detail-subtitle">المنتجات:</p>
              {detailTarget.items?.map((item, i) => (
                <div key={i} className="so-detail-product-row">
                  <span>{item.product?.name}</span>
                  <span>× {item.quantity}</span>
                  <span>{(item.price * item.quantity).toLocaleString("ar-EG")} جنيه</span>
                </div>
              ))}
            </div>

            <div className="so-detail-address">
              <p className="so-detail-subtitle">عنوان التوصيل:</p>
              <p>
                {detailTarget.mainOrder?.shippingAddress?.fullName} —{" "}
                {detailTarget.mainOrder?.shippingAddress?.address},{" "}
                {detailTarget.mainOrder?.shippingAddress?.city}
              </p>
            </div>

            <div className="so-modal-actions">
              <button className="so-btn-cancel" onClick={() => setDetailTarget(null)}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="so-toast">
          <strong>{toast.title}</strong>
          <p>{toast.body}</p>
        </div>
      )}
    </div>
    
)}