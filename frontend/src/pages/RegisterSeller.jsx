import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../assets/Auth.css";

export default function RegisterSeller() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    storeName: "",
    storeDescription: "",
    productCategory: "",
    commercialRegNumber: "",
    nationalIdNumber: "",
    taxNumber: "",
    website: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) =>
    setForm({ ...form, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // الحقول المطلوبة
    const required = ["fullName", "email", "phone", "storeName", "productCategory", "password",  "confirmPassword"];
    for (const f of required) {
      if (!form[f]) {
        document.getElementById(f)?.focus();
        setError(`Please fill in ${f}`);
        return;
      }
    }

    if (form.password !== form.confirmPassword) {
      document.getElementById("password")?.focus();
      setError("Passwords do not match.");
      return;
    }

    if (!form.agreeTerms) {
      setError("You must agree to the terms.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register/seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
const contentType = res.headers.get("content-type");
if (contentType && contentType.includes("application/json")) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");

  // ← ضيف السطرين دول
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  navigate("/seller/addproduct"); // ← بدل navigate("/login")
} else {
  const text = await res.text();
  throw new Error("Server returned HTML instead of JSON:\n" + text);
}
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-logo"><span>🌿</span></div>
        <h1 className="auth-title">إنشاء حساب بائع</h1>
        <p className="auth-subtitle">وابدأ البيع على EcoBazaar</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">

          {/* Personal Info */}
          <div className="field-group">
            <label>الاسم كامل</label>
            <input id="fullName" type="text" placeholder="اسم البائع" value={form.fullName} onChange={set("fullName")} dir="rtl" />
          </div>

          <div className="field-group">
            <label>البريد الإلكتروني</label>
            <input id="email" type="email" placeholder="البريد الإلكتروني" value={form.email} onChange={set("email")} dir="ltr" />
          </div>

          <div className="field-group">
            <label>رقم الهاتف</label>
            <input id="phone" type="tel" placeholder="رقم الهاتف" value={form.phone} onChange={set("phone")} dir="ltr" />
          </div>

          {/* Store Info */}
          <div className="section-divider"><span>بيانات المتجر والتحقق</span></div>

          <div className="field-group">
            <label>اسم المتجر</label>
            <input id="storeName" type="text" placeholder="اسم المتجر" value={form.storeName} onChange={set("storeName")} dir="rtl" />
          </div>

          <div className="field-group">
            <label>وصف المتجر</label>
            <input type="text" placeholder="وصف موجز عن متجرك" value={form.storeDescription} onChange={set("storeDescription")} dir="rtl" />
          </div>

          <div className="field-group">
            <label>فئة المنتجات</label>
            <select id="productCategory" value={form.productCategory} onChange={set("productCategory")}>
              <option value="">-- اختر فئة --</option>
              <option value="العناية الشخصية">🧴 العناية الشخصية</option>
              <option value="المنزل والحديقة">🏠 المنزل والحديقة</option>
              <option value="الأزياء المستدامة">👕 الأزياء المستدامة</option>
              <option value="الأطعمة العضوية">🥗 الأطعمة العضوية</option>
            </select>
          </div>

          <div className="field-group">
            <label>رقم السجل التجاري</label>
            <input type="text" placeholder="رقم السجل التجاري" value={form.commercialRegNumber} onChange={set("commercialRegNumber")} dir="ltr" />
          </div>

          <div className="field-group">
            <label>رقم البطاقة الوطنية</label>
            <input type="text" placeholder="رقم البطاقة الوطنية للتحقق" value={form.nationalIdNumber} onChange={set("nationalIdNumber")} dir="ltr" />
          </div>

          <div className="field-group">
            <label>الرقم الضريبي</label>
            <input type="text" placeholder="الرقم الضريبي" value={form.taxNumber} onChange={set("taxNumber")} dir="ltr" />
          </div>

          <div className="field-group">
            <label>الموقع الإلكتروني (اختياري)</label>
            <input type="url" placeholder="رابط الموقع" value={form.website} onChange={set("website")} dir="ltr" />
          </div>

          {/* Password */}
          <div className="field-group">
  <label>كلمة المرور</label>
  <input
    id="password"
    type="password"
    placeholder="كلمة المرور"
    value={form.password}
    onChange={(e) => setForm({ ...form, password: e.target.value })}
    dir="ltr"
  />
</div>

<div className="field-group">
  <label>تأكيد كلمة المرور</label>
  <input
    id="confirmPassword"
    type="password"
    placeholder="تأكيد كلمة المرور"
    value={form.confirmPassword}
    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
    dir="ltr"
  />
</div>

          <div className="field-checkbox">
            <input type="checkbox" id="terms-seller" checked={form.agreeTerms} onChange={set("agreeTerms")} />
            <label htmlFor="terms-seller">
              أوافق على <a href="#">الشروط والأحكام</a> و <a href="#">سياسة الخصوصية</a>
            </label>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : "إنشاء الحساب"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            هل لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link>
          </p>
          <p>
            تريد التسجيل كمشتري؟ <Link to="/register/buyer">سجل كمشتري</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
