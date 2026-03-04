import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/Admin.css";
import "../../assets/SellerProducts.css";

const statusLabel = {
  approved: { text: "نشط", cls: "approved" },
  pending:  { text: "قيد المراجعة", cls: "pending" },
  rejected: { text: "مرفوض", cls: "rejected" },
};

export default function SellerProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const token = localStorage.getItem("token");
  const user  = token ? JSON.parse(localStorage.getItem("user") || "{}") : null;

  // ── جلب منتجات البائع ──
  useEffect(() => {
    fetch("/api/products/seller/mine", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : data.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  // ── click outside dropdown ──
  useEffect(() => {
    const fn = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  // ── حذف ──
  const handleDelete = async () => {
    try {
      await fetch(`/api/products/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((p) => p.filter((x) => x._id !== deleteId));
    } finally {
      setDeleteId(null);
    }
  };

  // ── حفظ التعديل ──
  const handleSave = async () => {
  setSaving(true);
  setError("");
  try {
    const res = await fetch(`http://localhost:5000/api/products/${editProduct._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name:        editProduct.name,
        description: editProduct.description,
        category:    editProduct.category,
        price:       Number(editProduct.price),
        quantity:    Number(editProduct.quantity),
        storeName:   editProduct.storeName,
        image:       editProduct.image,  // base64 أو URL
        images:      editProduct.images,
      }),
    });

    // ← المشكلة هنا — لو الـ response مش JSON هيطلع error
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("خطأ في السيرفر: " + text.slice(0, 100));
    }

    if (!res.ok) throw new Error(data.error || "فشل التعديل");
    setProducts((p) =>
      p.map((x) => (x._id === editProduct._id ? { ...x, ...data.product } : x))
    );
    setEditProduct(null);
  } catch (err) {
    setError(err.message);
  } finally {
    setSaving(false);
  }
};

  // ── رفع صورة جديدة في Edit ──
  const handleEditImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setEditProduct((p) => ({ ...p, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const navItems = [
    { icon: "📦", label: "المنتجات",    path: "/seller/products", active: true },
    { icon: "🛒", label: "الطلبات",     path: "" },
    { icon: "💰", label: "الإيرادات",   path: "" },
  ];

  return (
    <div className="ap-page">

      {/* ── Navbar ── */}
      <div className="ap-navbar">
        <div className="ap-navbar-left">
          <span className="ap-logo-icon">🌿</span>
          <div>
            <div className="ap-logo-name">EcoBazaar</div>
            <div className="ap-logo-sub">لوحة البائع</div>
          </div>
        </div>
        <div className="ap-navbar-right">
          <div className="profile-wrapper" ref={dropdownRef}>
            <button className="nav-btn user-btn" onClick={() => user ? setDropdownOpen(p => !p) : navigate("/login")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
            {dropdownOpen && user && (
              <div className="profile-dropdown">
                <div className="dropdown-user-info">
                  <div className="dropdown-avatar">{user.fullName?.charAt(0)?.toUpperCase() || "U"}</div>
                  <div>
                    <div className="dropdown-name">{user.fullName}</div>
                    <div className="dropdown-email">{user.email}</div>
                  </div>
                </div>
                <div className="dropdown-divider"/>
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="ap-body">

        {/* Sidebar */}
        <aside className="ap-sidebar">
          <nav className="ap-nav">
            {navItems.map((item) => (
              <div key={item.label}
                className={`ap-nav-item ${item.active ? "active" : ""}`}
                onClick={() => navigate(item.path)}>
                <span className="ap-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
            <div className="ap-nav-item" onClick={() => navigate("/seller/addproduct")}>
              <span className="ap-nav-icon">➕</span>
              <span>إضافة منتج</span>
            </div>
          </nav>
          <span id="ap-nav-logout" onClick={handleLogout}>← تسجيل الخروج</span>
        </aside>

        {/* Main */}
        <main className="ap-main">

          {/* Header */}
          <div className="sp-header">
            <div>
              <h1 className="sp-title">إدارة المنتجات</h1>
              <p className="sp-sub">إضافة وتعديل منتجاتك</p>
            </div>
            <button className="sp-add-btn" onClick={() => navigate("/seller/addproduct")}>
              + إضافة منتج جديد
            </button>
          </div>

          {/* Search */}
          <div className="sp-search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" width="18" height="18">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              placeholder="ابحث عن منتج..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="table-card">
            {loading ? (
              <div className="loading-state">جاري التحميل...</div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                {search ? "لا توجد نتائج" : "لا توجد منتجات — أضف منتجك الأول!"}
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>المنتج</th>
                    <th>الفئة</th>
                    <th>السعر</th>
                    <th>المخزون</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const st = statusLabel[p.status] || statusLabel.pending;
                    return (
                      <tr key={p._id}>
                        <td className="product-cell">
                          <img
                            className="product-thumb"
                            src={p.image || p.images?.[0] || "https://placehold.co/40x40?text=📦"}
                            alt={p.name}
                          />
                          <span>{p.name}</span>
                        </td>
                        <td>{p.category}</td>
                        <td>جنيه {p.price}</td>
                        <td className={p.quantity === 0 ? "sp-zero" : ""}>{p.quantity}</td>
                        <td>
                          <span className={`status ${st.cls}`}>{st.text}</span>
                        </td>
                        <td className="actions">
                          {/* عرض */}
                          <button className="action-btn view" title="عرض"
                            onClick={() => setEditProduct({ ...p, _viewOnly: true })}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          </button>
                          {/* تعديل */}
                          <button className="action-btn approve" title="تعديل"
                            onClick={() => setEditProduct({ ...p, _viewOnly: false })}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          {/* حذف */}
                          <button className="action-btn reject" title="حذف"
                            onClick={() => setDeleteId(p._id)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {/* ── Modal تعديل/عرض ── */}
      {editProduct && (
        <div className="modal-overlay" onClick={() => setEditProduct(null)}>
          <div className="modal sp-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setEditProduct(null)}>✕</button>
            <h3>{editProduct._viewOnly ? "تفاصيل المنتج" : "تعديل المنتج"}</h3>

            {/* صورة */}
            <div className="sp-img-wrap">
              <img
                src={editProduct.image || editProduct.images?.[0] || "https://placehold.co/200x200?text=📦"}
                alt=""
              />
              {!editProduct._viewOnly && (
                <label className="sp-img-change">
                  تغيير الصورة
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleEditImage} />
                </label>
              )}
            </div>

            {error && <div className="ap-alert red"><strong>❌ {error}</strong></div>}

            <div className="sp-edit-grid">
              <div className="sp-field">
                <label>اسم المنتج</label>
                <input value={editProduct.name} disabled={editProduct._viewOnly}
                  onChange={(e) => setEditProduct(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="sp-field">
                <label>الفئة</label>
                <input value={editProduct.category} disabled={editProduct._viewOnly}
                  onChange={(e) => setEditProduct(p => ({ ...p, category: e.target.value }))} />
              </div>
              <div className="sp-field">
                <label>السعر</label>
                <input type="number" value={editProduct.price} disabled={editProduct._viewOnly}
                  onChange={(e) => setEditProduct(p => ({ ...p, price: e.target.value }))} />
              </div>
              <div className="sp-field">
                <label>المخزون</label>
                <input type="number" value={editProduct.quantity} disabled={editProduct._viewOnly}
                  onChange={(e) => setEditProduct(p => ({ ...p, quantity: e.target.value }))} />
              </div>
              <div className="sp-field sp-full">
                <label>الوصف</label>
                <textarea rows={3} value={editProduct.description || ""} disabled={editProduct._viewOnly}
                  onChange={(e) => setEditProduct(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>

            {!editProduct._viewOnly && (
              <div className="modal-actions">
                <button className="modal-btn approve" onClick={handleSave} disabled={saving}>
                  {saving ? "جاري الحفظ..." : "💾 حفظ التعديلات"}
                </button>
                <button className="modal-btn close" onClick={() => setEditProduct(null)}>إلغاء</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal تأكيد الحذف ── */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 380, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <h3>تأكيد الحذف</h3>
            <p style={{ color: "#666", marginBottom: 20 }}>هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع.</p>
            <div className="modal-actions" style={{ justifyContent: "center" }}>
              <button className="modal-btn reject" onClick={handleDelete}>نعم، احذف</button>
              <button className="modal-btn close" onClick={() => setDeleteId(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}