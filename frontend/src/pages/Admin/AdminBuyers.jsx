import { useState, useEffect } from "react";
import { FaEye, FaCheck, FaTimes, FaSpinner, FaUser } from "react-icons/fa";
import "../../assets/Admin.css";

function AdminBuyers() {
  const [buyers, setBuyers]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [filterStatus, setFilterStatus]   = useState("all");
  const [search, setSearch]               = useState("");
  const token = localStorage.getItem("token");

  /* ===== جلب المشترين ===== */
  useEffect(() => {
    setLoading(true);
    fetch("/api/auth/admin/buyers", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setBuyers(Array.isArray(data) ? data : data.buyers || []))
      .catch(() => setBuyers([]))
      .finally(() => setLoading(false));
  }, []);

  /* ===== تفعيل / تعطيل المشتري ===== */
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
        setBuyers((prev) =>
          prev.map((b) => (b._id === id ? { ...b, isActive: !currentStatus } : b))
        );
        if (selectedBuyer?._id === id)
          setSelectedBuyer((b) => ({ ...b, isActive: !currentStatus }));
      }
    } finally {
      setActionLoading(null);
    }
  };

  /* ===== فلترة وبحث ===== */
  const filtered = buyers
    .filter((b) =>
      filterStatus === "all"
        ? true
        : filterStatus === "active"
        ? b.isActive
        : !b.isActive
    )
    .filter((b) =>
      search.trim() === ""
        ? true
        : b.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          b.email?.toLowerCase().includes(search.toLowerCase())
    );

  /* ===== إحصائيات ===== */
  const counts = {
    all:      buyers.length,
    active:   buyers.filter((b) => b.isActive).length,
    inactive: buyers.filter((b) => !b.isActive).length,
  };

  const tabs = [
    { key: "all",      label: "الكل" },
    { key: "active",   label: "نشط" },
    { key: "inactive", label: "موقوف" },
  ];

  return (
    <main className="dashboard" dir="rtl">
      <h2 className="page-title">إدارة المشترين</h2>

      {/* ===== كروت إحصائيات ===== */}
      <div className="cards">
        <div className="card blue">
          <div className="card-num">{counts.all}</div>
          <div className="card-label">إجمالي المشترين</div>
        </div>
        <div className="card green">
          <div className="card-num">{counts.active}</div>
          <div className="card-label">نشط</div>
        </div>
        <div className="card red">
          <div className="card-num">{counts.inactive}</div>
          <div className="card-label">موقوف</div>
        </div>
      </div>

      {/* ===== جدول ===== */}
      <div className="table-card">

        {/* بحث */}
        <div style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>
          <input
            type="text"
            placeholder="ابحث باسم المشتري أو البريد..."
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
          <div className="empty-state">لا يوجد مشترين</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>المشتري</th>
                <th>البريد الإلكتروني</th>
                <th>الهاتف</th>
                <th>تاريخ التسجيل</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((buyer) => (
                <tr key={buyer._id}>
                  <td className="product-cell">
                    <div className="avatar-circle">
                      <FaUser />
                    </div>
                    <span>{buyer.fullName}</span>
                  </td>
                  <td>{buyer.email}</td>
                  <td>{buyer.phone || "—"}</td>
                  <td>{new Date(buyer.createdAt).toLocaleDateString("ar-EG")}</td>
                  <td>
                    <span className={`status ${buyer.isActive ? "approved" : "rejected"}`}>
                      {buyer.isActive ? "نشط" : "موقوف"}
                    </span>
                  </td>
                  <td className="actions">
                    {actionLoading === buyer._id ? (
                      <FaSpinner className="spin" />
                    ) : (
                      <>
                        <button
                          className="action-btn view"
                          title="عرض التفاصيل"
                          onClick={() => setSelectedBuyer(buyer)}
                        >
                          <FaEye />
                        </button>
                        <button
                          className={`action-btn ${buyer.isActive ? "reject" : "approve"}`}
                          title={buyer.isActive ? "إيقاف المشتري" : "تفعيل المشتري"}
                          onClick={() => handleToggleActive(buyer._id, buyer.isActive)}
                        >
                          {buyer.isActive ? <FaTimes /> : <FaCheck />}
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

      {/* ===== Modal تفاصيل المشتري ===== */}
      {selectedBuyer && (
        <div className="modal-overlay" onClick={() => setSelectedBuyer(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedBuyer(null)}>✕</button>

            <div className="modal-avatar">
              <FaUser size={40} />
            </div>

            <h3>{selectedBuyer.fullName}</h3>

            <div className="modal-meta">
              <span>البريد: <strong>{selectedBuyer.email}</strong></span>
              <span>الهاتف: <strong>{selectedBuyer.phone || "—"}</strong></span>
              {selectedBuyer.address && (
                <span>العنوان: <strong>{selectedBuyer.address}</strong></span>
              )}
              {selectedBuyer.city && (
                <span>المدينة: <strong>{selectedBuyer.city}</strong></span>
              )}
              <span>
                الحالة:{" "}
                <strong>
                  {selectedBuyer.isActive ? "نشط ✅" : "موقوف ❌"}
                </strong>
              </span>
              <span>
                تاريخ التسجيل:{" "}
                <strong>
                  {new Date(selectedBuyer.createdAt).toLocaleDateString("ar-EG")}
                </strong>
              </span>
            </div>

            <div className="modal-actions">
              <button
                className={`modal-btn ${selectedBuyer.isActive ? "reject" : "approve"}`}
                onClick={() => handleToggleActive(selectedBuyer._id, selectedBuyer.isActive)}
              >
                {selectedBuyer.isActive ? <><FaTimes /> إيقاف الحساب</> : <><FaCheck /> تفعيل الحساب</>}
              </button>
              <button className="modal-btn close" onClick={() => setSelectedBuyer(null)}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminBuyers;