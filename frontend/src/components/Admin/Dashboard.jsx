import { useState, useEffect } from "react";
import { FaEye, FaCheck, FaTimes, FaSpinner } from "react-icons/fa";
import "../../assets/Admin.css";

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [actionLoading, setActionLoading] = useState(null); // id المنتج اللي بيتعمل عليه action

  // جلب المنتجات من الـ API
const [page, setPage] = useState(1);
const [pages, setPages] = useState(1);

useEffect(() => {
  const token = localStorage.getItem("token");
  setLoading(true);
  fetch(`/api/products/admin?page=${page}&limit=20`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      setProducts(data.data || []);
      setPages(data.pages);
    })
    .finally(() => setLoading(false));
}, [page]);

  const token = localStorage.getItem("token"); // التوكن موجود في localStorage

const handleApprove = async (id) => {
  setActionLoading(id);
  try {
    const res = await fetch(`/api/products/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // ← مهم جدًا
      },
      body: JSON.stringify({ status: "approved" }),
    });

    if (res.ok) {
      const data = await res.json();
      setProducts(prev =>
        prev.map(p => p._id === id ? { ...p, status: "approved" } : p)
      );
      if (selectedProduct?._id === id)
        setSelectedProduct(p => ({ ...p, status: "approved" }));
    } else {
      const err = await res.json();
      console.error(err.error);
    }
  } finally {
    setActionLoading(null);
  }
};

const handleLogout = () => {
  localStorage.clear();
  setDropdownOpen(false);
  navigate("/login");
};

const handleReject = async (id) => {
  setActionLoading(id);
  try {
    const res = await fetch(`/api/products/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ status: "rejected" }),
    });

    if (res.ok) {
      const data = await res.json();
      setProducts(prev =>
        prev.map(p => p._id === id ? { ...p, status: "rejected" } : p)
      );
      if (selectedProduct?._id === id)
        setSelectedProduct(p => ({ ...p, status: "rejected" }));
    } else {
      const err = await res.json();
      console.error(err.error);
    }
  } finally {
    setActionLoading(null);
  }
};

// Delete
const handleDelete = async (id) => {
  setActionLoading(id);
  try {
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      },
    });

    if (res.ok) {
      setProducts(prev => prev.filter(p => p._id !== id));
      if (selectedProduct?._id === id) setSelectedProduct(null);
    } else {
      const err = await res.json();
      console.error(err.error);
    }
  } finally {
    setActionLoading(null);
  }
};

  const filtered = products.filter((p) => p.status === activeTab);
  const pending  = products.filter((p) => p.status === "pending").length;
  const approved = products.filter((p) => p.status === "approved").length;
  const rejected = products.filter((p) => p.status === "rejected").length;

  const tabs = [
    { key: "pending",  label: "قيد المراجعة", count: pending },
    { key: "approved", label: "موافق عليه",   count: approved },
    { key: "rejected", label: "مرفوض",         count: rejected },
  ];

  return (
    <main className="dashboard">

      {/* Stats Cards */}
      <div className="cards">
        <div className="card orange">
          <div className="card-num">{pending}</div>
          <div className="card-label">قيد المراجعة</div>
        </div>
        <div className="card green">
          <div className="card-num">{approved}</div>
          <div className="card-label">موافق عليه</div>
        </div>
        <div className="card red">
          <div className="card-num">{rejected}</div>
          <div className="card-label">مرفوض</div>
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? "active" : ""}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              <span className="tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state">
            <FaSpinner className="spinner-icon" />
            <span>جاري التحميل...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">لا توجد منتجات في هذا القسم</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>المنتج</th>
                <th>البائع</th>
                <th>الفئة</th>
                <th>السعر</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product._id}>
                  <td className="product-cell">
                    {product.image && (
<img
  src={product.image} 
  alt={product.name} 
  loading="lazy" 
  className="product-thumb"
/>
                    )}
                    <span>{product.name}</span>
                  </td>
                  <td>{product.storeName || "—"}</td>
                  <td>{product.category}</td>
                  <td>{product.price} ج.م</td>
                  <td>
                    <span className={`status ${product.status}`}>
                      {product.status === "pending"  && "قيد المراجعة"}
                      {product.status === "approved" && "موافق عليه"}
                      {product.status === "rejected" && "مرفوض"}
                    </span>
                  </td>
                  <td className="actions">
                    {actionLoading === product._id ? (
                      <FaSpinner className="spin" />
                    ) : (
                      <>
                        <button className="action-btn view"
                          title="عرض التفاصيل"
                          onClick={() => setSelectedProduct(product)}>
                          <FaEye />
                        </button>
                        {product.status !== "approved" && (
                          <button className="action-btn approve"
                            title="موافقة"
                            onClick={() => handleApprove(product._id)}>
                            <FaCheck />
                          </button>
                        )}
                        {product.status !== "rejected" && (
                          <button className="action-btn reject"
                            title="رفض"
                            onClick={() => handleReject(product._id)}>
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

      {/* Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProduct(null)}>✕</button>

            {selectedProduct.image && (
              <img src={selectedProduct.image} alt="" className="modal-img" />
            )}

            <h3>{selectedProduct.name}</h3>

            <div className="modal-meta">
              <span>البائع: <strong>{selectedProduct.storeName || "—"}</strong></span>
              <span>السعر: <strong>{selectedProduct.price} ج.م</strong></span>
              <span>الفئة: <strong>{selectedProduct.category}</strong></span>
              {selectedProduct.origin && (
                <span>المنشأ: <strong>{selectedProduct.origin}</strong></span>
              )}
            </div>

            {selectedProduct.description && (
              <p className="modal-desc">{selectedProduct.description}</p>
            )}

            {selectedProduct.ecoFeatures?.length > 0 && (
              <div className="modal-eco">
                {selectedProduct.ecoFeatures.map((f) => (
                  <span key={f} className="eco-tag">🌿 {f}</span>
                ))}
              </div>
            )}

            <div className="modal-actions">
              {selectedProduct.status !== "approved" && (
                <button className="modal-btn approve"
                  onClick={() => handleApprove(selectedProduct._id)}>
                  <FaCheck /> موافقة
                </button>
              )}
              {selectedProduct.status !== "rejected" && (
                <button className="modal-btn reject"
                  onClick={() => handleReject(selectedProduct._id)}>
                  <FaTimes /> رفض
                </button>
              )}
              <button className="modal-btn close"
                onClick={() => setSelectedProduct(null)}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
        
      )}
    </main>
  );
}

export default Dashboard;