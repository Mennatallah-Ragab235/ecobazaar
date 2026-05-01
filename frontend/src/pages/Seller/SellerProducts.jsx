import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../assets/SellerProducts.css";
import SellerLayout from "../../components/Seller/SellerLayout";
import "../../assets/SellerLayout.css";

 import { CATEGORIES } from "../../components/Home/Categories";

const statusLabel = {
  approved: { text: "نشط", cls: "approved" },
  pending:  { text: "قيد المراجعة", cls: "pending" },
  rejected: { text: "مرفوض", cls: "rejected" },
};

export default function SellerProducts() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
const [formData, setFormData] = useState(null);

  const token = localStorage.getItem("token");

  /* ================= FETCH ================= */
  useEffect(() => {
    fetch("/api/products/seller/mine", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : data.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SellerLayout>

      {/* HEADER */}
      <div className="sp-header">
        <div>
          <h1 className="sp-title">إدارة المنتجات</h1>
          <p className="sp-sub">إضافة وتعديل منتجاتك</p>
        </div>

        <button
          className="sp-add-btn"
          onClick={() => navigate("/seller/addproduct")}
        >
          + إضافة منتج جديد
        </button>
      </div>

      {/* SEARCH */}
      <div className="sp-search-bar">
        <input
          placeholder="ابحث عن منتج..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="table-card">

        {loading ? (
          <div>جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div>لا توجد منتجات</div>
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
                        src={
                          p.image ||
                          p.images?.[0] ||
                          "https://placehold.co/40x40"
                        }
                        alt=""
                      />
                      <span>{p.name}</span>
                    </td>

                    <td>{p.category}</td>
                    <td>جنيه {p.price}</td>

                    <td className={p.quantity === 0 ? "sp-zero" : ""}>
                      {p.quantity}
                    </td>

                    <td>
                      <span className={`status ${st.cls}`}>
                        {st.text}
                      </span>
                    </td>

                    <td>
  <div className="sp-actions">

    <button
      className="sp-btn-edit"
     onClick={() => {
  setEditProduct(p);
 setFormData({
  name: p?.name || "",
  price: p?.price || "",
  quantity: p?.quantity || "",
  category: p?.category || "",
  description: p?.description || "",
});
}}
    >
      تعديل
    </button>

    <button
      className="sp-btn-delete"
      onClick={() => setDeleteId(p._id)}
    >
      حذف
    </button>

  </div>
</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODALS (نفسها زي ما هي) */}
 {editProduct && (
  <div className="modal-overlay">
    <div className="modal sp-modal">

      <h3>تعديل المنتج</h3>

      <div className="sp-edit-grid">

        {/* الاسم */}
        <div className="sp-field sp-full">
          <label>اسم المنتج</label>
          <input
            value={formData.name || ""}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
        </div>

        {/* السعر */}
        <div className="sp-field">
          <label>السعر</label>
          <input
            type="number"
            value={formData.price || ""}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
          />
        </div>

        {/* المخزون */}
        <div className="sp-field">
          <label>المخزون</label>
          <input
            type="number"
            value={formData.quantity || ""}
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
          />
        </div>

        {/* الفئة */}
        <div className="sp-field sp-full">
          <label>الفئة</label>
          <select
            value={formData.category || ""}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            <option value="">اختار الفئة</option>
           {CATEGORIES.map((c) => (
  <option key={c.value} value={c.value}>
    {c.label}
  </option>
))}
          </select>
        </div>

        {/* الوصف */}
        <div className="sp-field sp-full">
          <label>الوصف</label>
          <textarea
            rows="4"
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

      </div>

      {/* أزرار */}
      <div className="modal-actions">

        <button
          className="modal-btn approve"
          disabled={saving}
          onClick={async () => {
            try {
              setSaving(true);

              const res = await fetch(
                `/api/products/${editProduct._id}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify(formData),
                }
              );

              if (!res.ok) throw new Error();

              const updated = await res.json();

              setProducts((prev) =>
                prev.map((p) =>
                  p._id === editProduct._id ? updated : p
                )
              );

              setEditProduct(null);
              setFormData(null);

            } catch {
              setError("حصل خطأ أثناء التعديل");
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>

        <button
          className="modal-btn close"
          onClick={() => {
            setEditProduct(null);
            setFormData(null);
          }}
        >
          إلغاء
        </button>

      </div>

    </div>
  </div>
)}

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>تأكيد الحذف</h3>
            <button onClick={() => setDeleteId(null)}>إلغاء</button>
          </div>
        </div>
      )}

    </SellerLayout>
  );
}