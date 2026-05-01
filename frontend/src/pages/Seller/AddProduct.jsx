import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/AddProduct.css";
import "../../assets/Auth.css";
import "../../assets/Navbar.css";
import { CATEGORIES } from "../../components/Home/Categories";
import SellerLayout from "../../components/Seller/SellerLayout";
import "../../assets/SellerLayout.css";

const ecoFeatures = [
  { id: "recyclable",    label: "قابل لإعادة التدوير" },
  { id: "biodegradable", label: "قابل للتحلل الحيوي" },
  { id: "organic",       label: "عضوي معتمد" },
  { id: "noChemicals",   label: "خالٍ من المواد الكيميائية" },
  { id: "ecoPackaging",  label: "تغليف صديق للبيئة" },
  { id: "localMade",     label: "صناعة محلية" },
  { id: "energySaving",  label: "موفر للطاقة" },
  { id: "crueltyfree",   label: "خالٍ من القسوة على الحيوانات" },
];

const checklist = [
  "جميع المعلومات الأساسية مكتملة ودقيقة",
  "تم رفع صورة واحدة على الأقل بجودة عالية",
  "الوصف واضح ويشمل الفوائد البيئية",
  "السعر والكمية المتاحة محدّثة",
  "تم اختيار الميزات البيئية المناسبة",
];



export default function AddProduct() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user  = token ? JSON.parse(localStorage.getItem("user") || "{}") : null;

  const [form, setForm] = useState({
    name: "",
    storeName: user?.storeName || "", // ✅ يتملى تلقائياً
    description: "",
    category: "",
    price: "",
    quantity: "0",
    sku: "",
    certificates: "",
    materials: "",
    origin: "",
    weight: "0.0",
  });

  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [images, setImages]       = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const fileInputRef = useRef();
  const dropdownRef  = useRef(null);

  // ✅ لو storeName مش موجود في localStorage، اجلبه من الـ API
  useEffect(() => {
    if (!user?.storeName && token) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.storeName) {
            setForm((prev) => ({ ...prev, storeName: data.storeName }));
            // حدّث الـ user في localStorage
            const updated = { ...user, storeName: data.storeName };
            localStorage.setItem("user", JSON.stringify(updated));
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const toggleFeature = (id) =>
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );

  const removeImage = (index) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImgs = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImgs].slice(0, 6));
    e.target.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (images.length === 0) {
      setError("يجب رفع صورة واحدة على الأقل للمنتج");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name",         form.name);
      formData.append("storeName",    form.storeName);
      formData.append("description",  form.description);
      formData.append("category",     form.category);
      formData.append("price",        Number(form.price));
      formData.append("quantity",     Number(form.quantity));
      formData.append("weight",       Number(form.weight));
      formData.append("sku",          form.sku);
      formData.append("certificates", form.certificates);
      formData.append("materials",    form.materials);
      formData.append("origin",       form.origin);
      formData.append("status",       "pending");
      selectedFeatures.forEach((f) => formData.append("ecoFeatures[]", f));
      images.forEach((img) => formData.append("images", img.file));

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "فشل إضافة المنتج");

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setForm({
          name: "", storeName: user?.storeName || "", description: "", category: "",
          price: "", quantity: "0", sku: "",
          certificates: "", materials: "", origin: "", weight: "0.0",
        });
        setSelectedFeatures([]);
        setImages([]);
      }, 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setDropdownOpen(false);
    navigate("/login");
  };

  const handleProfileClick = () => {
    if (!user) { navigate("/login"); return; }
    setDropdownOpen((prev) => !prev);
  };

  const handleDashboard = () => {
    setDropdownOpen(false);
    navigate(user?.role === "seller" ? "/seller/products" : "/");
  };

  return (
      <SellerLayout>
        <main className="ap-main">

          <div className="ap-topbar">
            <div className="ap-page-title">
              <span className="ap-arrow">←</span>
              <div>
                <h1>إضافة منتج جديد</h1>
                <p>أضف منتجك الصديق للبيئة إلى المتجر</p>
              </div>
            </div>
          </div>

          {submitted && (
            <div className="ap-alert green" style={{ marginBottom: 20 }}>
              <strong>✅ تم إرسال المنتج للمراجعة! سيتم نشره بعد موافقة الإدارة.</strong>
            </div>
          )}

          {error && (
            <div className="ap-alert red" style={{ marginBottom: 20 }}>
              <strong>❌ {error}</strong>
            </div>
          )}

          <div className="ap-alert green">
            <div className="ap-alert-header">
              <strong>إرشادات مهمة قبل إضافة المنتج</strong>
              <span className="ap-info-icon">ℹ</span>
            </div>
            <ul>
              <li>تأكد من أن المنتج صديق للبيئة ويتوافق مع معايير EcoBazaar</li>
              <li>استخدم صورًا عالية الجودة وواضحة للمنتج (800×800 بكسل على الأقل)</li>
              <li>اكتب وصفًا تفصيليًا ودقيقًا يشمل جميع المواصفات والفوائد البيئية</li>
              <li>حدد السعر بشكل عادل ومنافس مع مراعاة تكاليف الإنتاج المستدام</li>
              <li>تحقق من الكمية المتاحة لتجنب الطلبات الزائدة</li>
            </ul>
          </div>

          <div className="ap-alert red">
            <div className="ap-alert-header">
              <strong>تحذير: سياسات المنصة</strong>
              <span className="ap-info-icon">⊘</span>
            </div>
            <ul>
              <li>المنتجات المخالفة للمعايير البيئية سيتم رفضها من قبل الإدارة</li>
              <li>تقديم معلومات خاطئة أو مضللة قد يؤدي إلى تعليق حسابك</li>
              <li>يجب أن تكون جميع الشهادات البيئية المذكورة موثقة وصحيحة</li>
              <li>سيتم مراجعة المنتج من قبل فريق الجودة قبل نشره</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit}>

            {/* 1: المعلومات الأساسية */}
            <div className="ap-form-card">
              <div className="ap-section-header">
                <h2 className="ap-section-title">المعلومات الأساسية</h2>
                <span className="ap-badge green">مطلوب</span>
              </div>

              <div className="ap-form-group">
                <label className="ap-label">اسم المنتج <span className="ap-required">*</span></label>
                <input className="ap-input" name="name" value={form.name} onChange={handleChange}
                  placeholder="مثال: حقيبة قطنية قابلة لإعادة الاستخدام" required />
                <span className="ap-hint">استخدم اسمًا واضحًا ووصفيًا يساعد العملاء على فهم المنتج فورًا</span>
              </div>

              <div className="ap-form-group">
                <label className="ap-label">وصف المنتج <span className="ap-required">*</span></label>
                <textarea className="ap-textarea" name="description" value={form.description}
                  onChange={handleChange} rows={5}
                  placeholder="اكتب وصفًا تفصيليًا للمنتج وفوائده البيئية..." required />
                <span className="ap-hint">اذكر المواصفات، الفوائد البيئية، طريقة الاستخدام، والعناية بالمنتج</span>
              </div>

              {/* ✅ اسم المتجر — يتملى تلقائياً ومش قابل للتعديل */}
              <div className="ap-form-group">
                <label className="ap-label">اسم المتجر</label>
                <input
                  className="ap-input"
                  name="storeName"
                  value={form.storeName}
                  disabled
                  style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed", color: "#888" }}
                />
                <span className="ap-hint">اسم المتجر مرتبط بحسابك تلقائياً</span>
              </div>

              <div className="ap-row">
                <div className="ap-col">
                  <label className="ap-label">الفئة <span className="ap-required">*</span></label>
                  <select className="ap-select" name="category" value={form.category} onChange={handleChange} required>
                    <option value="">اختر الفئة</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                  <span className="ap-hint">اختر الفئة الأنسب لتسهيل عثور العملاء على منتجك</span>
                </div>
                <div className="ap-col">
                  <label className="ap-label">السعر (جنيه) <span className="ap-required">*</span></label>
                  <input className="ap-input" type="number" name="price" value={form.price}
                    onChange={handleChange} placeholder="0.00" min="0" step="0.01" required />
                  <span className="ap-hint">حدد سعرًا تنافسيًا يعكس القيمة والجودة البيئية</span>
                </div>
              </div>

              <div className="ap-row">
                <div className="ap-col">
                  <label className="ap-label">الكمية المتاحة <span className="ap-required">*</span></label>
                  <input className="ap-input" type="number" name="quantity" value={form.quantity}
                    onChange={handleChange} min="0" required />
                  <span className="ap-hint">سيتم خصم الكمية تلقائيًا عند كل عملية شراء</span>
                </div>
                <div className="ap-col">
                  <label className="ap-label">رقم التعريف (SKU)</label>
                  <input className="ap-input" name="sku" value={form.sku}
                    onChange={handleChange} placeholder="مثال: ECO-BAG-001" />
                  <span className="ap-hint">اختياري - يساعدك في تتبع وإدارة المخزون</span>
                </div>
              </div>
            </div>

            {/* 2: صور المنتج */}
            <div className="ap-form-card">
              <div className="ap-section-header">
                <h2 className="ap-section-title">صور المنتج</h2>
                <span className="ap-badge green">مطلوب</span>
              </div>
              <div className="ap-image-tips">
                <strong>نصائح لصور احترافية</strong>
                <ul>
                  <li>استخدم خلفية بيضاء أو محايدة لإبراز المنتج</li>
                  <li>التقط صورًا من زوايا مختلفة لعرض التفاصيل</li>
                  <li>800×800 بكسل على الأقل • أقل من 5 ميجابايت • JPG / PNG / WEBP</li>
                </ul>
              </div>
              <div className="ap-upload-grid">
                {images.map((img, i) => (
                  <div key={i} className="ap-image-thumb">
                    <img src={img.preview ?? img} alt="" />
                    <button type="button" className="ap-remove-btn" onClick={() => removeImage(i)}>✕</button>
                  </div>
                ))}
                {images.length < 6 && (
                  <div className="ap-upload-box" onClick={() => fileInputRef.current.click()}>
                    <span className="ap-upload-icon">↑</span>
                    <span className="ap-upload-text">رفع صورة</span>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple
                      style={{ display: "none" }} onChange={handleImageUpload} />
                  </div>
                )}
              </div>
              <span className="ap-hint">يمكنك رفع حتى 6 صور للمنتج</span>
            </div>

            {/* 3: الميزات البيئية */}
            <div className="ap-form-card">
              <div className="ap-section-header">
                <h2 className="ap-section-title">الميزات الصديقة للبيئة</h2>
                <span className="ap-badge green">مهم جداً</span>
              </div>
              <div className="ap-eco-tip">
                <span className="ap-info-icon">⊙</span>
                <span>اختيار الميزات البيئية الصحيحة يزيد من ثقة العملاء ويُحسّن ظهور منتجك في نتائج البحث</span>
              </div>
              <div className="ap-features-grid">
                {ecoFeatures.map((feature) => (
                  <label key={feature.id} className="ap-feature-item">
                    <input type="checkbox"
                      checked={selectedFeatures.includes(feature.id)}
                      onChange={() => toggleFeature(feature.id)} />
                    <span>{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4: معلومات إضافية */}
            <div className="ap-form-card">
              <div className="ap-section-header">
                <h2 className="ap-section-title">معلومات إضافية</h2>
                <span className="ap-badge gray">اختياري</span>
              </div>
              <div className="ap-form-group">
                <label className="ap-label">الشهادات البيئية</label>
                <input className="ap-input" name="certificates" value={form.certificates}
                  onChange={handleChange} placeholder="مثال: شهادة العضوية، ISO 14001، Fair Trade" />
                <span className="ap-hint">الشهادات البيئية تزيد من مصداقية منتجك وتجذب العملاء الواعين بيئيًا</span>
              </div>
              <div className="ap-form-group">
                <label className="ap-label">المواد المستخدمة</label>
                <textarea className="ap-textarea" name="materials" value={form.materials}
                  onChange={handleChange} rows={3}
                  placeholder="اذكر المواد المستخدمة في تصنيع المنتج..." />
                <span className="ap-hint">مثال: قطن عضوي 100%، خيزران طبيعي، بلاستيك معاد التدوير</span>
              </div>
              <div className="ap-row">
                <div className="ap-col">
                  <label className="ap-label">بلد المنشأ</label>
                  <input className="ap-input" name="origin" value={form.origin}
                    onChange={handleChange} placeholder="مثال: مصر" />
                  <span className="ap-hint">المنتجات المحلية تقلل البصمة الكربونية</span>
                </div>
                <div className="ap-col">
                  <label className="ap-label">الوزن (كجم)</label>
                  <input className="ap-input" type="number" name="weight" value={form.weight}
                    onChange={handleChange} min="0" step="0.1" />
                  <span className="ap-hint">يساعد في حساب تكلفة الشحن</span>
                </div>
              </div>
            </div>

            {/* 5: قائمة التحقق */}
            <div className="ap-checklist-card">
              <div className="ap-alert-header">
                <strong>✔ قبل الإرسال، تأكد من:</strong>
              </div>
              <ul>
                {checklist.map((item, i) => (
                  <li key={i}><span className="ap-check-dot">•</span> {item}</li>
                ))}
              </ul>
            </div>

            {/* أزرار */}
            <div className="ap-actions">
              <button type="submit" className="ap-submit-btn" disabled={loading || submitted}>
                {submitted
                  ? "✅ تم الإرسال للمراجعة!"
                  : loading
                  ? "⏳ جاري الإرسال..."
                  : "+ إضافة المنتج"}
              </button>
              <button type="button" className="ap-cancel-btn"
                onClick={() => navigate("/")}>إلغاء</button>
            </div>

          </form>
        </main>
 

      </SellerLayout>
     );
}




//  {/* ── Navbar ── */}
//       <div className="ap-navbar">
//         <div className="ap-navbar-left">
//           <span className="ap-logo-icon">🌿</span>
//           <div>
//             <div className="ap-logo-name">EcoBazaar</div>
//             <div className="ap-logo-sub">لوحة البائع</div>
//           </div>
//         </div>

//         <div className="ap-navbar-right">
//           <div className="profile-wrapper" ref={dropdownRef}>
//             <button className="nav-btn user-btn" onClick={handleProfileClick}>
//               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
//                 <circle cx="12" cy="7" r="4"/>
//               </svg>
//             </button>

//             {dropdownOpen && user && (
//               <div className="profile-dropdown">
//                 <div className="dropdown-user-info">
//                   <div className="dropdown-avatar">
//                     {user.fullName?.charAt(0)?.toUpperCase() || "U"}
//                   </div>
//                   <div>
//                     <div className="dropdown-name">{user.fullName}</div>
//                     <div className="dropdown-email">{user.email}</div>
//                   </div>
//                 </div>
//                 <div className="dropdown-divider" />
//                 <button className="dropdown-item" onClick={() => { setDropdownOpen(false); navigate("/profile"); }}>
//                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
//                     <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
//                   </svg>
//                   الملف الشخصي
//                 </button>
//                 <button className="dropdown-item" onClick={handleDashboard}>
//                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
//                     <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
//                     <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
//                   </svg>
//                   لوحة البائع
//                 </button>
//                 <div className="dropdown-divider" />
//                 <button className="dropdown-item logout-item" onClick={handleLogout}>
//                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
//                     <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
//                     <polyline points="16 17 21 12 16 7"/>
//                     <line x1="21" y1="12" x2="9" y2="12"/>
//                   </svg>
//                   تسجيل الخروج
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>



  // {/* Sidebar */}
  //       <aside className="ap-sidebar">
  //         <nav className="ap-nav">
  //           {navItems.map((item) => (
  //             <div
  //               key={item.label}
  //               className={`ap-nav-item ${item.active ? "active" : ""}`}
  //               onClick={() => item.path && navigate(item.path)}
  //               style={{ cursor: "pointer" }}
  //             >
  //               <span className="ap-nav-icon">{item.icon}</span>
  //               <span>{item.label}</span>
  //             </div>
  //           ))}
  //         </nav>
  //         <span id="ap-nav-logout" onClick={handleLogout}>← تسجيل الخروج</span>
  //       </aside>
