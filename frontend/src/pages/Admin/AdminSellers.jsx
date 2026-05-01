import { useState, useEffect } from "react";
import { FaEye, FaCheck, FaTimes, FaSpinner, FaStore } from "react-icons/fa";
import "../../assets/Admin.css";

function AdminSellers() {
  const [sellers, setSellers]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [actionLoading, setActionLoading]   = useState(null);
  const [filterStatus, setFilterStatus]     = useState("all");
  const token = localStorage.getItem("token");

  /* ===== جلب البائعين ===== */
  useEffect(() => {
    setLoading(true);
    fetch("/api/auth/admin/sellers", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSellers(Array.isArray(data) ? data : data.sellers || []))
      .catch(() => setSellers([]))
      .finally(() => setLoading(false));
  }, []);

  /* ===== تفعيل / تعطيل البائع ===== */
  const handleToggleActive = async (id, currentStatus) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/auth/admin/users/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        setSellers((prev) =>
          prev.map((s) => (s._id === id ? { ...s, isActive: !currentStatus } : s))
        );
        if (selectedSeller?._id === id)
          setSelectedSeller((s) => ({ ...s, isActive: !currentStatus }));
      }
    } finally {
      setActionLoading(null);
    }
  };

  /* ===== قبول / رفض البائع ===== */
  const handleVerify = async (id, isVerified) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/auth/admin/users/${id}/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isVerified }),
      });
      if (res.ok) {
        setSellers((prev) =>
          prev.map((s) => (s._id === id ? { ...s, isVerified } : s))
        );
        if (selectedSeller?._id === id)
          setSelectedSeller((s) => ({ ...s, isVerified }));
      }
    } finally {
      setActionLoading(null);
    }
  };

  /* ===== فلترة ===== */
  const filtered =
    filterStatus === "all"
      ? sellers
      : filterStatus === "verified"
      ? sellers.filter((s) => s.isVerified)
      : filterStatus === "pending"
      ? sellers.filter((s) => !s.isVerified && s.isActive)
      : sellers.filter((s) => !s.isActive);

  /* ===== إحصائيات ===== */
  const counts = {
    all:      sellers.length,
    verified: sellers.filter((s) => s.isVerified).length,
    pending:  sellers.filter((s) => !s.isVerified && s.isActive).length,
    inactive: sellers.filter((s) => !s.isActive).length,
  };

  const tabs = [
    { key: "all",      label: "الكل" },
    { key: "verified", label: "نشط" },
    { key: "pending",  label: "قيد المراجعة" },
    { key: "inactive", label: "موقوف" },
  ];

  return (
    <main className="dashboard" dir="rtl">
      <h2 className="page-title">إدارة البائعين</h2>

      {/* ===== كروت إحصائيات ===== */}
      <div className="cards">
        <div className="card blue">
          <div className="card-num">{counts.all}</div>
          <div className="card-label">إجمالي البائعين</div>
        </div>
        <div className="card green">
          <div className="card-num">{counts.verified}</div>
          <div className="card-label">نشط</div>
        </div>
        <div className="card orange">
          <div className="card-num">{counts.pending}</div>
          <div className="card-label">قيد المراجعة</div>
        </div>
        <div className="card red">
          <div className="card-num">{counts.inactive}</div>
          <div className="card-label">موقوف</div>
        </div>
      </div>

      {/* ===== جدول ===== */}
      <div className="table-card">
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
          <div className="empty-state">لا يوجد بائعين</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>البائع</th>
                <th>اسم المتجر</th>
                <th>البريد الإلكتروني</th>
                <th>الهاتف</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((seller) => (
                <tr key={seller._id}>
                  <td className="product-cell">
                    <div className="avatar-circle">
                      <FaStore />
                    </div>
                    <span>{seller.fullName}</span>
                  </td>
                  <td>{seller.storeName || "—"}</td>
                  <td>{seller.email}</td>
                  <td>{seller.phone || "—"}</td>
                  <td>
                    <span className={`status ${seller.isVerified ? "approved" : seller.isActive ? "pending" : "rejected"}`}>
                      {seller.isVerified ? "نشط" : seller.isActive ? "قيد المراجعة" : "موقوف"}
                    </span>
                  </td>
                  <td className="actions">
                    {actionLoading === seller._id ? (
                      <FaSpinner className="spin" />
                    ) : (
                      <>
                        <button
                          className="action-btn view"
                          title="عرض التفاصيل"
                          onClick={() => setSelectedSeller(seller)}
                        >
                          <FaEye />
                        </button>
                        {!seller.isVerified && (
                          <button
                            className="action-btn approve"
                            title="قبول البائع"
                            onClick={() => handleVerify(seller._id, true)}
                          >
                            <FaCheck />
                          </button>
                        )}
                        <button
                          className={`action-btn ${seller.isActive ? "reject" : "approve"}`}
                          title={seller.isActive ? "إيقاف البائع" : "تفعيل البائع"}
                          onClick={() => handleToggleActive(seller._id, seller.isActive)}
                        >
                          {seller.isActive ? <FaTimes /> : <FaCheck />}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ===== Modal تفاصيل البائع ===== */}
      {selectedSeller && (
        <div className="modal-overlay" onClick={() => setSelectedSeller(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedSeller(null)}>✕</button>

            <div className="modal-avatar">
              <FaStore size={40} />
            </div>

            <h3>{selectedSeller.fullName}</h3>
            <p style={{ color: "#666", marginBottom: "1rem" }}>{selectedSeller.storeName}</p>

            <div className="modal-meta">
              <span>البريد: <strong>{selectedSeller.email}</strong></span>
              <span>الهاتف: <strong>{selectedSeller.phone || "—"}</strong></span>
              <span>المتجر: <strong>{selectedSeller.storeName || "—"}</strong></span>
              {selectedSeller.storeDescription && (
                <span>وصف المتجر: <strong>{selectedSeller.storeDescription}</strong></span>
              )}
              {selectedSeller.productCategory && (
                <span>الفئة: <strong>{selectedSeller.productCategory}</strong></span>
              )}
              {selectedSeller.website && (
                <span>الموقع: <strong>{selectedSeller.website}</strong></span>
              )}
              <span>
                الحالة:{" "}
                <strong className={selectedSeller.isVerified ? "text-green" : "text-orange"}>
                  {selectedSeller.isVerified ? "نشط ✅" : "قيد المراجعة ⏳"}
                </strong>
              </span>
              <span>تاريخ التسجيل: <strong>{new Date(selectedSeller.createdAt).toLocaleDateString("ar-EG")}</strong></span>
            </div>

            <div className="modal-actions">
              {!selectedSeller.isVerified && (
                <button
                  className="modal-btn approve"
                  onClick={() => handleVerify(selectedSeller._id, true)}
                >
                  <FaCheck /> قبول البائع
                </button>
              )}
              <button
                className={`modal-btn ${selectedSeller.isActive ? "reject" : "approve"}`}
                onClick={() => handleToggleActive(selectedSeller._id, selectedSeller.isActive)}
              >
                {selectedSeller.isActive ? <><FaTimes /> إيقاف</> : <><FaCheck /> تفعيل</>}
              </button>
              <button className="modal-btn close" onClick={() => setSelectedSeller(null)}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminSellers;