import { useState, useEffect } from "react";
import { FaEye, FaSpinner, FaUndo, FaTimes } from "react-icons/fa";
import "../../assets/Admin.css";

const STATUS_LABELS = {
  pending: { label: "قيد الانتظار", className: "status-pending" },
  processing: { label: "جاري المعالجة", className: "status-processing" },
  shipped: { label: "تم الشحن", className: "status-shipped" },
  delivered: { label: "تم التوصيل", className: "status-delivered" },
  cancelled: { label: "ملغي", className: "status-cancelled" },
};

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const token = localStorage.getItem("token");

  /* ================= FETCH ORDERS ================= */
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/orders/admin/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (id, status) => {
    setActionLoading(id);

    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === id ? { ...o, status } : o
          )
        );

        if (selectedOrder?._id === id) {
          setSelectedOrder((o) => ({ ...o, status }));
        }
      }
    } finally {
      setActionLoading(null);
    }
  };

  /* ================= STORE NAMES (FIXED) ================= */
const getStoreNames = (order) => {
  if (!order.items?.length) return "—";

  const names = order.items
    .map((i) => i.seller?.storeName || i.seller?.fullName)
    .filter(Boolean);

  return [...new Set(names)].join(" , ") || "—";
};


  /* ================= FILTER ================= */
  const filtered =
    filterStatus === "all"
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <main className="dashboard" dir="rtl">
      <h2 className="page-title">إدارة الطلبات</h2>

      {/* ================= FILTER ================= */}
      <div className="table-card">
        <div className="tabs">
          {Object.entries({
            all: "الكل",
            ...Object.fromEntries(
              Object.entries(STATUS_LABELS).map(([k, v]) => [
                k,
                v.label,
              ])
            ),
          }).map(([key, label]) => (
            <button
              key={key}
              className={filterStatus === key ? "active" : ""}
              onClick={() => setFilterStatus(key)}
            >
              {label}
              <span className="tab-count">{counts[key]}</span>
            </button>
          ))}
        </div>

        {/* ================= TABLE ================= */}
        {loading ? (
          <div className="loading-state">
            <FaSpinner className="spin" />
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>العميل</th>
                <th>المتجر</th>
                <th>المبلغ</th>
                <th>الحالة</th>
                <th>التاريخ</th>
                <th>الإجراءات</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((order) => (
                <tr key={order._id}>
                  <td>{order.user?.fullName || "—"}</td>

                  {/* 🏪 STORE FIXED */}
                  <td>{getStoreNames(order)}</td>

                  <td>
                    {order.total?.toLocaleString("ar-EG") || 0} ج.م
                  </td>

                  <td>
                    <span
                      className={`status ${
                        STATUS_LABELS[order.status]?.className
                      }`}
                    >
                      {STATUS_LABELS[order.status]?.label}
                    </span>
                  </td>

                  <td>
                    {new Date(order.createdAt).toLocaleDateString(
                      "ar-EG"
                    )}
                  </td>

                  <td className="actions">
                    {actionLoading === order._id ? (
                      <FaSpinner className="spin" />
                    ) : (
                      <>
                        <button
                          className="action-btn view"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <FaEye />
                        </button>

                        {order.status !== "cancelled" && (
                          <button
                            className="action-btn cancel"
                            onClick={() =>
                              updateStatus(order._id, "cancelled")
                            }
                          >
                            <FaTimes />
                          </button>
                        )}

                        {order.status === "cancelled" && (
                          <button
                            className="action-btn restore"
                            onClick={() =>
                              updateStatus(order._id, "pending")
                            }
                          >
                            <FaUndo />
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {selectedOrder && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedOrder(null)}
            >
              ✕
            </button>

            <h3>تفاصيل الطلب</h3>

            {/* BASIC */}
            <div className="modal-meta">
              <span>
                العميل:{" "}
                <strong>{selectedOrder.user?.fullName}</strong>
              </span>

              <span>
                الحالة:{" "}
                <strong>
                  {
                    STATUS_LABELS[selectedOrder.status]?.label
                  }
                </strong>
              </span>

              <span>
                التاريخ:{" "}
                <strong>
                  {new Date(
                    selectedOrder.createdAt
                  ).toLocaleDateString("ar-EG")}
                </strong>
              </span>
            </div>

            {/* STORE */}
            <div className="modal-section">
              <h4>🏪 المتاجر</h4>
              <p>{getStoreNames(selectedOrder)}</p>
            </div>

            {/* SHIPPING */}
            <div className="modal-section">
              <h4>📍 الشحن</h4>
              <p>{selectedOrder.shippingAddress?.address}</p>
              <p>{selectedOrder.shippingAddress?.city}</p>
              <p>{selectedOrder.shippingAddress?.phone}</p>
            </div>

            {/* PAYMENT */}
            <div className="modal-section">
              <h4>💳 الدفع</h4>
              <p>{selectedOrder.paymentMethod}</p>
              <p>{selectedOrder.paymentStatus}</p>
              <p>
                {selectedOrder.total?.toLocaleString("ar-EG")} ج.م
              </p>
            </div>

            {/* ITEMS */}
            <div className="modal-section">
              <h4>🛒 المنتجات</h4>

              <ul className="order-items">
                {selectedOrder.items?.map((item, i) => (
                  <li key={i}>
                    <span>{item.product?.name}</span>
                    <span>
                      {item.seller?.storeName ||
                        item.seller?.fullName}
                    </span>
                    <span>x{item.quantity}</span>
                    <span>{item.price} ج.م</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="modal-actions">
              <button
                className="modal-btn close"
                onClick={() => setSelectedOrder(null)}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminOrders;
