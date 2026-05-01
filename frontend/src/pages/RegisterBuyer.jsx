import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../assets/Auth.css";

export default function RegisterBuyer() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
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
    const required = ["fullName", "email", "phone", "password", "confirmPassword"];
    for (const f of required) {
      if (!form[f]) {
        document.getElementById(f)?.focus();
        setError(`Please fill in ${f}`);
        return;
      }
    }
 
   
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!form.agreeTerms) {
      setError("You must agree to the terms.");
      return;
    }
    setLoading(true);

    
    try {
      const res = await fetch("http://localhost:5000/api/auth/register/buyer", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(form),
});

     const data = await res.json();
if (!res.ok) throw new Error(data.error || "Registration failed");

localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));
navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span>🌿</span>
        </div>

        <h1 className="auth-title">إنشاء حساب مشتري</h1>
        <p className="auth-subtitle">وابدأ التسوق على EcoBazaar</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label>الاسم الكامل</label>
            <input id="fullName"
              type="text"
              placeholder="أدخل اسمك الكامل"
              value={form.fullName}
              onChange={set("fullName")}
              dir="rtl"
            />
          </div>

          <div className="field-group">
            <label>البريد الإلكتروني</label>
            <input id="email"
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={set("email")}
              dir="ltr"
            />
          </div>

          <div className="field-group">
            <label>رقم الهاتف</label>
            <input id="phone"
              type="tel"
              placeholder="01012345678"
              value={form.phone}
              onChange={set("phone")}
              dir="ltr"
            />
          </div>

          <div className="field-group">
            <label>كلمة المرور</label>
            <input id="password"
              type="password"
              placeholder="كلمة المرور"
              value={form.password}
              onChange={set("password")}
              dir="ltr"
            />
          </div>

          <div className="field-group">
            <label>تأكيد كلمة المرور</label>
            <input id="confirmPassword"
              type="password"
              placeholder="تأكيد كلمة المرور"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              dir="ltr"
            />
          </div>

          <div className="field-checkbox">
            <input 
              type="checkbox"
              id="terms-buyer"
              checked={form.agreeTerms}
              onChange={set("agreeTerms")}
            />
            <label htmlFor="terms-buyer">
              أوافق على <a href="#">الشروط والأحكام</a> و{" "}
              <a href="#">سياسة الخصوصية</a>
            </label>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : "إنشاء الحساب"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            هل لديك حساب بالفعل؟{" "}
            <Link to="/login">تسجيل الدخول</Link>
          </p>
          <p>
            تريد التسجيل كبائع؟{" "}
            <Link to="/register/seller">سجل كبائع</Link>
          </p>
        </div>
      </div>
    </div>
  );
}