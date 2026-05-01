import { useState, useEffect } from "react";
import { FaEye, FaCheck, FaTimes, FaSpinner, FaBox } from "react-icons/fa";

function AdminProducts() {
  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [filterStatus, setFilterStatus]   = useState("pending");
  const [search, setSearch]               = useState("");
  const token = localStorage.getItem("token");

  /* ===== جلب المنتجات ===== */
  useEffect(() => {
  setLoading(true);
    fetch("/api/products/admin", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  /* ===== تغيير حالة المنتج ===== */
  const handleStatusChange = async (id, newStatus) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/products/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, status: newStatus } : p))
        );
        if (selectedProduct?._id === id)
          setSelectedProduct((p) => ({ ...p, status: newStatus }));
      }
    } finally {
      setActionLoading(null);
    }
  };

  /* ===== فلترة وبحث ===== */
  const filtered = products
    .filter((p) =>
      filterStatus === "all" ? true : p.status === filterStatus
    )
    .filter((p) =>
      search.trim() === ""
        ? true
        : p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.storeName?.toLowerCase().includes(search.toLowerCase())
    );

  /* ===== إحصائيات ===== */
  const counts = {
    all:      products.length,
    pending:  products.filter((p) => p.status === "pending").length,
    approved: products.filter((p) => p.status === "approved").length,
    rejected: products.filter((p) => p.status === "rejected").length,
  };

  const tabs = [
    { key: "pending",  label: "قيد المراجعة" },
    { key: "approved", label: "موافق عليه" },
    { key: "rejected", label: "مرفوض" },
  ];

  return (
    <main className="dashboard" dir="rtl">
      <h2 className="page-title">إدارة المنتجات</h2>

      {/* ===== كروت إحصائيات ===== */}
      <div className="cards">
        <div className="card yellow">
          <div className="card-num">{counts.pending}</div>
          <div className="card-label">قيد المراجعة</div>
        </div>
        <div className="card green">
          <div className="card-num">{counts.approved}</div>
          <div className="card-label">موافق عليه</div>
        </div>
        <div className="card red">
          <div className="card-num">{counts.rejected}</div>
          <div className="card-label">مرفوض</div>
        </div>
      </div>

      {/* ===== جدول ===== */}
      <div className="table-card">

        {/* بحث */}
        <div style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>
          <input
            type="text"
            placeholder="ابحث باسم المنتج أو المتجر..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem 1rem",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "0.95rem",
              outline: "none",
            }}
          />
        </div>

        {/* تابز */}
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={filterStatus === tab.key ? "active" : ""}
              onClick={() => setFilterStatus(tab.key)}
            >
              {tab.label}
              <span className="tab-count">{counts[tab.key]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state">
            <FaSpinner className="spinner-icon" />
            <span>جاري التحميل...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">لا يوجد منتجات</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>المنتج</th>
                <th>البائع</th>
                <th>السعر</th>
                <th>الفئة</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product._id}>
                  <td className="product-cell">
                    {product.image || (product.images && product.images[0]) ? (
                      <img
                        src={product.image || product.images[0]}
                        alt={product.name}
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "8px",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div className="avatar-circle">
                        <FaBox />
                      </div>
                    )}
                    <span>{product.name}</span>
                  </td>
                  <td>{product.storeName || "—"}</td>
                  <td>{product.price} جنيه</td>
                  <td>{product.category}</td>
                  <td>
                    <span
                      className={`status ${
                        product.status === "approved"
                          ? "approved"
                          : product.status === "rejected"
                          ? "rejected"
                          : "pending"
                      }`}
                    >
                      {product.status === "approved"
                        ? "موافق عليه"
                        : product.status === "rejected"
                        ? "مرفوض"
                        : "قيد المراجعة"}
                    </span>
                  </td>
                  <td className="actions">
                    {actionLoading === product._id ? (
                      <FaSpinner className="spin" />
                    ) : (
                      <>
                        <button
                          className="action-btn view"
                          title="عرض التفاصيل"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <FaEye />
                        </button>
                        {product.status !== "approved" && (
                          <button
                            className="action-btn approve"
                            title="قبول المنتج"
                            onClick={() => handleStatusChange(product._id, "approved")}
                          >
                            <FaCheck />
                          </button>
                        )}
                        {product.status !== "rejected" && (
                          <button
                            className="action-btn reject"
                            title="رفض المنتج"
                            onClick={() => handleStatusChange(product._id, "rejected")}
                          >
                            <FaTimes />
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

      {/* ===== Modal تفاصيل المنتج ===== */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProduct(null)}>✕</button>

            <div className="modal-avatar">
              {selectedProduct.image || (selectedProduct.images && selectedProduct.images[0]) ? (
                <img
                  src={selectedProduct.image || selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "12px",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <FaBox size={40} />
              )}
            </div>

            <h3>{selectedProduct.name}</h3>

            <div className="modal-meta">
              <span>المتجر: <strong>{selectedProduct.storeName || "—"}</strong></span>
              <span>السعر: <strong>{selectedProduct.price} جنيه</strong></span>
              <span>الفئة: <strong>{selectedProduct.category}</strong></span>
              <span>الكمية: <strong>{selectedProduct.quantity}</strong></span>
              {selectedProduct.materials && (
                <span>المواد: <strong>{selectedProduct.materials}</strong></span>
              )}
              {selectedProduct.origin && (
                <span>المنشأ: <strong>{selectedProduct.origin}</strong></span>
              )}
              {selectedProduct.description && (
                <span>الوصف: <strong>{selectedProduct.description}</strong></span>
              )}
              <span>
                الحالة:{" "}
                <strong>
                  {selectedProduct.status === "approved"
                    ? "موافق عليه ✅"
                    : selectedProduct.status === "rejected"
                    ? "مرفوض ❌"
                    : "قيد المراجعة ⏳"}
                </strong>
              </span>
              <span>
                تاريخ الإضافة:{" "}
                <strong>
                  {new Date(selectedProduct.createdAt).toLocaleDateString("ar-EG")}
                </strong>
              </span>
            </div>

            <div className="modal-actions">
              {selectedProduct.status !== "approved" && (
                <button
                  className="modal-btn approve"
                  onClick={() => handleStatusChange(selectedProduct._id, "approved")}
                >
                  <FaCheck /> قبول المنتج
                </button>
              )}
              {selectedProduct.status !== "rejected" && (
                <button
                  className="modal-btn reject"
                  onClick={() => handleStatusChange(selectedProduct._id, "rejected")}
                >
                  <FaTimes /> رفض المنتج
                </button>
              )}
              <button className="modal-btn close" onClick={() => setSelectedProduct(null)}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminProducts;