import { useState, useEffect, useCallback } from "react";
import "../../assets/sellerOrders.css";
import SellerLayout from "../../components/Seller/SellerLayout";
import "../../assets/SellerLayout.css";

const STATUS = {
  pending:   { label: "قيد الانتظار", cls: "pending" },
  shipped:   { label: "تم الشحن",     cls: "shipped" },
  delivered: { label: "تم التسليم",   cls: "delivered" },
  cancelled: { label: "ملغي",         cls: "cancelled" },
};

const fmtDate = (iso) =>
  new Date(iso).toLocaleString("ar-EG", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });

export default function SellerOrders() {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState("all");
  const [shipTarget, setShipTarget]   = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [toast, setToast]             = useState(null);


const shipWithMock = async (order) => {
  const res = await fetch(`/api/seller/${order._id}/ship`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
  });

  return await res.json();
};

  const fetchOrders = useCallback(async () => {
  try {
    setLoading(true);

    const res = await fetch("http://localhost:5000/api/seller/my-orders", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    console.log("STATUS:", res.status); // 👈 مهم جدًا

    const text = await res.text();
    console.log("RAW RESPONSE:", text); // 👈 أهم سطر

    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      console.error("NOT JSON RESPONSE");
      json = [];
    }

    console.log("PARSED:", json);

    setOrders(json.orders || json.data || json || []);
  } catch (err) {
    console.error("FETCH ERROR:", err);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

const handleShip = async (order) => {
  const shipRes = await shipWithMock(order);

  if (!shipRes.success) {
    alert(shipRes.message || "فشل الشحن");
    return;
  }

  setOrders((prev) =>
    prev.map((o) =>
      o._id === order._id
        ? { ...o, status: "shipped", trackingNumber: shipRes.trackingNumber }
        : o
    )
  );

  setShipTarget(null);

  setToast({
    title: "تم الشحن 🚚",
    body: shipRes.trackingNumber,
  });

  setTimeout(() => setToast(null), 3000);
};



  const filtered = filter === "all"
    ? orders
    : orders.filter((o) => o.status === filter);

  const counts = {
    all:       orders.length,
    pending:   orders.filter((o) => o.status === "pending").length,
    shipped:   orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  const TABS = [
    { key: "all",       label: "الكل" },
    { key: "pending",   label: "قيد الانتظار" },
    { key: "shipped",   label: "تم الشحن" },
    { key: "delivered", label: "تم التسليم" },
  ];

  return (
    <SellerLayout>

      {/* HEADER */}
      <div className="so-hdr">
        <h1>إدارة الطلبات</h1>
        <p>متابعة كل طلباتك</p>
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
                <th>العميل / المتجر</th>
                <th>المنتجات</th>
                <th>المبلغ</th>
                <th>الحالة</th>
                <th>التاريخ</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="so-empty">لا توجد طلبات</td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order._id}>

                    {/* العميل / المتجر */}
                    <td>
                      <div className="so-customer-name">
                        {order.user?.fullName || "—"}
                      </div>
                      <div className="so-store-name">
                        {order.items?.[0]?.product?.seller?.storeName || "—"}
                      </div>
                    </td>

                    {/* المنتجات */}
                    <td>
                      {order.items?.map((item, i) => (
                        <div key={i} className="so-product-line">
                          {item.product?.name} × {item.quantity}
                        </div>
                      ))}
                    </td>

                    {/* المبلغ */}
                    <td className="so-amount">
                      {order.total?.toLocaleString("ar-EG")} جنيه
                    </td>

                    {/* الحالة */}
                    <td>
                      <span className={`so-badge ${STATUS[order.status]?.cls}`}>
                        {STATUS[order.status]?.label}
                      </span>
                    </td>

                    {/* التاريخ */}
                    <td className="so-date">{fmtDate(order.createdAt)}</td>

                    {/* الإجراءات */}
                    <td>
                      <div className="so-actions">
                        <button
                          className="so-btn-view"
                          onClick={() => setDetailTarget(order)}
                          title="عرض التفاصيل"
                        >
                          👁
                        </button>
                        {order.status === "pending" && (
                          <button
                            className="so-btn-ship"
                            onClick={() => setShipTarget(order)}
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
              هل تريد تأكيد شحن الطلب
              <strong> #{shipTarget._id.slice(-6).toUpperCase()}</strong>؟
            </p>
            <div className="so-modal-actions">
              <button
                className="so-btn-confirm"
                onClick={() => handleShip(shipTarget)}
              >
                🚚 تأكيد الشحن
              </button>
              <button
                className="so-btn-cancel"
                onClick={() => setShipTarget(null)}
              >
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
              <strong>{detailTarget.user?.fullName}</strong>
            </div>
            <div className="so-detail-row">
              <span>المتجر</span>
              <strong>
                {detailTarget.items?.[0]?.product?.seller?.storeName || "—"}
              </strong>
            </div>
            <div className="so-detail-row">
              <span>المبلغ الكلي</span>
              <strong>{detailTarget.total?.toLocaleString("ar-EG")} جنيه</strong>
            </div>
            <div className="so-detail-row">
              <span>طريقة الدفع</span>
              <strong>
                {detailTarget.paymentMethod === "cod"
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
                {detailTarget.shippingAddress?.fullName} —{" "}
                {detailTarget.shippingAddress?.address},{" "}
                {detailTarget.shippingAddress?.city}
              </p>
            </div>

            <div className="so-modal-actions">
              <button
                className="so-btn-cancel"
                onClick={() => setDetailTarget(null)}
              >
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

    </SellerLayout>
  );
}