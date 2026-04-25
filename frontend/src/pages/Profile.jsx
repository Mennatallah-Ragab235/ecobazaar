import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/Profile.css";

const STATUS_MAP = {
  pending:   { label: "قيد الانتظار", class: "status-pending" },
  confirmed: { label: "مؤكد",         class: "status-confirmed" },
  paid:      { label: "تم الدفع",     class: "status-paid" },
  shipped:   { label: "في الطريق",    class: "status-shipped" },
  delivered: { label: "تم التسليم",   class: "status-delivered" },
  cancelled: { label: "ملغي",         class: "status-cancelled" },
};

function Profile() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [user, setUser]         = useState(null);
  const [orders, setOrders]     = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("orders");

  // تعديل البيانات
  const [fullName, setFullName] = useState("");
  const [phone, setPhone]       = useState("");
  const [address, setAddress]   = useState("");
  const [saveMsg, setSaveMsg]   = useState("");
  const [saving, setSaving]     = useState(false);

  // تغيير كلمة السر
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmNew, setConfirmNew]           = useState("");
  const [passMsg, setPassMsg]                 = useState("");
  const [passErr, setPassErr]                 = useState("");
  const [changingPass, setChangingPass]       = useState(false);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }

    const fetchData = async () => {
      try {
        const [userRes, ordersRes, wishlistRes] = await Promise.all([
          fetch("/api/auth/profile",  { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/orders",        { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/wishlist",      { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const userData = await userRes.json();
        setUser(userData);
        setFullName(userData.fullName || "");
        setPhone(userData.phone || "");
        setAddress(userData.address || "");

        const ordersData = await ordersRes.json();
        setOrders(Array.isArray(ordersData) ? ordersData : ordersData?.orders || []);

        const wishlistData = await wishlistRes.json();
        setWishlist(Array.isArray(wishlistData) ? wishlistData : []);

      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ fullName, phone, address })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setSaveMsg("✅ تم حفظ البيانات بنجاح");
      } else {
        setSaveMsg("❌ حدث خطأ");
      }
    } catch {
      setSaveMsg("❌ حدث خطأ");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
  };

  const handleChangePassword = async () => {
    setPassMsg("");
    setPassErr("");
    if (!currentPassword || !newPassword || !confirmNew) {
      setPassErr("من فضلك أكمل جميع الحقول");
      return;
    }
    if (newPassword !== confirmNew) {
      setPassErr("كلمة السر الجديدة غير متطابقة");
      return;
    }
    if (newPassword.length < 6) {
      setPassErr("كلمة السر الجديدة لازم تكون 6 أحرف على الأقل");
      return;
    }
    setChangingPass(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setPassMsg("✅ تم تغيير كلمة السر بنجاح");
        setCurrentPassword(""); setNewPassword(""); setConfirmNew("");
      } else {
        setPassErr(data.error || "❌ حدث خطأ");
      }
    } catch {
      setPassErr("❌ حدث خطأ");
    } finally {
      setChangingPass(false);
      setTimeout(() => { setPassMsg(""); setPassErr(""); }, 4000);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      setWishlist(prev => prev.filter(p => p._id !== productId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="profile-loading">جارٍ التحميل...</div>;

  return (
    <div className="profile-page" dir="rtl">

      {/* ── Header ثابت ── */}
      <div className="profile-header">
        <div className="profile-avatar-circle">
          {user?.fullName?.charAt(0) || "؟"}
        </div>
        <div className="profile-header-info">
          <div className="profile-header-name">{user?.fullName}</div>
          <div className="profile-header-email">{user?.email}</div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="profile-tabs">
        {[
          { key: "orders",   label: "الطلبات",       icon: "📦" },
          { key: "wishlist", label: "المفضلة",       icon: "🤍" },
          { key: "profile",  label: "الملف الشخصي",  icon: "👤" },
        ].map(t => (
          <button key={t.key}
            className={`profile-tab ${activeTab === t.key ? "active" : ""}`}
            onClick={() => setActiveTab(t.key)}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* ── ORDERS TAB ── */}
      {activeTab === "orders" && (
        <div className="profile-section">
          <h2 className="section-title">طلباتي</h2>
          {orders.length === 0 ? (
            <div className="empty-state-box">
              <span>📦</span>
              <p>لا يوجد طلبات بعد</p>
            </div>
          ) : (
            orders.map(order => {
              const st = STATUS_MAP[order.status] || { label: order.status, class: "status-pending" };
              const date = new Date(order.createdAt).toLocaleDateString("ar-EG", {
                year: "numeric", month: "2-digit", day: "2-digit"
              });
              return (
                <div key={order._id} className="order-card">
                  <div className="order-card-top">
                    <div className="order-card-info">
                      <span className="order-id">ORD-{order._id.slice(-6).toUpperCase()}</span>
                      <span className={`order-status ${st.class}`}>{st.label}</span>
                    </div>
                    <button className="order-details-btn"
                      onClick={() => navigate(`/order/${order._id}`)}>
                      عرض التفاصيل
                    </button>
                  </div>
                  <div className="order-card-bottom">
                    <span>تاريخ الطلب: {date}</span>
                    <span>{order.items?.length || 0} منتجات — {order.total?.toLocaleString("ar-EG")} جنيه</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── WISHLIST TAB ── */}
      {activeTab === "wishlist" && (
        <div className="profile-section">
          <h2 className="section-title">المفضلة</h2>
          {wishlist.length === 0 ? (
            <div className="empty-state-box">
              <span>🤍</span>
              <p>لا يوجد منتجات في المفضلة</p>
            </div>
          ) : (
            <div className="wishlist-grid">
              {wishlist.map(product => {
                const img = product.image ||
                  (Array.isArray(product.images) && product.images[0]) || "";
                return (
                  <div key={product._id} className="wishlist-card"
                    onClick={() => navigate(`/product/${product._id}`)}>
                    <div className="wishlist-card-img">
                      {img ? <img src={img} alt={product.name} /> : "🌿"}
                    </div>
                    <div className="wishlist-card-body">
                      <div className="wishlist-card-name">{product.name}</div>
                      <div className="wishlist-card-price">
                        {parseFloat(product.price || 0).toLocaleString("ar-EG")} جنيه
                      </div>
                    </div>
                    <button className="wishlist-remove-btn"
                      onClick={e => { e.stopPropagation(); removeFromWishlist(product._id); }}
                      title="إزالة من المفضلة">
                      ❤️
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── PROFILE TAB ── */}
      {activeTab === "profile" && (
        <div className="profile-section">

          {/* تعديل البيانات */}
          <div className="profile-info-card">
            <h3>تعديل البيانات</h3>
            <div className="profile-form">
              <div className="profile-form-group">
                <label>الاسم الكامل</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="الاسم الكامل" />
              </div>
              <div className="profile-form-group">
                <label>البريد الإلكتروني</label>
                <input value={user?.email} disabled className="input-disabled" />
              </div>
              <div className="profile-form-group">
                <label>رقم الهاتف</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="010xxxxxxxx" />
              </div>
              
            </div>
            {saveMsg && <div className="profile-msg">{saveMsg}</div>}
            <button className="profile-save-btn" onClick={handleSaveProfile} disabled={saving}>
              {saving ? "جارٍ الحفظ..." : "💾 حفظ التغييرات"}
            </button>
          </div>

          {/* تغيير كلمة السر */}
          <div className="profile-info-card">
            <h3>تغيير كلمة السر</h3>
            <div className="profile-form">
              <div className="profile-form-group full">
                <label>كلمة السر الحالية</label>
                <input type="password" value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="أدخل كلمة السر الحالية" />
              </div>
              <div className="profile-form-group">
                <label>كلمة السر الجديدة</label>
                <input type="password" value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="كلمة السر الجديدة" />
              </div>
              <div className="profile-form-group">
                <label>تأكيد كلمة السر</label>
                <input type="password" value={confirmNew}
                  onChange={e => setConfirmNew(e.target.value)}
                  placeholder="أعد كتابة كلمة السر" />
              </div>
            </div>
            {passErr && <div className="profile-msg error">{passErr}</div>}
            {passMsg && <div className="profile-msg">{passMsg}</div>}
            <button className="profile-save-btn" onClick={handleChangePassword} disabled={changingPass}>
              {changingPass ? "جارٍ التغيير..." : "🔒 تغيير كلمة السر"}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

export default Profile;