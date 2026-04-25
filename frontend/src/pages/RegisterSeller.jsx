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
    commercialRegNumber: "",
    nationalIdNumber: "",
    taxNumber: "",
    website: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [nationalIdImage, setNationalIdImage] = useState(null);
  const [nationalIdPreview, setNationalIdPreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) =>
    setForm({ ...form, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setNationalIdPreview(reader.result);
    reader.readAsDataURL(file);

    setNationalIdImage(file);
  }

  async function uploadImageToCloudinary(file) {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "EcoBazaar");
      formData.append("folder", "national_ids");

      // ✅ السطر الصح
      const res = await fetch("https://api.cloudinary.com/v1_1/dnoygdytl/image/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("فشل رفع الصورة");
      const data = await res.json();
      return data.secure_url;
    } finally {
      setUploadingImage(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const required = ["fullName", "email", "phone", "storeName", "nationalIdNumber", "password", "confirmPassword"];
    for (const f of required) {
      if (!form[f]) {
        document.getElementById(f)?.focus();
        setError(`من فضلك املأ حقل ${f}`);
        return;
      }
    }

    if (!nationalIdImage) {
      document.getElementById("nationalIdImageGroup")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      setError("من فضلك ارفع صورة البطاقة الوطنية");
      return;
    }

    if (form.password !== form.confirmPassword) {
      document.getElementById("password")?.focus();
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    if (!form.agreeTerms) {
      setError("يجب الموافقة على الشروط والأحكام");
      return;
    }

    setLoading(true);

    try {
      const nationalIdImageUrl = await uploadImageToCloudinary(nationalIdImage);

      const res = await fetch("/api/auth/register/seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, nationalIdImage: nationalIdImageUrl }),
      });

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "فشل التسجيل");

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/seller/addproduct");
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

          <div className="field-group">
            <label>الاسم كامل <span style={{ color: "#e53935", fontSize: "12px" }}>*</span></label>
            <input id="fullName" type="text" placeholder="اسم البائع" value={form.fullName} onChange={set("fullName")} dir="rtl" />
          </div>

          <div className="field-group">
            <label>البريد الإلكتروني <span style={{ color: "#e53935", fontSize: "12px" }}>*</span></label>
            <input id="email" type="email" placeholder="البريد الإلكتروني" value={form.email} onChange={set("email")} dir="ltr" />
          </div>

          <div className="field-group">
            <label>رقم الهاتف <span style={{ color: "#e53935", fontSize: "12px" }}>*</span></label>
            <input id="phone" type="tel" placeholder="رقم الهاتف" value={form.phone} onChange={set("phone")} dir="ltr" />
          </div>

          <div className="section-divider"><span>بيانات المتجر والتحقق</span></div>

          <div className="field-group">
            <label>اسم المتجر <span style={{ color: "#e53935", fontSize: "12px" }}>*</span></label>
            <input id="storeName" type="text" placeholder="اسم المتجر" value={form.storeName} onChange={set("storeName")} dir="rtl" />
          </div>

          <div className="field-group">
            <label>وصف المتجر</label>
            <input type="text" placeholder="وصف موجز عن متجرك" value={form.storeDescription} onChange={set("storeDescription")} dir="rtl" />
          </div>

          <div className="field-group">
            <label>رقم السجل التجاري</label>
            <input type="text" placeholder="رقم السجل التجاري" value={form.commercialRegNumber} onChange={set("commercialRegNumber")} dir="ltr" />
          </div>

          <div className="field-group">
            <label>الرقم القومي <span style={{ color: "#e53935", fontSize: "12px" }}>*</span></label>
            <input id="nationalIdNumber" type="text" placeholder="رقم البطاقة الوطنية للتحقق" value={form.nationalIdNumber} onChange={set("nationalIdNumber")} dir="ltr" />
          </div>

          <div className="field-group" id="nationalIdImageGroup">
            <label>صورة البطاقة الشخصية <span style={{ color: "#e53935", fontSize: "12px" }}>*</span></label>
            <label
              className={`id-upload-label ${!nationalIdImage && error ? "id-upload-error" : ""}`}
              htmlFor="nationalIdImage"
            >
              {nationalIdPreview ? (
                <img src={nationalIdPreview} alt="البطاقة" className="id-preview" />
              ) : (
                <div className="id-upload-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <circle cx="8" cy="12" r="2"/>
                    <path d="M14 10h4M14 14h4"/>
                  </svg>
                  <span>اضغط لرفع صورة البطاقة</span>
                  <small>JPG, PNG — حتى 5MB</small>
                </div>
              )}
            </label>
            <input
              id="nationalIdImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            {nationalIdPreview && (
              <button
                type="button"
                className="remove-image-btn"
                onClick={() => { setNationalIdImage(null); setNationalIdPreview(""); }}
              >
                ✕ إزالة الصورة
              </button>
            )}
          </div>

          <div className="field-group">
            <label>الرقم الضريبي</label>
            <input type="text" placeholder="الرقم الضريبي" value={form.taxNumber} onChange={set("taxNumber")} dir="ltr" />
          </div>

          <div className="field-group">
            <label>الموقع الإلكتروني (اختياري)</label>
            <input type="url" placeholder="رابط الموقع" value={form.website} onChange={set("website")} dir="ltr" />
          </div>

          <div className="field-group">
            <label>كلمة المرور <span style={{ color: "#e53935", fontSize: "12px" }}>*</span></label>
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
            <label>تأكيد كلمة المرور <span style={{ color: "#e53935", fontSize: "12px" }}>*</span></label>
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

          <button type="submit" className="auth-submit-btn" disabled={loading || uploadingImage}>
            {uploadingImage ? "جارٍ رفع الصورة..." : loading ? <span className="spinner" /> : "إنشاء الحساب"}
          </button>
        </form>

        <div className="auth-links">
          <p>هل لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link></p>
          <p>تريد التسجيل كمشتري؟ <Link to="/register/buyer">سجل كمشتري</Link></p>
        </div>
      </div>
    </div>
  );
}